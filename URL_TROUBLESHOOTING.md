# Website URL Troubleshooting Guide

## Issue Identified and Fixed

### **Primary Issue: Base Path Configuration**

**Problem**: The `vite.config.ts` had `base: './'` which creates **relative paths** for assets. This causes issues when:
- Assets can't be found at the correct paths
- Browser routing fails to resolve resources properly
- Mixed absolute/relative paths cause 404 errors

**Fix Applied**: Changed `base: './'` to `base: '/'` in `vite.config.ts`

This ensures all asset paths are absolute and consistent when deployed to `https://clncambodia.com/`

## Next Steps

### 1. Rebuild the Application

After the fix, you **must rebuild** the application:

```bash
npm run build
```

This will generate a new `dist` folder with corrected paths.

### 2. Re-upload to Server

After rebuilding:
1. Delete all files from your `public_html` (or domain root) on your server
2. Upload **all contents** from the new `dist` folder
3. **VERIFY** that `.htaccess` is uploaded and in the root directory

## Common Issues That Can Prevent Website from Loading

### Issue 1: `.htaccess` Not Working

**Symptoms**: 
- 404 errors on page refresh
- Routes not working (e.g., `/about-us` returns 404)
- Only homepage loads

**Solutions**:
- Verify `.htaccess` is in the root directory (`public_html/`)
- Check file permissions are `644`
- Ensure Apache `mod_rewrite` is enabled on your server
- Verify `.htaccess` files aren't blocked by server settings

**How to check in cPanel**:
- Go to "Select PHP Version" → "Extensions" → Ensure `mod_rewrite` is enabled
- Check "Error Log" in cPanel for Apache errors

### Issue 2: Missing Assets (404 Errors)

**Symptoms**:
- Blank page or console errors
- Images/styles not loading
- JavaScript files returning 404

**Solutions**:
- Verify all files from `dist/` were uploaded (not just the folder)
- Check that `assets/` folder structure is intact
- Verify file permissions (should be `644` for files, `755` for directories)
- Clear browser cache and try again

### Issue 3: Server Configuration Issues

**Symptoms**:
- Website completely inaccessible
- Connection timeout
- DNS errors

**Solutions**:
- Check DNS settings in your domain registrar
- Verify domain is pointing to correct nameservers
- Check if SSL certificate is properly installed
- Contact hosting provider to verify server is running

### Issue 4: Mixed Content (HTTP/HTTPS)

**Symptoms**:
- Some resources load, others don't
- Console errors about mixed content
- Security warnings in browser

**Solutions**:
- Ensure all external resources use HTTPS
- Check API calls are using HTTPS URLs
- Uncomment HTTPS redirect in `.htaccess` if you have SSL:
  ```apache
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST} complications burstsREQUEST_URI} [L,R=301]
  ```

### Issue 5: Environment Variables Not Set

**Symptoms**:
- API calls failing
- Features not working

**Solutions**:
- Verify `VITE_API_BASE` environment variable is set correctly
- For static hosting, ensure environment variables are set during build time
- Check that API URL is accessible: `https://cln-rest-api.onrender.com`

## Verification Checklist

After redeploying, verify these:

- [ ] Homepage loads: `https://clncambodia.com/`
- [ ] All routes work:
  - [ ] `/about-us`
  - [ ] `/services`
  - [ ] `/products`
  - [ ] `/contact-us`
- [ ] Browser console shows no errors (F12 → Console tab)
- [ ] Network tab shows all assets loading (200 status codes)
- [ ] Images display correctly
- [ ] Navigation between pages works
- [ ] No 404 errors in Network tab

## Diagnostic Tools

1. **Browser DevTools** (F12):
   - Console tab: Check for JavaScript errors
   - Network tab: Verify all assets load with 200 status
   - Elements tab: Check if HTML structure is correct

2. **Online Tools**:
   - [Down For Everyone Or Just Me](https://downforeveryoneorjustme.com/) - Check if site is down globally
   - [SSL Labs](https://www.ssllabs.com/ssltest/) - Check SSL configuration
   - [GTmetrix](https://gtmetrix.com/) - Check site performance

3. **Server Logs**:
   - Check cPanel Error Logs
   - Check Apache access logs
   - Look for specific error messages

## If Still Not Working

1. **Clear browser cache** completely (Ctrl+Shift+Delete or Cmd+Shift+Delete)
2. **Try incognito/private mode** to rule out cache issues
3. **Test from different browser/device** to rule out local issues
4. **Check server error logs** in cPanel for specific error messages
5. **Verify all files uploaded correctly** - Compare file count in `dist/` vs `public_html/`
6. **Contact hosting support** with specific error messages from logs

## Technical Details

**Before Fix**:
- `base: './'` → Generated paths like `./assets/file.js`
- Causes path resolution issues in different contexts

**After Fix**:
- `base: '/'` → Generates paths like `/assets/file.js`
- Works consistently at root domain level

This fix ensures React Router and asset loading work correctly when deployed to `https://clncambodia.com/`.

