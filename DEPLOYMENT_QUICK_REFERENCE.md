# 🚀 BBoS Deployment Quick Reference

## Essential Information

**Domain:** bbos.cerbm.com  
**Application Port:** 5001 (or next available)  
**Database:** Aiven PostgreSQL  
**Process Manager:** PM2  
**Web Server:** Apache2  
**SSL:** Let's Encrypt (Certbot)

---

## Quick Start Commands

### 1. Initial Setup
```bash
cd /var/www/bbos
npm install
npm run build
```

### 2. Create .env
```bash
cp .env.example .env
nano .env
# Add your DATABASE_URL and SESSION_SECRET
```

### 3. Start with PM2
```bash
pm2 start ecosystem.config.js --env production
pm2 save
```

### 4. Configure Apache
```bash
sudo a2ensite bbos.cerbm.com.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

### 5. Get SSL Certificate
```bash
sudo certbot --apache -d bbos.cerbm.com
```

---

## Essential Environment Variables

```env
NODE_ENV=production
PORT=5001
HOST=127.0.0.1
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require
SESSION_SECRET=<generate-random-64-char-string>
```

### Generate Session Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Daily Operations

### View Logs
```bash
pm2 logs bbos --lines 100       # Application logs
sudo tail -f /var/log/apache2/bbos-error.log  # Apache logs
```

### Restart Application
```bash
pm2 restart bbos
```

### Update Application
```bash
cd /var/www/bbos
git pull
npm install
npm run build
pm2 restart bbos
```

### Check Status
```bash
pm2 list                        # PM2 processes
pm2 show bbos                   # Detailed info
curl https://bbos.cerbm.com/health  # Health check
```

---

## Troubleshooting

### App Won't Start
```bash
pm2 logs bbos --err            # Check error logs
sudo netstat -tulpn | grep 5001  # Check if port is free
```

### Login Not Working
```bash
pm2 logs bbos | grep session   # Check session logs
psql "$DATABASE_URL" -c "\dt session"  # Verify session table
```

### Apache Issues
```bash
sudo apache2ctl configtest     # Test configuration
sudo systemctl status apache2  # Check Apache status
```

### SSL Certificate
```bash
sudo certbot certificates      # Check status
sudo certbot renew --dry-run   # Test renewal
```

---

## Important File Locations

```
/var/www/bbos/                 # Application directory
/var/www/bbos/.env             # Environment config
/var/www/bbos/ecosystem.config.js  # PM2 config
/var/www/bbos/logs/            # Application logs
/etc/apache2/sites-available/bbos.cerbm.com.conf  # Apache config
/var/log/apache2/bbos-*.log    # Apache logs
```

---

## Port Management

Check used ports:
```bash
pm2 list                       # See all PM2 apps and ports
sudo netstat -tulpn | grep LISTEN  # All listening ports
```

If port 5001 is taken, update these files:
- `.env` → `PORT=5002`
- `ecosystem.config.js` → `PORT: 5002`
- Apache config → `ProxyPass / http://127.0.0.1:5002/`

---

## Security Checklist

- [ ] `.env` permissions set to 600
- [ ] Strong SESSION_SECRET generated
- [ ] SSL certificate installed and auto-renewing
- [ ] Temporary signup endpoint removed after creating admin
- [ ] UFW firewall enabled (ports 22, 80, 443 only)
- [ ] PM2 startup script configured

---

## Common PM2 Commands

```bash
pm2 list                       # List all processes
pm2 logs bbos                  # View logs
pm2 monit                      # Real-time monitoring
pm2 restart bbos               # Restart app
pm2 stop bbos                  # Stop app
pm2 start bbos                 # Start app
pm2 save                       # Save PM2 list
pm2 resurrect                  # Restore saved processes
```

---

## Emergency Rollback

```bash
# Stop current version
pm2 stop bbos

# Restore from backup
cd /var/www/bbos
git checkout <previous-commit>
npm install
npm run build

# Restart
pm2 restart bbos

# Verify
curl https://bbos.cerbm.com/health
```

---

## Database Backup

```bash
# Manual backup
pg_dump "$DATABASE_URL" > bbos_backup_$(date +%Y%m%d).sql
gzip bbos_backup_*.sql

# Restore backup
gunzip bbos_backup_YYYYMMDD.sql.gz
psql "$DATABASE_URL" < bbos_backup_YYYYMMDD.sql
```

---

## Health Checks

```bash
# Application health
curl https://bbos.cerbm.com/health
# Expected: {"status":"ok"}

# Database connectivity
curl https://bbos.cerbm.com/ready
# Expected: {"status":"ready","database":"connected"}

# PM2 health
pm2 status
# All apps should show: online

# Apache health
sudo systemctl status apache2
# Should show: active (running)
```

---

## Contact & Support

**Full Guide:** See `DEPLOYMENT_GUIDE_PM2_APACHE2.md`  
**Deployment Checklist:** See `DEPLOYMENT_CHECKLIST.md`

For detailed instructions, troubleshooting, and advanced configuration, refer to the complete deployment guide.
