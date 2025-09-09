# Complete Production Deployment Guide - DigitalOcean with Apache2 & systemd

## Overview
This guide provides step-by-step instructions for deploying your UN SDG Data Management Platform to DigitalOcean production using **Apache2** (not Nginx) and **systemd** services (not PM2) as requested.

## Pre-Deployment Checklist
- [x] Complete database backup created ✅ 
- [x] 588 SDG targets preserved
- [x] 85 SDG indicators preserved  
- [x] 40 data sources preserved
- [x] All form submissions and user data preserved

---

## Phase 1: DigitalOcean Server Setup

### 1.1 Create DigitalOcean Droplet
```bash
# Recommended specifications for your data-heavy application:
# - Ubuntu 22.04 LTS
# - 4GB RAM / 2 vCPUs (minimum for 588+ targets)
# - 80GB SSD (for growing data)
# - Enable backups
```

### 1.2 Initial Server Configuration
```bash
# Connect to your droplet
ssh root@your-droplet-ip

# Update system
apt update && apt upgrade -y

# Create application user (security best practice)
adduser sdgapp
usermod -aG sudo sdgapp
```

### 1.3 Install Required Software
```bash
# Install Node.js 20 (your application version)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install Apache2 (as requested, not Nginx)
apt install -y apache2

# Enable Apache modules needed for proxy
a2enmod proxy proxy_http proxy_balancer lbmethod_byrequests headers ssl rewrite

# Install Let's Encrypt for SSL
apt install -y certbot python3-certbot-apache

# Install git and other utilities
apt install -y git ufw fail2ban
```

---

## Phase 2: Database Setup

### 2.1 PostgreSQL Configuration
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE sdg_platform;
CREATE USER sdguser WITH ENCRYPTED PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE sdg_platform TO sdguser;
ALTER DATABASE sdg_platform OWNER TO sdguser;
\q
```

### 2.2 Restore Your Complete Data
```bash
# Transfer your complete backup to server
scp COMPLETE_DATABASE_BACKUP_FULL.sql sdgapp@your-server:/home/sdgapp/

# Restore all 588 targets + 85 indicators + complete data
sudo -u postgres psql -d sdg_platform -f /home/sdgapp/COMPLETE_DATABASE_BACKUP_FULL.sql
```

### 2.3 Configure PostgreSQL for Production
```bash
# Edit PostgreSQL configuration
nano /etc/postgresql/14/main/postgresql.conf

# Key production settings:
max_connections = 200
shared_buffers = 1GB
effective_cache_size = 3GB
work_mem = 4MB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100

# Restart PostgreSQL
systemctl restart postgresql
```

---

## Phase 3: Application Deployment

### 3.1 Clone and Setup Application
```bash
# Switch to app user
su - sdgapp

# Clone your repository (replace with your actual repo)
git clone https://github.com/yourusername/sdg-platform.git
cd sdg-platform

# Install dependencies
npm install

# Build the application
npm run build
```

### 3.2 Environment Configuration
```bash
# Create production environment file
nano .env.production

# Add production environment variables:
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://sdguser:your-secure-password@localhost:5432/sdg_platform
PGHOST=localhost
PGPORT=5432
PGUSER=sdguser
PGPASSWORD=your-secure-password  
PGDATABASE=sdg_platform
```

---

## Phase 4: systemd Service Setup (As Requested)

### 4.1 Create systemd Service File
```bash
# Create service file (as root)
sudo nano /etc/systemd/system/sdg-platform.service

# Service configuration:
[Unit]
Description=SDG Data Management Platform
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=sdgapp
Group=sdgapp
WorkingDirectory=/home/sdgapp/sdg-platform
Environment=NODE_ENV=production
EnvironmentFile=/home/sdgapp/sdg-platform/.env.production
ExecStart=/usr/bin/node server/index.js
ExecReload=/bin/kill -HUP $MAINPID
KillMode=mixed
KillSignal=SIGINT
TimeoutStopSec=5
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=sdg-platform

[Install]
WantedBy=multi-user.target
```

### 4.2 Enable and Start Service
```bash
# Reload systemd configuration
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable sdg-platform

# Start the service
sudo systemctl start sdg-platform

# Check service status
sudo systemctl status sdg-platform

# View logs if needed
sudo journalctl -u sdg-platform -f
```

---

## Phase 5: Apache2 Configuration (As Requested)

### 5.1 Create Apache Virtual Host
```bash
# Create virtual host file
sudo nano /etc/apache2/sites-available/sdg-platform.conf

# Apache configuration:
<VirtualHost *:80>
    ServerName your-domain.com
    ServerAlias www.your-domain.com
    
    # Redirect HTTP to HTTPS (after SSL setup)
    Redirect permanent / https://your-domain.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName your-domain.com
    ServerAlias www.your-domain.com
    
    # Document root (for static assets if needed)
    DocumentRoot /home/sdgapp/sdg-platform/public
    
    # Proxy to Node.js application
    ProxyPreserveHost On
    ProxyRequests Off
    
    # Main application proxy
    ProxyPass /api http://localhost:3000/api
    ProxyPassReverse /api http://localhost:3000/api
    
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    
    # Security headers
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    
    # Logging
    ErrorLog ${APACHE_LOG_DIR}/sdg-platform_error.log
    CustomLog ${APACHE_LOG_DIR}/sdg-platform_access.log combined
    
    # SSL Configuration (will be added by certbot)
</VirtualHost>
```

### 5.2 Enable Site and SSL
```bash
# Enable the site
sudo a2ensite sdg-platform.conf

# Disable default Apache site
sudo a2dissite 000-default

