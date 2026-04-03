# Deployment Fixes - Summary

## Issues Fixed

### 1. **Vercel Configuration** ✅
- Created proper serverless function handler (`api/handler.js`)
- Updated `vercel.json` with correct build command and output directory
- Fixed routing to use the new handler path

### 2. **Build Script** ✅
- Updated `package.json` build script to use Windows-compatible commands
- Build now properly creates the `dist` folder with frontend files

### 3. **Environment Configuration** ✅
- Created `.env.example` with all required environment variables
- Created `.env.production` file for frontend

---

## CRITICAL: Vercel Dashboard Settings

You must update these settings in your Vercel project dashboard:

### **Root Directory**
Change from: `server`  
Change to: `.` (current directory)

**Steps:**
1. Go to Vercel Dashboard → Your Project
2. Click "Settings" → "General"
3. Find "Root Directory" setting
4. Change it from `server` to `.` (or leave empty)
5. Click "Save"

---

## Required Environment Variables

Add these to your Vercel project environment variables:

```
MONGODB_URI = Your MongoDB Atlas connection string
CLERK_WEBHOOK_SECRET = Your Clerk webhook secret
CLERK_PUBLISHABLE_KEY = Your Clerk publishable key
CLERK_SECRET_KEY = Your Clerk secret key
CLOUDINARY_NAME = dgpj5opcj (or your Cloudinary name)
CLOUDINARY_API_KEY = Your Cloudinary API key
CLOUDINARY_SECRET_KEY = Your Cloudinary secret key
JWT_SECRET = your_jwt_secret
NODE_ENV = production
FRONTEND_URL = Your deployed frontend URL (e.g., https://yourdomain.com)
VITE_BACKEND_URL = Your deployed backend URL (same as FRONTEND_URL)
```

**Steps to add env vars:**
1. Go to Vercel Dashboard → Your Project
2. Click "Settings" → "Environment Variables"
3. Add each variable and select which environments (Production, Preview, Development)
4. Click "Save"

---

## Deployment Process

1. **Push to Git:**
   ```bash
   git add .
   git commit -m "fix: deployment configuration"
   git push
   ```

2. **Redeploy in Vercel:**
   - Vercel will automatically detect changes
   - Or manually redeploy from Dashboard → "Deployments" → "Redeploy"

3. **Update Project Root (if not already done):**
   - Settings → General → Root Directory → Change to `.`

---

## Key Files Changed

- ✅ `vercel.json` - Updated for proper serverless deployment
- ✅ `package.json` - Fixed build script for Windows
- ✅ `api/handler.js` - Created new serverless function
- ✅ `.env.example` - Created template for env vars
- ✅ `client/.env.production` - Frontend production config

---

## Testing After Deployment

1. Check that API endpoints are accessible: `/api/jobs`, `/api/users/me`
2. Verify frontend loads (check for 404 errors in console)
3. Test login/signup functionality
4. Check Vercel logs for any errors

**View logs:** Vercel Dashboard → Your Project → "Deployments" → Latest → "Runtime Logs"

---

## Troubleshooting

**Still showing 404 errors?**
- Ensure root directory is set to `.` in Vercel settings
- Redeploy after changing settings
- Check that `dist` folder is built (run `npm run build` locally)

**Frontend not loading?**
- Check `VITE_BACKEND_URL` in Vercel env vars
- Verify CORS is configured in `server.js`
- Check browser console for network errors

**API returning 404?**
- Verify `FRONTEND_URL` is set correctly
- Check that all required env vars are set in Vercel
- Review runtime logs for errors
