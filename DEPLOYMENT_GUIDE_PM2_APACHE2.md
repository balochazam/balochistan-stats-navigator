# 🚀 BBoS Production Deployment Guide - Ubuntu + Apache2 + PM2

**Target Environment:** Ubuntu server with Apache2 and PM2 managing multiple applications

**Domain:** `bbos.cerbm.com`

**Stack:** Node.js 20 + PostgreSQL (Aiven) + PM2 + Apache2 + Let's Encrypt SSL

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ Ubuntu 20.04/22.04 LTS server with root/sudo access
- ✅ Apache2 already installed and running other apps
- ✅ PM2 already managing other Node.js applications
- ✅ Aiven PostgreSQL database provisioned and accessible
- ✅ Domain `bbos.cerbm.com` DNS pointing to your server IP

---

## 🎯 Overview

This guide deploys BBoS alongside your existing applications by:
1. Using a **unique port (5001)** to avoid conflicts with other apps
2. Creating a dedicated Apache2 virtual host for `bbos.cerbm.com`
3. Running BBoS under PM2 with its own process name
4. Connecting to your existing Aiven PostgreSQL database

---

## Phase 1: Server Preparation

### 1.1 Check Existing Port Usage

First, identify which ports are already in use to avoid conflicts:

```bash
# Check ports currently in use
sudo netstat -tulpn | grep LISTEN
# or
sudo ss -tulpn | grep LISTEN

# List PM2 processes and their ports
pm2 list
pm2 env <app-name>  # Check PORT for each app
```

**Common Port Assignments:**
- Port 3000: Often used by first Node app
- Port 3001-3010: Typically assigned to subsequent apps
- **Port 5001**: We'll use this for BBoS (adjust if taken)

### 1.2 Verify Node.js Version

```bash
# Check Node.js version (should be 20.x)
node --version

# If not installed or wrong version:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify npm
npm --version
```

### 1.3 Verify PM2 Installation

```bash
# Check if PM2 is installed
pm2 --version

# If not installed:
sudo npm install -g pm2
```

---

## Phase 2: Application Setup

### 2.1 Create Application Directory

```bash
# Create directory for BBoS
sudo mkdir -p /var/www/bbos
sudo chown -R $USER:$USER /var/www/bbos
cd /var/www/bbos
```

### 2.2 Clone Repository

```bash
# Clone your repository
git clone https://github.com/yourusername/bbos-platform.git .

# Or if you're copying from another location:
# rsync -av /path/to/local/bbos/ /var/www/bbos/
```

### 2.3 Install Dependencies

```bash
# Install npm packages
npm install

# Build the application
npm run build
```

**Important:** Ensure the build completes successfully. The production server will serve from the `dist/public/` directory.

---

## Phase 3: Environment Configuration

### 3.1 Create Production Environment File

```bash
# Create .env file in /var/www/bbos/
nano .env
```

### 3.2 Configure Environment Variables

```env
# =================================================================
# APPLICATION SETTINGS
# =================================================================
NODE_ENV=production
PORT=5001
HOST=127.0.0.1

# =================================================================
# AIVEN POSTGRESQL DATABASE (your existing database)
# =================================================================
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
REMOTE_DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# PostgreSQL connection details (for reference)
PGHOST=your-aiven-host.aivencloud.com
PGPORT=12345
PGUSER=avnadmin
PGPASSWORD=your-aiven-password
PGDATABASE=bbos_production

# =================================================================
# SESSION CONFIGURATION
# =================================================================
SESSION_SECRET=generate-a-unique-64-character-secret-key-here

# =================================================================
# OPTIONAL: Override defaults if needed
# =================================================================
# SESSION_TTL=86400
# SERVER_TIMEOUT=60000
```

### 3.3 Generate Secure Session Secret

```bash
# Generate a strong random session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy the output and paste it as SESSION_SECRET in your .env file
```

### 3.4 Secure Environment File

```bash
# Set restrictive permissions on .env
chmod 600 .env

# Verify ownership
ls -la .env
# Should show: -rw------- 1 youruser youruser
```

---

## Phase 4: PM2 Process Configuration

### 4.1 Create PM2 Ecosystem File

```bash
# Create PM2 configuration
nano ecosystem.config.js
```

### 4.2 PM2 Configuration Content

