# Vercel Client-Only Deployment Guide

## ✅ What Was Fixed

1. **`client/vite.config.ts`** - Changed output directory from `../dist` to `dist`
   - **Before:** `outDir: "../dist"` (outputs to parent directory)
   - **After:** `outDir: "dist"` (outputs to client/dist)

2. **`client/vercel.json`** - Created Vercel configuration
   - Specifies output directory: `dist`
   - Configures SPA routing (all routes → index.html)
   - Sets framework to Vite

## 🚀 Deployment Steps

### 1. Configure Vercel Project

In Vercel Dashboard → Your Project → Settings → General:

- **Root Directory:** `client` (or leave empty if deploying from client folder)
- **Framework Preset:** `Vite` (auto-detected, but you can set it)
- **Build Command:** `npm run build` (or leave empty - vercel.json handles it)
- **Output Directory:** `dist` (or leave empty - vercel.json handles it)
- **Install Command:** `npm install` (or leave empty)

### 2. Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```
VITE_API_URL=https://your-backend-api.vercel.app/api
VITE_FRONTEND_URL=https://your-frontend-domain.vercel.app
```

**Important:** Frontend environment variables must be prefixed with `VITE_` to be available in the build.

### 3. Deploy

```bash
# From the client directory
cd client
vercel --prod
```

Or push to Git - Vercel will auto-deploy.

## 📁 Project Structure

```
client/
├── dist/              ← Build output (created during build)
├── src/               ← Source files
├── public/            ← Static assets
├── vercel.json        ← Vercel configuration (NEW)
├── vite.config.ts     ← Vite config (UPDATED)
└── package.json
```

## 🔍 How It Works

### Build Process

1. **Install dependencies:** `npm install`
2. **Build:** `npm run build` → Creates `client/dist/`
3. **Deploy:** Vercel serves files from `dist/`

### Routing (SPA)

The `vercel.json` includes rewrites for Single Page Application routing:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures all routes (like `/dashboard`, `/login`, etc.) serve `index.html`, allowing React Router to handle client-side routing.

## 🧪 Testing

After deployment, test:

1. **Homepage:**
   ```bash
   curl https://your-app.vercel.app/
   ```
   Should return HTML

2. **SPA Routes:**
   ```bash
   curl https://your-app.vercel.app/dashboard
   curl https://your-app.vercel.app/login
   ```
   Should also return HTML (not 404)

3. **Static Assets:**
   ```bash
   curl https://your-app.vercel.app/logo.png
   ```
   Should return the image

## 🐛 Troubleshooting

### Error: No Output Directory named "dist" found

**Cause:** Build didn't create `dist/` folder or output directory mismatch

**Fix:**
1. Verify `vite.config.ts` has `outDir: "dist"` (not `"../dist"`)
2. Check `client/vercel.json` has `"outputDirectory": "dist"`
3. Check build logs for errors
4. Verify build command runs: `npm run build`

### Error: 404 on routes (like /dashboard)

**Cause:** SPA routing not configured

**Fix:**
1. Verify `client/vercel.json` has `rewrites` configuration
2. Ensure all routes rewrite to `/index.html`

### Error: Environment variables not working

**Cause:** Variables not prefixed with `VITE_` or not set in Vercel

**Fix:**
1. Frontend variables must start with `VITE_`
2. Set in Vercel Dashboard → Environment Variables
3. Rebuild after adding variables

### Error: API calls failing

**Cause:** `VITE_API_URL` not set or incorrect

**Fix:**
1. Set `VITE_API_URL` in Vercel Environment Variables
2. Should point to your backend API: `https://your-backend.vercel.app/api`
3. Rebuild after setting

## 📊 Expected Build Output

A successful build should show:

```
Installing dependencies...
Building for production...
dist/index.html
dist/assets/index-[hash].js
dist/assets/index-[hash].css
Build completed
```

## 🔄 Local Development vs Production

### Local Development
```bash
cd client
npm run dev
# Runs on http://localhost:8080
# Uses Vite dev server
```

### Production (Vercel)
```bash
cd client
vercel --prod
# Builds to dist/
# Serves from https://your-app.vercel.app
```

## ✅ Verification Checklist

- [ ] `client/vite.config.ts` has `outDir: "dist"` (not `"../dist"`)
- [ ] `client/vercel.json` exists with correct configuration
- [ ] Root directory set to `client` in Vercel dashboard
- [ ] Environment variables set (with `VITE_` prefix)
- [ ] Build logs show successful build
- [ ] `dist/` folder created after build
- [ ] Homepage loads: `GET /`
- [ ] SPA routes work: `GET /dashboard`, `GET /login`
- [ ] API calls work (check browser console)

## 🎯 Key Changes Summary

| File | Change | Reason |
|------|--------|--------|
| `vite.config.ts` | `outDir: "../dist"` → `outDir: "dist"` | Output must be in client folder for deployment |
| `vercel.json` | Created | Configure output directory and SPA routing |

## 📝 Notes

- **Output Directory:** Changed from parent directory to local `dist/` for self-contained deployment
- **SPA Routing:** All routes rewrite to `index.html` for React Router to work
- **Environment Variables:** Must be prefixed with `VITE_` to be available in the build
- **Build Output:** `dist/` folder is created during build and contains all static files

