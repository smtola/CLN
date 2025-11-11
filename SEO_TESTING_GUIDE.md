# SEO Testing Guide - Post Deployment Verification

This guide helps you verify that SEO meta tags and images are properly displayed when your website is deployed on a server.

## Pre-Deployment Testing

### 1. Local Build Test

Before deploying, test your SEO tags locally:

```bash
# Build the project
npm run build

# Run SEO validation test
npm run test:seo
```

**Expected Output:**
- ✅ All REQUIRED meta tags are present
- ✅ Image URLs are validated as absolute URLs
- ✅ All Open Graph and Twitter Card tags are present

### 2. Preview Build Locally

```bash
npm run preview
```

Then:
1. Visit `http://localhost:4173`
2. Right-click → "View Page Source"
3. Verify meta tags are in the `<head>` section
4. Check that image URLs are absolute (start with `https://clncambodia.com/`)

## Post-Deployment Testing

After deploying to your server, follow these steps to verify SEO tags and images work correctly.

### Step 1: View Page Source

1. Visit your deployed website: `https://clncambodia.com`
2. Right-click on the page → "View Page Source" (or press `Ctrl+U` / `Cmd+U`)
3. Search for `<head>` section and verify:

**Required Meta Tags to Check:**
- ✅ `<title>` tag exists
- ✅ `<meta name="description" content="...">` exists
- ✅ `<link rel="canonical" href="...">` exists
- ✅ `<meta property="og:type" content="website">` exists
- ✅ `<meta property="og:title" content="...">` exists
- ✅ `<meta property="og:description" content="...">` exists
- ✅ `<meta property="og:image" content="https://clncambodia.com/assets/image/logo.png">` exists
- ✅ `<meta property="og:url" content="...">` exists
- ✅ `<meta name="twitter:card" content="summary_large_image">` exists
- ✅ `<meta name="twitter:image" content="https://clncambodia.com/assets/image/logo.png">` exists

**What to Look For:**
- Meta tags should be in the HTML source (not just added by JavaScript)
- Image URLs must be **absolute** (start with `https://`), not relative paths
- Image URL should point to: `https://clncambodia.com/assets/image/logo.png`

### Step 2: Test Image Accessibility

1. **Direct Image Access:**
   - Visit: `https://clncambodia.com/assets/image/logo.png`
   - The image should load without errors (no 404)
   - If you see an error, check:
     - File exists in `dist/assets/image/logo.png` after build
     - File was uploaded to server correctly
     - Server has proper permissions

2. **Check Network Tab:**
   - Open browser DevTools (F12)
   - Go to "Network" tab
   - Reload the page
   - Look for `logo.png` in the requests
   - Verify status is `200 OK` (not 404)

### Step 3: Test with Social Media Debuggers

Social media platforms use crawlers that may not execute JavaScript. These tools will show you what crawlers see:

#### Facebook Sharing Debugger
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter your URL: `https://clncambodia.com`
3. Click "Debug" or "Scrape Again"
4. Check the preview:
   - ✅ Image should appear
   - ✅ Title should display correctly
   - ✅ Description should display correctly
   - ⚠️ If image doesn't show, check the "Warnings That Must Be Fixed" section

**Common Issues:**
- Image not found: Check if URL is accessible
- Image too small: Should be at least 200x200px (recommended: 1200x630px)
- Missing og:image tag: Verify tag is in HTML source

#### Twitter Card Validator
1. Go to: https://cards-dev.twitter.com/validator
   **Note:** Not publicly available anymore, use alternative tools
2. Alternative: Use https://www.opengraph.xyz/
3. Enter your URL: `https://clncambodia.com`
4. Verify:
   - ✅ Card type shows as "summary_large_image"
   - ✅ Image preview displays
   - ✅ Title and description are correct

#### LinkedIn Post Inspector
1. Go to: https://www.linkedin.com/post-inspector/
2. Enter your URL: `https://clncambodia.com`
3. Click "Inspect"
4. Verify preview shows:
   - ✅ Image
   - ✅ Title
   - ✅ Description

#### Open Graph Debugger
1. Go to: https://www.opengraph.xyz/
2. Enter your URL: `https://clncambodia.com`
3. Check all Open Graph tags are detected correctly

### Step 4: Browser Console Check

1. Open browser DevTools (F12)
2. Go to "Console" tab
3. Reload the page
4. Check for any errors related to:
   - Failed image loads
   - API errors (SEO data fetching)
   - React errors