```javascript
module.exports = {
  apps: [{
    name: 'bbos',                          // Unique name for PM2
    script: './dist/index.js',             // Built production file
    cwd: '/var/www/bbos',                  // Working directory
    instances: 1,                          // Single instance (can scale later)
    exec_mode: 'fork',                     // Fork mode for single instance
    
    // Environment variables
    env_production: {
      NODE_ENV: 'production',
      PORT: 5001,                          // Unique port (adjust if needed)
      HOST: '127.0.0.1',                   // Only accessible via Apache proxy
    },
    
    // Load .env file
    env_file: '/var/www/bbos/.env',
    
    // Auto-restart configuration
    autorestart: true,
    watch: false,                          // Don't watch files in production
    max_memory_restart: '1G',              // Restart if memory exceeds 1GB
    
    // Restart policy
    min_uptime: '10s',                     // Min uptime before considered stable
    max_restarts: 10,                      // Max restart attempts
    restart_delay: 4000,                   // Wait 4s between restarts
    
    // Logging
    error_file: '/var/www/bbos/logs/pm2-error.log',
    out_file: '/var/www/bbos/logs/pm2-out.log',
    log_file: '/var/www/bbos/logs/pm2-combined.log',
    time: true,                            // Prefix logs with timestamp
    
    // Cluster settings (if scaling to multiple instances later)
    // instances: 2,
    // exec_mode: 'cluster',
  }]
};
```

### 4.3 Create Logs Directory

```bash
# Create directory for PM2 logs
mkdir -p /var/www/bbos/logs
```

### 4.4 Start Application with PM2

```bash
# Start the application
cd /var/www/bbos
pm2 start ecosystem.config.js --env production

# Verify it's running
pm2 list

# Check logs
pm2 logs bbos --lines 50

# Monitor in real-time
pm2 monit
```

### 4.5 Test Application Locally

```bash
# Test that the app responds on port 5001
curl http://localhost:5001/health

# Should return: {"status":"ok"}

# Test the ready endpoint
curl http://localhost:5001/ready

# Should return: {"status":"ready","database":"connected"}
```

### 4.6 Save PM2 Configuration

```bash
# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot (if not already done)
pm2 startup systemd

# Follow the command it outputs, which looks like:
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u youruser --hp /home/youruser

# Then save again
pm2 save
```

---

## Phase 5: Apache2 Configuration

### 5.1 Check Existing Apache Virtual Hosts

```bash
# List existing sites
ls -la /etc/apache2/sites-available/
ls -la /etc/apache2/sites-enabled/

# View an existing site config for reference
cat /etc/apache2/sites-enabled/*.conf
```

### 5.2 Create Virtual Host for BBoS

```bash
# Create new virtual host configuration
sudo nano /etc/apache2/sites-available/bbos.cerbm.com.conf
```

### 5.3 Apache Virtual Host Configuration

```apache
# HTTP Virtual Host - Redirects to HTTPS
<VirtualHost *:80>
    ServerName bbos.cerbm.com
    ServerAdmin admin@cerbm.com

    # Redirect all HTTP traffic to HTTPS
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}$1 [R=301,L]

    # Let's Encrypt verification (before SSL is set up)
    Alias /.well-known/acme-challenge /var/www/letsencrypt/.well-known/acme-challenge
    <Directory /var/www/letsencrypt/.well-known/acme-challenge>
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/bbos-error.log
    CustomLog ${APACHE_LOG_DIR}/bbos-access.log combined
</VirtualHost>

# HTTPS Virtual Host - Main application
<VirtualHost *:443>
    ServerName bbos.cerbm.com
    ServerAdmin admin@cerbm.com

    # SSL Configuration (will be added by certbot)
    # SSLEngine on
    # SSLCertificateFile /etc/letsencrypt/live/bbos.cerbm.com/fullchain.pem
    # SSLCertificateKeyFile /etc/letsencrypt/live/bbos.cerbm.com/privkey.pem

    # Security Headers
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"

    # Proxy Configuration
    ProxyPreserveHost On
    ProxyRequests Off
    
    # Set timeout for long-running requests
    ProxyTimeout 300
    
    # Trust the proxy for Express session handling
    RequestHeader set X-Forwarded-Proto "https"
    RequestHeader set X-Forwarded-Port "443"

    # Proxy to Node.js application on port 5001
    ProxyPass / http://127.0.0.1:5001/
    ProxyPassReverse / http://127.0.0.1:5001/

    # WebSocket support (if needed for real-time features)
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /(.*)           ws://127.0.0.1:5001/$1 [P,L]

    # Logging
    ErrorLog ${APACHE_LOG_DIR}/bbos-error.log
    CustomLog ${APACHE_LOG_DIR}/bbos-access.log combined
</VirtualHost>
```

