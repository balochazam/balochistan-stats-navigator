# SDG Data Management Platform - DigitalOcean Deployment Guide

## Complete Step-by-Step Guide for Ubuntu Droplet Deployment

---

## 🚀 Phase 1: DigitalOcean Droplet Setup

### 1.1 Create Droplet
1. **Log into DigitalOcean**
2. **Create Droplet:**
   - **Image:** Ubuntu 22.04 (LTS) x64
   - **Plan:** Basic ($12/month minimum - 2GB RAM, 1 CPU, 50GB SSD)
   - **Authentication:** SSH Key (recommended) or Password
   - **Hostname:** `sdg-platform` or your choice
   - **Backups:** Enable (recommended)

### 1.2 Initial Server Access
```bash
# Connect to your droplet (replace YOUR_DROPLET_IP)
ssh root@YOUR_DROPLET_IP

# Update system packages
apt update && apt upgrade -y

# Install essential tools
apt install -y curl wget unzip git htop nano ufw fail2ban
```

### 1.3 Create Non-Root User
```bash
# Create application user
adduser sdgadmin
usermod -aG sudo sdgadmin

# Switch to new user
su - sdgadmin
```

---

## 🔧 Phase 2: Install Required Dependencies

### 2.1 Install Node.js 20
```bash
# Install Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### 2.2 Install PostgreSQL 15
```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user for your application
sudo -u postgres psql

-- In PostgreSQL prompt:
CREATE DATABASE sdg_platform;
CREATE USER sdguser WITH PASSWORD 'your_secure_password_here';
ALTER ROLE sdguser SET client_encoding TO 'utf8';
ALTER ROLE sdguser SET default_transaction_isolation TO 'read committed';
ALTER ROLE sdguser SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE sdg_platform TO sdguser;
ALTER USER sdguser CREATEDB;  -- Needed for extensions
\q
```

### 2.3 Install PM2 Process Manager
```bash
# Install PM2 globally
sudo npm install -g pm2

# Setup PM2 startup script
pm2 startup
# Follow the instructions PM2 provides (run the command it shows)
```

### 2.4 Install Nginx
```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 🗄️ Phase 3: Database Setup and Import

### 3.1 Configure PostgreSQL for Remote Access
```bash
# Edit PostgreSQL configuration
sudo nano /etc/postgresql/15/main/postgresql.conf

# Find and modify this line:
listen_addresses = 'localhost'

# Edit access control
sudo nano /etc/postgresql/15/main/pg_hba.conf

# Add this line for local connections:
local   all             sdguser                                 md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 3.2 Import Your Database Backup
```bash
# First, copy your backup file to the server
# On your local machine, upload the backup:
scp database_backup_complete.sql sdgadmin@YOUR_DROPLET_IP:/home/sdgadmin/

# On the server, import the backup:
cd /home/sdgadmin
psql -U sdguser -d sdg_platform -f database_backup_complete.sql

# Verify the import
psql -U sdguser -d sdg_platform -c "SELECT COUNT(*) FROM sdg_goals;"
# Should return 17 (number of SDG goals)

psql -U sdguser -d sdg_platform -c "SELECT COUNT(*) FROM profiles;"
# Should show your user profiles
```

---

## 📁 Phase 4: Application Deployment

### 4.1 Clone and Setup Application
```bash
# Create application directory
sudo mkdir -p /var/www/sdg-platform
sudo chown sdgadmin:sdgadmin /var/www/sdg-platform

# Navigate to application directory
cd /var/www/sdg-platform

# If you have your code in a git repository:
git clone YOUR_REPOSITORY_URL .

# Or if uploading manually, create the structure:
# Upload your entire project to /var/www/sdg-platform
```

### 4.2 Install Dependencies and Build
```bash
cd /var/www/sdg-platform

# Install dependencies
npm install

# Build the application
npm run build

# Verify the build
ls -la client/dist  # Should show built files
```

### 4.3 Environment Configuration
```bash
# Create production environment file
nano .env

# Add these environment variables:
```

```env
# Database Configuration
DATABASE_URL=postgresql://sdguser:your_secure_password_here@localhost:5432/sdg_platform
PGHOST=localhost
PGPORT=5432
PGDATABASE=sdg_platform
PGUSER=sdguser
PGPASSWORD=your_secure_password_here

