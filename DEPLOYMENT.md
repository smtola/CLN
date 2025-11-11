# cPanel Deployment Guide for CLN Cambodia Website

## Issues Fixed

1. **Proxy Error**: Fixed by adding `.htaccess` file for proper routing
2. **SEO Images Not Appearing**: Fixed by updating SEO component to handle null props
3. **Missing Meta Tags**: Added comprehensive meta tags in index.html

## Pre-Deployment Steps

### 1. Build the Application
```bash
npm run build
```

This will create a `dist` folder with all the optimized production files.

### 2. Environment Variables
Create a `.env` file (or set these in cPanel environment variables):
```env
VITE_API_BASE=https://cln-rest-api.onrender.com
```

## Deployment to cPanel

### Method 1: Using cPanel File Manager

1. **Login to cPanel**
   - Go to your hosting provider's cPanel
   - Navigate to File Manager

2. **Upload Files**
   - Go to the `public_html` folder (or your domain's root folder)
   - Delete all existing files in the folder (or backup first)
   - Upload ALL contents from the `dist` folder
   - Ensure `.htaccess` file is uploaded and placed in the root

3. **Set Permissions**
   - Right-click on `.htaccess` file
   - Change permissions to `644`
   - Ensure all files have proper read permissions

### Method 2: Using FTP

1. Connect via FTP client (FileZilla, WinSCP, etc.)
2. Navigate to your domain's root directory
3. Upload all contents from the `dist` folder
4. Make sure `.htaccess` is uploaded

### Important Files to Upload

```
public_html/
├── .htaccess          ← CRITICAL: Must be in root
├── index.html
├── favicon.png
├── logo.png
├── robots.txt
├── sitemap.xml
├── googlec3c313caf97eb165.html
└── assets/
    ├── image/
    │   └── (all images)
    ├── index-*.js
    ├── index-*.css
    └── react-*.js
```

## Post-Deployment Verification

### 1. Check Basic Functionality
- Visit your website URL
- Check if all routes work (/, /about-us, /services, /products, /contact-us)
- Test navigation between pages

### 2. Test SEO
- View page source and verify meta tags are present
- Check Open Graph tags in the `<head>` section
- Use Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- Use Twitter Card Validator: https://cards-dev.twitter.com/validator

### 3. Check Console for Errors
- Open browser DevTools (F12)
- Go to Console tab
- Look for any errors related to API calls or routing

### 4. Verify Images
- Check if all images load correctly
- Look for 404 errors in Network tab for images
- Verify favicon appears in browser tab

## Troubleshooting

### Issue: 404 Error on Page Refresh
**Solution**: Ensure `.htaccess` file is in the root directory and has the correct content

### Issue: Images Not Loading
**Solution**: Check image paths. If still issues, try:
1. Clear browser cache
2. Check if `assets/image/` folder structure is correct
3. Verify image file names match exactly (case-sensitive)

### Issue: API Calls Failing
**Solution**: 
1. Check if `VITE_API_BASE` environment variable is set correctly
2. Verify API URL in browser DevTools Network tab
3. Check if your hosting allows external API calls

### Issue: SEO Tags Not Appearing
**Solution**:
1. Check if page is being loaded as SPA (should use client-side rendering)
2. Verify SEO component is imported and used in page components
3. Check browser DevTools Elements tab for meta tags

### Issue: Slow Loading Times
**Solution**:
1. Enable compression in cPanel (mod_deflate)
2. Check if CDN is configured
3. Optimize images (already done in build process)

## SSL/HTTPS Setup

1. **Enable SSL in cPanel**
   - Go to SSL/TLS Status
   - Install SSL certificate
   - Force HTTPS redirect (uncomment in `.htaccess` if needed)

2. **Update `.htaccess`** (uncomment these lines):
```apache
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## Additional Configuration

### Enable Compression
Compression should already be configured in `.htaccess` file. Verify in cPanel:
- Go to MultiPHP Manager or Software
- Enable Apache modules: `mod_deflate`, `mod_rewrite`, `mod_headers`

### Database Connection (if needed)
If your API requires database access, ensure:
1. Database credentials are correct
2. Database user has proper permissions
3. Database server allows connections from your hosting IP

## Support

If you encounter issues not covered here:
1. Check browser console for specific error messages
2. Check server error logs in cPanel
3. Verify all dependencies are built correctly with `npm run build`

## Version Control

Always keep a backup of the current live version before deploying updates.