### 5.4 Enable Required Apache Modules

```bash
# Enable necessary Apache modules
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod proxy_wstunnel
sudo a2enmod headers
sudo a2enmod rewrite
sudo a2enmod ssl

# Verify modules are enabled
apache2ctl -M | grep -E 'proxy|headers|rewrite|ssl'
```

### 5.5 Enable Site and Test Configuration

```bash
# Enable the new site
sudo a2ensite bbos.cerbm.com.conf

# Test Apache configuration
sudo apache2ctl configtest

# Should return: Syntax OK

# If Syntax OK, reload Apache
sudo systemctl reload apache2

# Check Apache status
sudo systemctl status apache2
```

### 5.6 Create Let's Encrypt Directory

```bash
# Create directory for Let's Encrypt challenges
sudo mkdir -p /var/www/letsencrypt/.well-known/acme-challenge
sudo chown -R www-data:www-data /var/www/letsencrypt
```

---

## Phase 6: SSL Certificate Setup

### 6.1 Install Certbot (if not already installed)

```bash
# Install Certbot for Apache
sudo apt update
sudo apt install -y certbot python3-certbot-apache
```

### 6.2 Obtain SSL Certificate

```bash
# Get SSL certificate for bbos.cerbm.com
sudo certbot --apache -d bbos.cerbm.com

# Follow the prompts:
# - Enter email address
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)
```

### 6.3 Verify SSL Configuration

```bash
# Test SSL certificate
sudo certbot certificates

# Test auto-renewal
sudo certbot renew --dry-run
```

### 6.4 Configure Auto-Renewal

```bash
# Certbot should auto-configure renewal, verify cron job exists
sudo systemctl status certbot.timer

# Or check cron
sudo crontab -l | grep certbot

# If missing, add to root crontab:
sudo crontab -e
# Add this line:
0 3 * * * certbot renew --quiet --post-hook "systemctl reload apache2"
```

---

## Phase 7: Database Setup & Migration

### 7.1 Test Database Connection

```bash
# Test connection to Aiven PostgreSQL
cd /var/www/bbos

# Use Node.js to test (create test script)
node -e "
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect()
  .then(() => { console.log('✅ Database connected'); client.end(); })
  .catch(err => { console.error('❌ Database error:', err.message); });
"
```

### 7.2 Run Database Migrations

```bash
# If you have Drizzle migrations
npm run db:push

# Or if using a migration script
npm run migrate
```

### 7.3 Verify Database Tables

```bash
# Connect to Aiven database
psql "$DATABASE_URL"

# List tables
\dt

# Check session table exists
SELECT * FROM session LIMIT 1;

# Check user tables
SELECT COUNT(*) FROM profiles;

# Exit
\q
```

---

## Phase 8: Verification & Testing

### 8.1 Application Health Checks

```bash
# Test health endpoint
curl http://localhost:5001/health
# Expected: {"status":"ok"}

# Test ready endpoint
curl http://localhost:5001/ready
# Expected: {"status":"ready","database":"connected"}

# Test via domain (after SSL setup)
curl https://bbos.cerbm.com/health
# Expected: {"status":"ok"}
```

### 8.2 PM2 Status Verification

```bash
# Check PM2 process
pm2 list

# Should show:
# ┌─────┬──────┬─────────┬──────┬───────┬────────┬─────────┬────────┬─────┬───────────┬──────┬──────────┐
# │ id  │ name │ mode    │ ↺    │ status│ cpu    │ memory  │        │     │           │      │          │
# ├─────┼──────┼─────────┼──────┼───────┼────────┼─────────┼────────┼─────┼───────────┼──────┼──────────┤
# │ 0   │ bbos │ fork    │ 0    │ online│ 0%     │ 45.2mb  │        │     │           │      │ disabled │
# └─────┴──────┴─────────┴──────┴───────┴────────┴─────────┴────────┴─────┴───────────┴──────┴──────────┘

# Check detailed info
pm2 show bbos

# Monitor real-time
pm2 monit
```