# Application Configuration
NODE_ENV=production
PORT=3000
SESSION_SECRET=your_very_long_secure_session_secret_here

# Security
BCRYPT_ROUNDS=12

# Optional: If you plan to use external APIs
# OPENAI_API_KEY=your_openai_key_if_needed
```

### 4.4 Test Application Locally
```bash
# Test the application
npm start

# In another terminal, test if it's working:
curl http://localhost:3000
# Should return your application's response

# Stop the test (Ctrl+C)
```

---

## ⚙️ Phase 5: Process Management with PM2

### 5.1 Create PM2 Configuration
```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'sdg-platform',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/sdg-platform',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/sdg-platform-error.log',
    out_file: '/var/log/pm2/sdg-platform-out.log',
    log_file: '/var/log/pm2/sdg-platform-combined.log',
    time: true
  }]
};
```

### 5.2 Start Application with PM2
```bash
# Create log directory
sudo mkdir -p /var/log/pm2
sudo chown sdgadmin:sdgadmin /var/log/pm2

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Check application status
pm2 status
pm2 logs sdg-platform
```

---

## 🌐 Phase 6: Nginx Configuration

### 6.1 Create Nginx Server Block
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/sdg-platform
```

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN.com www.YOUR_DOMAIN.com;  # Replace with your domain
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Static files
    location /assets {
        alias /var/www/sdg-platform/client/dist/assets;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # File upload size
    client_max_body_size 50M;
}
```

### 6.2 Enable Nginx Site
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/sdg-platform /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🔒 Phase 7: SSL/HTTPS Setup with Let's Encrypt

### 7.1 Install Certbot
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx
```

### 7.2 Obtain SSL Certificate
```bash
# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d YOUR_DOMAIN.com -d www.YOUR_DOMAIN.com

# Follow the prompts:
# - Enter your email address
# - Agree to terms of service
# - Choose whether to share email with EFF
# - Select redirect option (recommended: 2 - redirect HTTP to HTTPS)
```

### 7.3 Auto-renewal Setup
```bash
# Test auto-renewal
sudo certbot renew --dry-run

# The auto-renewal cron job is automatically created
```

---

## 🛡️ Phase 8: Security Configuration

### 8.1 Configure Firewall (UFW)
```bash
# Enable UFW
sudo ufw enable

# Allow SSH (important!)
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Allow PostgreSQL only from localhost (security)
sudo ufw allow from 127.0.0.1 to any port 5432

# Check firewall status
sudo ufw status verbose
```

### 8.2 Configure Fail2Ban
```bash
# Create Nginx jail for Fail2Ban
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[nginx-http-auth]
enabled = true

[nginx-noscript]
enabled = true

[nginx-badbots]
enabled = true

[nginx-noproxy]
enabled = true
```

```bash
# Restart Fail2Ban
sudo systemctl restart fail2ban

# Check status
sudo fail2ban-client status
```

---

## 📊 Phase 9: Monitoring and Logs

### 9.1 Setup Log Rotation
```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/sdg-platform
```

```bash
/var/log/pm2/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 sdgadmin sdgadmin
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 9.2 Monitoring Commands
```bash
# Check application status
pm2 status
pm2 monit

# View logs
pm2 logs sdg-platform
pm2 logs sdg-platform --lines 100

# Check system resources
htop
df -h
free -h

# Check Nginx status
sudo systemctl status nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check PostgreSQL
sudo systemctl status postgresql
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
```

---

## 🚀 Phase 10: Domain Configuration and Go-Live

### 10.1 DNS Configuration
1. **In your domain registrar:**
   - Create an A record pointing to your droplet's IP address
   - `YOUR_DOMAIN.com` → `YOUR_DROPLET_IP`
   - `www.YOUR_DOMAIN.com` → `YOUR_DROPLET_IP`

2. **Wait for DNS propagation (5-60 minutes)**
   - Test with: `nslookup YOUR_DOMAIN.com`

### 10.2 Final Testing
```bash
# Test your domain
curl -I https://YOUR_DOMAIN.com
# Should return 200 OK

# Test the application functionality
# Open browser and navigate to https://YOUR_DOMAIN.com
```

---

## 🔄 Phase 11: Backup and Maintenance Scripts

### 11.1 Create Backup Script
```bash
# Create backup script
nano /home/sdgadmin/backup_database.sh
```

```bash
#!/bin/bash

