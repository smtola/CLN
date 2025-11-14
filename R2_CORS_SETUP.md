# Cloudflare R2 CORS Configuration Guide

## Issue: "Failed to fetch" Error

When uploading files directly from the browser to Cloudflare R2, you may encounter a "Failed to fetch" error. This is typically caused by CORS (Cross-Origin Resource Sharing) restrictions.

## Solution: Configure CORS on Your R2 Bucket

### Step 1: Access Cloudflare Dashboard

1. Log in to your Cloudflare dashboard
2. Navigate to **R2** → **Manage R2 API Tokens**
3. Select your bucket (named `cln`)

### Step 2: Configure CORS Settings

1. Go to your R2 bucket settings
2. Find the **CORS Policy** section
3. Add the following CORS configuration:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://clncambodia.com",
      "https://www.clncambodia.com",
      "https://*.vercel.app"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

### ⚠️ Common Mistakes to Avoid:

1. **Missing PUT method**: You MUST include `"PUT"` in `AllowedMethods` for uploads to work
2. **Wrong port**: Vite dev server uses port `5173`, not `3000`
3. **Missing headers**: Use `"*"` in `AllowedHeaders` to allow all headers, or specify:
   - `"Content-Type"`
   - `"Authorization"`
   - `"x-amz-*"` (for AWS SDK headers)

### ✅ Correct Configuration (Copy this exactly):

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:5173"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

**Note**: Replace `"http://localhost:5173"` with your actual production domain when deploying.

**Important:** Replace the origins with your actual domain(s).

### Step 3: Alternative - Use Backend Proxy (Recommended for Production)

Instead of direct browser uploads, you can create a backend API endpoint that handles the upload:

1. Create an API endpoint (e.g., `/api/upload`)
2. Upload files to this endpoint from your frontend
3. The backend endpoint uploads to R2 using the AWS SDK
4. This avoids CORS issues entirely

### Step 4: Verify Configuration

After configuring CORS:
1. Clear your browser cache
2. Try uploading a file again
3. Check the browser console for any remaining errors

## Troubleshooting

### If CORS errors persist:

1. **Check Origin**: Ensure your domain is listed in `AllowedOrigins`
2. **Check Headers**: Verify `AllowedHeaders` includes all necessary headers
3. **Check Methods**: Ensure `PUT` method is allowed (required for uploads)
4. **Browser Cache**: Clear browser cache and try again

### Alternative: Use Presigned URLs

If CORS configuration is not possible, consider using presigned URLs:
1. Backend generates a presigned URL for upload
2. Frontend uses the presigned URL to upload directly
3. This method also avoids CORS issues

## Current Configuration

Your current R2 setup:
- **Bucket**: `cln`
- **Endpoint**: `https://c0be857c72c40b30ed3fd6419f8a38e5.r2.cloudflarestorage.com`
- **Public URL**: `https://pub-1c4ff69dd3854276a9cfd030c632439c.r2.dev`

Make sure CORS is configured on the bucket to allow uploads from your frontend domain.