### 8.3 Apache Status Verification

```bash
# Check Apache status
sudo systemctl status apache2

# Check virtual hosts
sudo apache2ctl -S

# Should show bbos.cerbm.com:443 in the list

# Test proxy
curl -I https://bbos.cerbm.com
# Should return: HTTP/2 200
```

### 8.4 Test Application Functionality

```bash
# Test login page
curl https://bbos.cerbm.com/auth

# Test temporary signup page (if created)
curl https://bbos.cerbm.com/temp-signup

# Test API endpoint
curl https://bbos.cerbm.com/api/auth/user
# Expected: {"error":"Not authenticated"}
```

### 8.5 Browser Testing

Open your browser and test:
1. Navigate to `https://bbos.cerbm.com`
2. Verify SSL certificate is valid (green padlock)
3. Test signup at `/temp-signup`
4. Create admin account
5. Log in at `/auth`
6. Verify dashboard loads
7. Test creating forms, schedules, etc.

---

## Phase 9: Monitoring & Maintenance

### 9.1 View Application Logs

```bash
# PM2 logs
pm2 logs bbos

# Last 100 lines
pm2 logs bbos --lines 100

# Follow logs in real-time
pm2 logs bbos --lines 0

# Apache logs
sudo tail -f /var/log/apache2/bbos-error.log
sudo tail -f /var/log/apache2/bbos-access.log
```

### 9.2 PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# CPU and memory usage
pm2 status

# Detailed app info
pm2 show bbos
```

### 9.3 Restart Application

```bash
# Restart BBoS only
pm2 restart bbos

# Restart all PM2 apps
pm2 restart all

# Reload with zero-downtime (cluster mode)
pm2 reload bbos

# Stop BBoS
pm2 stop bbos

# Start BBoS
pm2 start bbos
```

### 9.4 Update Application

```bash
# Pull latest code
cd /var/www/bbos
git pull origin main

# Install any new dependencies
npm install

# Rebuild
npm run build

# Restart PM2 process
pm2 restart bbos

# Verify
pm2 logs bbos --lines 50
```

### 9.5 Database Backup

```bash
# Create backup script
sudo nano /var/www/bbos/scripts/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/www/bbos/backups"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="bbos_backup_$DATE.sql"

mkdir -p $BACKUP_DIR

# Backup database (using Aiven connection)
pg_dump "$DATABASE_URL" > $BACKUP_DIR/$FILENAME

# Compress
gzip $BACKUP_DIR/$FILENAME

# Delete backups older than 30 days
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: $FILENAME.gz"
```

```bash
# Make executable
chmod +x /var/www/bbos/scripts/backup-db.sh

# Add to crontab for daily backups at 2 AM
crontab -e
# Add:
0 2 * * * /var/www/bbos/scripts/backup-db.sh >> /var/www/bbos/logs/backup.log 2>&1
```

---

## Phase 10: Security Hardening

### 10.1 Firewall Configuration

```bash
# Check UFW status
sudo ufw status

# If not active, configure:
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Apache Full'
sudo ufw enable

# Verify
sudo ufw status verbose
```

### 10.2 Remove Temporary Signup Endpoint

**After creating your admin account**, remove the temporary signup page for security:

```bash
# Edit routes.ts to remove temp-signup endpoint
nano server/routes.ts
# Delete lines 17-55 (the temp-signup route)

# Edit App.tsx to remove the route
nano client/src/App.tsx
# Remove: import TempSignup from "./pages/TempSignup";
# Remove: <Route path="/temp-signup" element={<TempSignup />} />

# Delete the page file
rm client/src/pages/TempSignup.tsx

# Rebuild and restart
npm run build
pm2 restart bbos
```

### 10.3 Secure .env File

```bash
# Ensure .env is not in git
echo ".env" >> .gitignore
echo ".env.*" >> .gitignore

# Verify permissions
ls -la /var/www/bbos/.env
# Should be: -rw------- (600)

# If not:
chmod 600 /var/www/bbos/.env
```

---

## 🔧 Troubleshooting

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs bbos --err

# Common issues:
# 1. Port already in use
sudo netstat -tulpn | grep 5001
pm2 stop <other-app-using-5001>

# 2. Database connection failed
# Verify DATABASE_URL in .env
# Test connection:
psql "$DATABASE_URL"

# 3. Build files missing
ls -la /var/www/bbos/dist/
npm run build
```

