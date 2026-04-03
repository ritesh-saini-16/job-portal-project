# Vercel Deployment Checklist

## ✅ Step 1: Verify Environment Variables in Vercel

Go to **Vercel Dashboard → Project Settings → Environment Variables**

Make sure ALL of these are set for **Production** environment:

### Database
- [ ] `MONGODB_URI` = `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority`
- [ ] `MONGO_FALLBACK_LOCAL` = `false`

### Clerk (Authentication)
- [ ] `CLERK_WEBHOOK_SECRET` = `your_clerk_webhook_secret`
- [ ] `CLERK_PUBLISHABLE_KEY` = `your_clerk_publishable_key`
- [ ] `CLERK_SECRET_KEY` = `your_clerk_secret_key`

### Cloudinary (File Uploads)
- [ ] `CLOUDINARY_NAME` = `your_cloudinary_name`
- [ ] `CLOUDINARY_API_KEY` = `your_cloudinary_api_key`
- [ ] `CLOUDINARY_SECRET_KEY` = `your_cloudinary_secret_key`

### App Settings
- [ ] `JWT_SECRET` = `your_secure_jwt_secret`
- [ ] `NODE_ENV` = `production`

### Frontend URLs (for CORS)
- [ ] `FRONTEND_URL` = Your Vercel domain (e.g., `job-portal-project-eight.vercel.app`)
- [ ] `VITE_BACKEND_URL` = Same as FRONTEND_URL

---

## ✅ Step 2: Check Build Settings

Go to **Settings → General**

- [ ] **Root Directory**: `.` (dot) or empty
- [ ] **Build Command**: `npm run build`
- [ ] **Output Directory**: `dist`

---

## ✅ Step 3: Test the Deployment

1. Go to **Deployments** tab
2. Wait for latest deployment to show **Ready** ✅ (not Failed)
3. Click your domain to visit the app
4. Open **Browser Console** (F12) and check for errors
5. Test an API call: Go to `/api/health` in the browser

Should see: `{"success":true,"message":"Server is healthy"}`

---

## ✅ Step 4: Troubleshooting

### Still seeing "Serverless Function crashed"?
1. Check **Runtime Logs** (not Build Logs) in the latest deployment
2. Look for errors about missing env vars or MongoDB connection
3. Try these fixes:
   ```
   - Verify all env vars are exactly correct (copy-paste, no typos)
   - Check MongoDB connection string is URL encoded properly
   - Make sure NODE_ENV is set to "production"
   - Redeploy: Dashboard → Deployments → Redeploy
   ```

### Frontend showing 404 errors?
1. Check that `VITE_BACKEND_URL` is set correctly
2. Verify frontend build was successful (check Build Logs)
3. Make sure `dist` folder exists

### API returning 404?
1. Check CORS settings (allowed origins should include your domain)
2. Verify routes are correctly defined
3. Check Runtime Logs for route errors

---

## ✅ Step 5: One-Click Redeploy

If changes are needed, go to **Deployments** tab and click **Redeploy** on the latest deployment.