# Database backup script
BACKUP_DIR="/home/sdgadmin/backups"
DB_NAME="sdg_platform"
DB_USER="sdguser"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/sdg_backup_$DATE.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
pg_dump -U $DB_USER -h localhost $DB_NAME > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Keep only last 30 days of backups
find $BACKUP_DIR -name "sdg_backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

```bash
# Make script executable
chmod +x /home/sdgadmin/backup_database.sh

# Test backup script
./backup_database.sh

# Add to crontab for daily backups at 2 AM
crontab -e
# Add this line:
0 2 * * * /home/sdgadmin/backup_database.sh
```

### 11.2 Application Update Script
```bash
# Create update script
nano /home/sdgadmin/update_app.sh
```

```bash
#!/bin/bash

APP_DIR="/var/www/sdg-platform"
cd $APP_DIR

echo "Updating SDG Platform..."

# Pull latest changes (if using git)
git pull origin main

# Install dependencies
npm install

# Build application
npm run build

# Restart PM2 application
pm2 restart sdg-platform

echo "Update completed!"
```

```bash
# Make script executable
chmod +x /home/sdgadmin/update_app.sh
```

---

## 🎯 Phase 12: Go-Live Checklist

### Pre-Launch Verification
- [ ] **Server Setup Complete**
  - [ ] Ubuntu droplet created and configured
  - [ ] Non-root user created with sudo access
  - [ ] All dependencies installed (Node.js, PostgreSQL, Nginx, PM2)

- [ ] **Database**
  - [ ] PostgreSQL running and configured
  - [ ] Database backup imported successfully  
  - [ ] All tables and data verified
  - [ ] User authentication working

- [ ] **Application**
  - [ ] Code deployed to `/var/www/sdg-platform`
  - [ ] Environment variables configured
  - [ ] Application building and starting successfully
  - [ ] PM2 managing application process

- [ ] **Web Server**
  - [ ] Nginx configured and running
  - [ ] Domain pointing to droplet IP
  - [ ] SSL certificate installed and working
  - [ ] HTTPS redirect enabled

- [ ] **Security**
  - [ ] Firewall (UFW) enabled and configured
  - [ ] Fail2Ban configured for protection
  - [ ] Non-root user for application
  - [ ] Database secured with strong passwords

- [ ] **Monitoring**
  - [ ] PM2 monitoring active
  - [ ] Log rotation configured
  - [ ] Backup script created and scheduled
  - [ ] Basic monitoring commands verified

### Final Launch Steps
1. **Update Nginx config with your actual domain**
2. **Run SSL certificate setup**  
3. **Test all functionality thoroughly**
4. **Monitor logs for first 24 hours**
5. **Create first admin user via application**

---

## 📞 Troubleshooting Common Issues

### Application Won't Start
```bash
# Check PM2 logs
pm2 logs sdg-platform

# Check if port is in use
netstat -tlnp | grep :3000

# Restart everything
pm2 restart sdg-platform
sudo systemctl restart nginx
```

### Database Connection Issues
```bash
# Test database connection
psql -U sdguser -d sdg_platform -c "SELECT version();"

# Check PostgreSQL status
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

### SSL Issues
```bash
# Renew SSL certificate
sudo certbot renew

# Test SSL configuration
sudo nginx -t
curl -I https://YOUR_DOMAIN.com
```

### Performance Issues
```bash
# Check system resources
htop
free -h
df -h

# Check application performance
pm2 monit

# Check PostgreSQL performance
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
```

---

## 🎉 Congratulations!

Your SDG Data Management Platform is now deployed and ready for production use!

**Access your application at:** `https://YOUR_DOMAIN.com`

**Key Management Commands:**
- **Restart app:** `pm2 restart sdg-platform`  
- **View logs:** `pm2 logs sdg-platform`
- **Check status:** `pm2 status`
- **Backup database:** `./backup_database.sh`
- **Update application:** `./update_app.sh`

**Remember to:**
- Monitor logs regularly for the first few weeks
- Keep system packages updated: `sudo apt update && sudo apt upgrade`
- Monitor SSL certificate expiration (auto-renews)
- Run regular database backups
- Monitor server resources and scale as needed

Your platform is now live and ready to serve the people of Balochistan with authentic SDG data management! 🎯