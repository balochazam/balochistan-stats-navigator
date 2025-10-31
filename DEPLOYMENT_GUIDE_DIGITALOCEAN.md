# BBoS Deployment Guide - Ubuntu 22.04 on Digital Ocean

This guide covers deploying the BBoS (Balochistan Statistics Navigator) application on Ubuntu 22.04 server using Apache2 and PM2.

## Server Requirements

- Ubuntu 22.04 LTS
- Minimum 2GB RAM
- Node.js 20.x
- PostgreSQL (remote Aiven database)
- Apache2
- PM2

## Domain Configuration

- Domain: `bbos.cerbm.com`
- Custom Port: `5001` (to avoid conflicts with other apps)

---

## 1. Initial Server Setup

### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Required Dependencies
```bash
sudo apt install -y curl git build-essential
```

---

## 2. Install Node.js 20.x

```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

---

## 3. Install PM2 Process Manager

```bash
# Install PM2 globally
sudo npm install -g pm2

# Setup PM2 to start on boot
pm2 startup systemd
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
```

---

## 4. Clone and Setup Application

### Clone Repository
```bash
cd /var/www
sudo mkdir -p bbos
sudo chown -R $USER:$USER bbos
cd bbos

# Clone your repository (replace with your actual repo URL)
git clone <your-repo-url> .
```

### Install Dependencies
```bash
npm install
```

### Build Application
```bash
npm run build
```

---

## 5. Configure Environment Variables

Create `.env` file in the project root:

```bash
nano .env
```

Add the following environment variables:

```env
NODE_ENV=production
PORT=5001

# Remote PostgreSQL Database (Aiven)
REMOTE_DATABASE_URL=postgresql://avnadmin:AVNS_VDsa_x3fCM-vlgPZpbX@pg-22e1d53b-syedazambaloch-be27.d.aivencloud.com:14517/bbos

# Session Secret (generate a strong random string)
SESSION_SECRET=your-super-secret-random-string-change-this

# Application URL
APP_URL=https://bbos.cerbm.com
```

**Security Note:** Make sure to set restrictive permissions on the .env file:
```bash
chmod 600 .env
```

---

## 6. Create PM2 Ecosystem Configuration

Create `ecosystem.config.js` in the project root:

```bash
nano ecosystem.config.js
```

Add the following configuration:

```javascript
module.exports = {
  apps: [{
    name: 'bbos',
    script: './dist/index.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    autorestart: true,
    watch: false
  }]
};
```

### Create Logs Directory
```bash
mkdir -p logs
```

---

## 7. Start Application with PM2

```bash
# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Check application status
pm2 status

# View logs
pm2 logs bbos

# Monitor application
pm2 monit
```

### Useful PM2 Commands
```bash
# Restart application
pm2 restart bbos

# Stop application
pm2 stop bbos

# Delete application from PM2
pm2 delete bbos

# View application info
pm2 info bbos

# View real-time logs
pm2 logs bbos --lines 100
```

---

## 8. Install and Configure Apache2

### Install Apache2
```bash
sudo apt install -y apache2
```

### Enable Required Apache Modules
```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod ssl
sudo a2enmod rewrite
sudo a2enmod headers
```

### Create Virtual Host Configuration

Create a new Apache configuration file:

```bash
sudo nano /etc/apache2/sites-available/bbos.cerbm.com.conf
```

Add the following configuration:

```apache
<VirtualHost *:80>
    ServerName bbos.cerbm.com
    ServerAdmin admin@cerbm.com

    # Redirect HTTP to HTTPS
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}$1 [R=301,L]

    ErrorLog ${APACHE_LOG_DIR}/bbos-error.log
    CustomLog ${APACHE_LOG_DIR}/bbos-access.log combined
</VirtualHost>

<VirtualHost *:443>
    ServerName bbos.cerbm.com
    ServerAdmin admin@cerbm.com

    # SSL Configuration (will be auto-configured by Certbot)
    # SSLEngine on
    # SSLCertificateFile /etc/letsencrypt/live/bbos.cerbm.com/fullchain.pem
    # SSLCertificateKeyFile /etc/letsencrypt/live/bbos.cerbm.com/privkey.pem

    # Proxy Settings
    ProxyPreserveHost On
    ProxyPass / http://localhost:5001/
    ProxyPassReverse / http://localhost:5001/

    # WebSocket Support (if needed)
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /(.*)           ws://localhost:5001/$1 [P,L]
    RewriteCond %{HTTP:Upgrade} !=websocket [NC]
    RewriteRule /(.*)           http://localhost:5001/$1 [P,L]

    # Security Headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"

    ErrorLog ${APACHE_LOG_DIR}/bbos-ssl-error.log
    CustomLog ${APACHE_LOG_DIR}/bbos-ssl-access.log combined
