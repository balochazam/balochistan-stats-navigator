# BBoS Production Deployment Checklist

Use this checklist to ensure all steps are completed before deploying to production.

## Pre-Deployment

### Environment Setup
- [ ] Server provisioned (Ubuntu 22.04 LTS)
- [ ] Domain DNS configured and propagated
- [ ] Node.js 20.x installed
- [ ] PM2 installed globally
- [ ] Apache2 or Nginx installed
- [ ] PostgreSQL database provisioned

### Code & Dependencies
- [ ] Repository cloned to `/var/www/bbos`
- [ ] `.env` file created from `.env.example`
- [ ] Dependencies installed (`npm install`)
- [ ] TypeScript compiles without errors (`npm run check`)
- [ ] Application builds successfully (`npm run build`)

### Configuration
- [ ] `NODE_ENV=production` set
- [ ] `PORT` configured (default: 5001)
- [ ] `HOST` set to `0.0.0.0`
- [ ] Strong `SESSION_SECRET` generated (48+ characters)
- [ ] Database connection string configured (`REMOTE_DATABASE_URL` or `DATABASE_URL`)
- [ ] `TRUST_PROXY=true` set
- [ ] Database SSL settings configured
- [ ] `.env` file permissions set to 600

### Database
- [ ] Database accessible from server
- [ ] Database migrations run (`npm run db:migrate`)
- [ ] Session table created
- [ ] Database connection test successful

### Application
- [ ] Application starts without errors (`npm start`)
- [ ] Health check responds (`curl http://localhost:5001/health`)
- [ ] Readiness check responds (`curl http://localhost:5001/ready`)
- [ ] No errors in console logs

## Deployment

### Process Management
- [ ] PM2 ecosystem.config.js created
- [ ] Application started with PM2 (`pm2 start ecosystem.config.js`)
- [ ] PM2 startup script configured (`pm2 startup systemd`)
- [ ] PM2 configuration saved (`pm2 save`)
- [ ] Logs directory created and writable

### Web Server
- [ ] Virtual host configuration created
- [ ] Reverse proxy configured (port 5001)
- [ ] WebSocket support enabled
- [ ] Security headers added
- [ ] Site enabled
- [ ] Configuration tested (`apache2ctl configtest` or `nginx -t`)
- [ ] Web server restarted

### SSL/HTTPS
- [ ] Certbot installed
- [ ] SSL certificate obtained (`certbot --apache` or `certbot --nginx`)
- [ ] HTTPS redirect configured
- [ ] Certificate auto-renewal tested (`certbot renew --dry-run`)
- [ ] HTTPS accessible

### Security
- [ ] Firewall configured (UFW)
- [ ] Only necessary ports open (22, 80, 443)
- [ ] `.env` file not committed to git
- [ ] Strong database password used
- [ ] Session secret is unique and strong
- [ ] Security headers verified

### Monitoring
- [ ] PM2 monitoring active (`pm2 monit`)
- [ ] Log rotation configured
- [ ] Error logs accessible
- [ ] Health endpoint monitored
- [ ] Disk space monitoring set up

### Backups
- [ ] Database backup script created
- [ ] Backup cron job configured
- [ ] Backup retention policy set (7-30 days)
- [ ] Backup restoration tested
- [ ] Application files backup configured

## Post-Deployment

### Verification
- [ ] Application accessible via domain
- [ ] HTTPS working correctly
- [ ] Login functionality working
- [ ] Forms can be created and submitted
- [ ] Data displays correctly
- [ ] All SDG features functional
- [ ] Export functionality (CSV/PDF) working
- [ ] No console errors in browser
- [ ] Mobile responsiveness verified

### Performance
- [ ] Page load times acceptable (<3s)
- [ ] Database queries optimized
- [ ] Static assets cached properly
- [ ] Compression enabled (gzip)
- [ ] Application responsive under load

### Documentation
- [ ] Deployment guide accessible
- [ ] Environment variables documented
- [ ] Backup procedures documented
- [ ] Troubleshooting steps documented
- [ ] Contact information for support updated

### Handoff
- [ ] Server access credentials shared securely
- [ ] Database credentials documented securely
- [ ] Domain registrar access documented
- [ ] SSL certificate renewal process explained
- [ ] Maintenance procedures reviewed

## Ongoing Maintenance

### Weekly
- [ ] Review error logs
- [ ] Check disk space usage
- [ ] Verify backups are running
- [ ] Monitor application uptime

### Monthly
- [ ] Update npm packages (`npm audit fix`)
- [ ] Review security updates
- [ ] Test backup restoration
- [ ] Review performance metrics

### Quarterly
- [ ] Update Node.js version
- [ ] Database optimization and analysis
- [ ] Security audit
- [ ] Review and update documentation

---

## Emergency Contacts

**System Administrator:** _______________  
**Database Administrator:** _______________  
**Domain/DNS:** _______________  
**Hosting Provider:** _______________

## Rollback Plan

If deployment fails:

1. Stop application: `pm2 stop bbos`
2. Restore database from backup
3. Restore previous application code
4. Restart application: `pm2 restart bbos`
5. Verify functionality
6. Document issues for troubleshooting

---

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Version:** _______________  
**Sign-off:** _______________