### Session/Login Not Working

```bash
# Check session table exists
psql "$DATABASE_URL" -c "\dt session"

# If missing:
npm run db:push

# Verify trust proxy is working
pm2 logs bbos | grep "trust proxy"

# Check Apache headers
curl -I https://bbos.cerbm.com
# Should see: X-Forwarded-Proto: https
```

### Apache Not Proxying

```bash
# Test Apache configuration
sudo apache2ctl configtest

# Check if site is enabled
ls -la /etc/apache2/sites-enabled/ | grep bbos

# Verify modules
apache2ctl -M | grep proxy

# Test proxy
curl -I http://localhost:5001/health
# Then:
curl -I https://bbos.cerbm.com/health
# Both should return 200
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew manually
sudo certbot renew --force-renewal

# Check Apache SSL config
sudo apache2ctl -S | grep 443
```

### Port Conflicts

```bash
# Find what's using port 5001
sudo lsof -i :5001

# Kill process if needed
sudo kill <PID>

# Or change BBoS port in:
# - .env (PORT=5002)
# - ecosystem.config.js (PORT: 5002)
# - Apache config (ProxyPass to 127.0.0.1:5002)
```

---

## 📊 Performance Optimization

### Enable Compression

```apache
# Add to /etc/apache2/sites-available/bbos.cerbm.com.conf
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css
    AddOutputFilterByType DEFLATE application/javascript application/json
</IfModule>
```

### Enable Caching

```apache
# Add to virtual host config
<LocationMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 month"
    Header append Cache-Control "public"
</LocationMatch>
```

### PM2 Cluster Mode (for scaling)

```javascript
// In ecosystem.config.js, change:
instances: 'max',        // Use all CPU cores
exec_mode: 'cluster',    // Enable cluster mode
```

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Server has Node.js 20.x installed
- [ ] Apache2 is running
- [ ] PM2 is installed globally
- [ ] Port 5001 is available (or chosen alternative)
- [ ] Aiven PostgreSQL database is accessible
- [ ] Domain DNS points to server IP

### Deployment
- [ ] Application cloned to `/var/www/bbos`
- [ ] Dependencies installed (`npm install`)
- [ ] Application built successfully (`npm run build`)
- [ ] `.env` file created with correct values
- [ ] PM2 ecosystem file created
- [ ] PM2 process started and running
- [ ] Apache virtual host configured
- [ ] Apache site enabled
- [ ] SSL certificate obtained
- [ ] HTTPS working

### Post-Deployment
- [ ] Health endpoint responds (`/health`)
- [ ] Application accessible via `https://bbos.cerbm.com`
- [ ] Admin account created
- [ ] Temporary signup endpoint removed
- [ ] PM2 saved and auto-starts on reboot
- [ ] Database backups configured
- [ ] Monitoring set up

### Security
- [ ] Firewall configured (UFW)
- [ ] `.env` file secured (chmod 600)
- [ ] SSL certificate auto-renews
- [ ] Security headers configured
- [ ] Session secret is strong and unique

---

## 🚀 Quick Reference Commands

```bash
# PM2 Management
pm2 list                    # List all processes
pm2 logs bbos              # View logs
pm2 restart bbos           # Restart app
pm2 stop bbos              # Stop app
pm2 monit                  # Monitor resources

# Apache Management
sudo systemctl status apache2
sudo systemctl restart apache2
sudo apache2ctl configtest

# Application Updates
cd /var/www/bbos
git pull
npm install
npm run build
pm2 restart bbos

# View Logs
pm2 logs bbos --lines 100
sudo tail -f /var/log/apache2/bbos-error.log

# Database Backup
pg_dump "$DATABASE_URL" > backup.sql

# Check Application Health
curl https://bbos.cerbm.com/health
```

---

## 📞 Support

**Your deployment is complete!** 🎉

BBoS is now running at: `https://bbos.cerbm.com`

For issues or questions:
- Check logs: `pm2 logs bbos`
- Review Apache logs: `sudo tail -f /var/log/apache2/bbos-error.log`
- Test database: `psql "$DATABASE_URL"`
- Verify PM2: `pm2 show bbos`