# Test Apache configuration
sudo apache2ctl configtest

# Restart Apache
sudo systemctl restart apache2

# Setup SSL with Let's Encrypt
sudo certbot --apache -d your-domain.com -d www.your-domain.com
```

---

## Phase 6: Security & Optimization

### 6.1 Firewall Configuration
```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Apache Full'
sudo ufw enable
```

### 6.2 Fail2Ban Configuration  
```bash
# Configure fail2ban for additional security
sudo nano /etc/fail2ban/jail.local

# Add Apache protection:
[apache-auth]
enabled = true
port = http,https
filter = apache-auth
logpath = /var/log/apache2/error.log
maxretry = 3
bantime = 3600

[apache-badbots]
enabled = true
port = http,https
filter = apache-badbots
logpath = /var/log/apache2/access.log
maxretry = 2
bantime = 86400

# Restart fail2ban
sudo systemctl restart fail2ban
```

---

## Phase 7: Monitoring & Maintenance

### 7.1 Log Management
```bash
# Configure log rotation for your app
sudo nano /etc/logrotate.d/sdg-platform

/var/log/apache2/sdg-platform*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 640 www-data adm
    sharedscripts
    postrotate
        systemctl reload apache2 > /dev/null 2>&1 || true
    endscript
}
```

### 7.2 Database Backup Automation
```bash
# Create backup script
nano /home/sdgapp/backup-db.sh

#!/bin/bash
BACKUP_DIR="/home/sdgapp/backups"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="sdg_platform_backup_$DATE.sql"

mkdir -p $BACKUP_DIR
pg_dump -h localhost -U sdguser -d sdg_platform > $BACKUP_DIR/$FILENAME
gzip $BACKUP_DIR/$FILENAME

# Keep only last 30 backups
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

# Make executable
chmod +x /home/sdgapp/backup-db.sh

# Add to crontab (daily backups at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /home/sdgapp/backup-db.sh") | crontab -
```

---

## Phase 8: Performance Optimization

### 8.1 Apache Performance Tuning
```bash
# Edit Apache performance settings
sudo nano /etc/apache2/mods-available/mpm_prefork.conf

<IfModule mpm_prefork_module>
    StartServers 8
    MinSpareServers 5
    MaxSpareServers 20
    ServerLimit 256
    MaxRequestWorkers 256
    MaxConnectionsPerChild 10000
</IfModule>
```

### 8.2 Enable Apache Caching
```bash
# Enable caching modules
sudo a2enmod cache cache_disk expires headers

# Add caching rules to your virtual host
sudo nano /etc/apache2/sites-available/sdg-platform.conf

# Add inside <VirtualHost *:443>:
# Static asset caching
<LocationMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 month"
    Header append Cache-Control "public"
</LocationMatch>

# API response caching (be careful with data freshness)
<Location "/api/public">
    ExpiresActive On
    ExpiresDefault "access plus 5 minutes"
</Location>
```

---

## Phase 9: Final Verification

### 9.1 System Status Check
```bash
# Verify all services are running
sudo systemctl status postgresql apache2 sdg-platform fail2ban

# Check application logs
sudo journalctl -u sdg-platform --no-pager -l

# Test database connection
sudo -u postgres psql -d sdg_platform -c "SELECT COUNT(*) FROM sdg_targets;"
# Should return: 588

sudo -u postgres psql -d sdg_platform -c "SELECT COUNT(*) FROM sdg_indicators;"  
# Should return: 85
```

### 9.2 Performance Testing
```bash
# Install testing tools
sudo apt install apache2-utils

# Test concurrent connections
ab -n 100 -c 10 https://your-domain.com/

# Monitor resource usage
htop
df -h
free -h
```

---

## Phase 10: Deployment Checklist

### Pre-Production
- [ ] Database backup completed with ALL 588 targets
- [ ] All 85 indicators preserved
- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] Security hardening applied

### Production Launch  
- [ ] systemd service running (not PM2 as requested)
- [ ] Apache2 configured (not Nginx as requested) 
- [ ] Database connections working
- [ ] All 588 SDG targets accessible
- [ ] Form submissions working
- [ ] User authentication working
- [ ] Backup automation configured

### Post-Launch
- [ ] Monitoring configured
- [ ] Log rotation setup
- [ ] Performance baseline established
- [ ] Documentation updated

---

## Troubleshooting Commands

```bash
# Service debugging
sudo systemctl status sdg-platform
sudo journalctl -u sdg-platform -f

# Apache debugging  
sudo apache2ctl configtest
sudo tail -f /var/log/apache2/error.log

# Database debugging
sudo -u postgres psql -d sdg_platform
\dt  # List tables
SELECT COUNT(*) FROM sdg_targets;  # Verify data integrity

# Performance monitoring
sudo ss -tulpn | grep :3000
sudo netstat -tulpn | grep apache
top -p $(pgrep node)
```

---

## Critical Notes

1. **Data Integrity**: Your complete backup preserves all 588 SDG targets and 85 indicators
2. **systemd over PM2**: As requested, using systemd for service management
3. **Apache2 over Nginx**: As requested, using Apache2 as web server
4. **Security**: Fail2ban, UFW firewall, and SSL configured
5. **Monitoring**: Comprehensive logging and backup automation
6. **Scalability**: Configuration tuned for your data-heavy application

## Support Contacts

For deployment issues:
- DigitalOcean Support: Available 24/7
- Let's Encrypt Support: Community forums
- Apache Documentation: https://httpd.apache.org/docs/

Your SDG Data Management Platform is now production-ready with all 588 targets, 85 indicators, and complete data preserved! 🚀