</VirtualHost>
```

### Enable the Site
```bash
# Enable the new site
sudo a2ensite bbos.cerbm.com.conf

# Disable default site (optional)
sudo a2dissite 000-default.conf

# Test Apache configuration
sudo apache2ctl configtest

# Restart Apache
sudo systemctl restart apache2
```

---

## 9. Setup SSL Certificate with Let's Encrypt

### Install Certbot
```bash
sudo apt install -y certbot python3-certbot-apache
```

### Obtain SSL Certificate
```bash
sudo certbot --apache -d bbos.cerbm.com
```

Follow the prompts:
- Enter email address
- Agree to terms of service
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

### Auto-renewal Setup
Certbot automatically sets up a cron job for renewal. Test it:

```bash
sudo certbot renew --dry-run
```

---

## 10. Configure Firewall (UFW)

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow OpenSSH

# Allow Apache
sudo ufw allow 'Apache Full'

# Check status
sudo ufw status
```

---

## 11. Update Application Server Configuration

Update `server/index.ts` to use the PORT from environment:

```typescript
const port = process.env.PORT ? parseInt(process.env.PORT) : 5001;
```

This is already configured in the current codebase.

---

## 12. Database Migration (if needed)

If you need to push schema changes to the remote database:

```bash
npm run db:push
```

---

## 13. Monitoring and Logs

### View Application Logs
```bash
# PM2 logs
pm2 logs bbos

# Apache logs
sudo tail -f /var/log/apache2/bbos-access.log
sudo tail -f /var/log/apache2/bbos-error.log
```

### Monitor Application
```bash
# PM2 monitoring
pm2 monit

# System resources
htop
```

---

## 14. Deployment Checklist

- [ ] Server updated and secured
- [ ] Node.js 20.x installed
- [ ] PM2 installed and configured
- [ ] Application cloned and dependencies installed
- [ ] Application built successfully
- [ ] Environment variables configured in `.env`
- [ ] PM2 ecosystem.config.js created
- [ ] Application started with PM2
- [ ] PM2 configuration saved
- [ ] Apache2 installed and modules enabled
- [ ] Virtual host configured for bbos.cerbm.com
- [ ] DNS A record pointing to server IP
- [ ] SSL certificate obtained and configured
- [ ] Firewall configured
- [ ] Application accessible via https://bbos.cerbm.com

---

## 15. Updating the Application

When you need to deploy updates:

```bash
# Navigate to application directory
cd /var/www/bbos

# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Rebuild application
npm run build

# Restart PM2 application
pm2 restart bbos

# Check status
pm2 status
pm2 logs bbos --lines 50
```

---

## 16. Troubleshooting

### Application Won't Start
```bash
# Check PM2 logs
pm2 logs bbos --lines 100

# Check if port is in use
sudo lsof -i :5001

# Verify environment variables
pm2 env bbos
```

### Apache Issues
```bash
# Check Apache status
sudo systemctl status apache2

# Check Apache error logs
sudo tail -f /var/log/apache2/error.log

# Test Apache configuration
sudo apache2ctl configtest
```

### Database Connection Issues
```bash
# Test database connection
psql "postgresql://avnadmin:AVNS_VDsa_x3fCM-vlgPZpbX@pg-22e1d53b-syedazambaloch-be27.d.aivencloud.com:14517/bbos"
```

### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew --force-renewal
```

---

## 17. Security Best Practices

1. **Keep System Updated:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Regular Backups:**
   - Backup database regularly
   - Backup application files
   - Backup Apache configuration

3. **Monitor Logs:**
   - Set up log rotation
   - Monitor for suspicious activity

4. **Secure Environment Variables:**
   - Never commit `.env` to git
   - Use strong SESSION_SECRET

5. **Database Security:**
   - Use SSL for database connections
   - Restrict database access by IP if possible

---

## Support

For issues or questions:
- Check application logs: `pm2 logs bbos`
- Check Apache logs: `sudo tail -f /var/log/apache2/bbos-error.log`
- Monitor system resources: `pm2 monit`

---

**Last Updated:** January 2025