### Step 5: Test Different Pages

Test SEO tags on different pages:

1. **Home Page:** `https://clncambodia.com/`
2. **About Us:** `https://clncambodia.com/about-us`
3. **Services:** `https://clncambodia.com/services`
4. **Products:** `https://clncambodia.com/products`
5. **Contact:** `https://clncambodia.com/contact-us`

For each page:
- View page source
- Verify page-specific meta tags (title, description, image)
- Test with Facebook Debugger

## Common Issues and Solutions

### Issue: Meta Tags Not Showing in Page Source

**Problem:** Meta tags are added by JavaScript (React Helmet) but not visible in initial HTML.

**Solution:** ✅ **Already Fixed!** We've added fallback meta tags directly in `index.html`. These tags are always present in the HTML source, even before JavaScript runs.

**Verification:**
- View page source (before JavaScript executes)
- Meta tags should be present in the `<head>` section

### Issue: Image Not Showing in Social Media Preview

**Possible Causes:**
1. **Image URL is relative instead of absolute**
   - ❌ Wrong: `/assets/image/logo.png`
   - ✅ Correct: `https://clncambodia.com/assets/image/logo.png`

2. **Image file not accessible**
   - Check: Visit `https://clncambodia.com/assets/image/logo.png` directly
   - Fix: Ensure file exists and has correct permissions

3. **Image too small**
   - Minimum: 200x200px
   - Recommended: 1200x630px for Open Graph

4. **Cache issue**
   - Use Facebook Debugger's "Scrape Again" to clear cache
   - Clear browser cache

**How to Fix:**
- Check `src/components/SEO.tsx` - default image should be absolute URL
- Verify image exists in `dist/assets/image/logo.png` after build
- Ensure image is uploaded to server in correct location

### Issue: Page Shows Different Meta Tags

**Problem:** React Helmet updates meta tags dynamically, but you see different tags than expected.

**Possible Causes:**
1. API is returning different SEO data
2. Page-specific SEO data is overriding defaults
3. React Helmet is prioritizing tags in wrong order

**How to Check:**
1. View page source (static HTML) - shows fallback tags
2. Inspect element in browser (after JavaScript runs) - shows React Helmet tags
3. Compare both - they should match or React Helmet should override with better data

### Issue: Description or Title Missing

**Problem:** One or more meta tags are missing.

**Check:**
1. Run `npm run test:seo` to verify locally
2. View page source on deployed site
3. Check `src/components/SEO.tsx` has default values
4. Check API response if using `fetchSEO()`

## Automated Testing

You can run the automated SEO test anytime:

```bash
npm run test:seo
```

This will:
- ✅ Check all required meta tags are present
- ✅ Validate image URLs are absolute
- ✅ Verify Open Graph and Twitter Card tags
- ✅ Provide recommendations for testing

## Checklist for Deployment

Before marking deployment as complete, verify:

- [ ] Build completes without errors: `npm run build`
- [ ] SEO test passes: `npm run test:seo`
- [ ] Page source shows meta tags in HTML
- [ ] Image URL is absolute: `https://clncambodia.com/assets/image/logo.png`
- [ ] Image loads directly: Visit image URL in browser
- [ ] Facebook Debugger shows preview correctly
- [ ] Twitter Card shows preview correctly
- [ ] LinkedIn Inspector shows preview correctly
- [ ] No console errors in browser DevTools
- [ ] All pages have appropriate meta tags

## Quick Test Commands

```bash
# Build and test locally
npm run build && npm run test:seo

# Preview build
npm run preview

# Check built HTML for meta tags
grep -i "og:image" dist/index.html
grep -i "twitter:image" dist/index.html
```

## Support Tools

- **Facebook Sharing Debugger:** https://developers.facebook.com/tools/debug/
- **LinkedIn Post Inspector:** https://www.linkedin.com/post-inspector/
- **Open Graph Debugger:** https://www.opengraph.xyz/
- **Google Rich Results Test:** https://search.google.com/test/rich-results
- **Schema Markup Validator:** https://validator.schema.org/

## Notes

- Meta tags in `index.html` are fallback tags for crawlers
- React Helmet dynamically updates tags per page
- Social media crawlers cache previews - use debuggers to refresh
- Image must be accessible via absolute URL
- Always test after deployment, not just locally

---

**Last Updated:** After adding fallback meta tags to index.html
**Status:** ✅ All required meta tags are present and validated

