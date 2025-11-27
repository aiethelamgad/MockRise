# Vercel Server-Only Deployment Guide

## 📁 Project Structure

When deploying **only the server folder**, your structure should be:

```
server/
├── api/
│   └── index.js          ← Serverless function handler (NEW)
├── src/
│   ├── app.js            ← Express app
│   ├── server.js         ← Traditional server (for local dev)
│   └── ...
├── vercel.json           ← Vercel configuration (NEW)
└── package.json
```

## ✅ What Was Created

1. **`server/api/index.js`** - Serverless function handler that exports your Express app
2. **`server/vercel.json`** - Vercel configuration for server-only deployment

## 🚀 Deployment Steps

### 1. Configure Vercel Project

In Vercel Dashboard → Your Project → Settings → General:

- **Root Directory:** `server` (or leave empty if deploying from server folder)
- **Framework Preset:** `Other`
- **Build Command:** Leave empty (not needed for serverless functions)
- **Output Directory:** Leave empty
- **Install Command:** Leave empty (Vercel auto-detects `package.json`)

### 2. Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### 3. Deploy

```bash
# From the server directory
cd server
vercel --prod
```

Or push to Git - Vercel will auto-deploy.

## 🔍 How It Works

### Request Flow

1. **Request arrives:** `https://your-app.vercel.app/api/auth/login`
2. **Vercel routes:** Matches `/api/(.*)` → routes to `api/index.js`
3. **Function executes:** `api/index.js` handler runs
4. **Database connects:** Mongoose connects (cached for subsequent requests)
5. **Express handles:** Express app receives request at `/api/auth/login`
6. **Response sent:** Express sends response back through Vercel

### Route Mapping

| Vercel Route | Express Route | Endpoint |
|-------------|---------------|----------|
| `/api/auth/login` | `/api/auth/login` | `POST /api/auth/login` |
| `/api/users` | `/api/users` | `GET /api/users` |
| `/` | `/` | `GET /` (health check) |

## 🧪 Testing

### Test Health Check
```bash
curl https://your-app.vercel.app/
```

Expected response:
```json
{
  "success": true,
  "message": "MockRise API Server",
  "version": "1.0.0"
}
```

### Test API Endpoint
```bash
curl https://your-app.vercel.app/api/auth/me
```

### Test with Authentication
```bash
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## 🐛 Troubleshooting

### Error: NOT_FOUND

**Cause:** Vercel can't find the serverless function handler

**Fix:**
1. Verify `server/api/index.js` exists
2. Check `server/vercel.json` routes configuration
3. Ensure Root Directory in Vercel dashboard is set to `server`

### Error: Function not found

**Cause:** Build didn't include the API function

**Fix:**
1. Check build logs for `Building api/index.js`
2. Verify `vercel.json` has correct `builds` configuration
3. Redeploy with: `vercel --prod --force`

### Error: Database connection failed

**Cause:** Environment variables not set or MongoDB connection issue

**Fix:**
1. Verify `MONGO_URI` is set in Vercel Environment Variables
2. Check MongoDB Atlas network access (IP whitelist)
3. Check function logs in Vercel Dashboard → Functions

### Error: Module not found

**Cause:** Dependencies not installed or path issues

**Fix:**
1. Verify `server/package.json` has all dependencies
2. Check that `api/index.js` uses correct relative paths:
   - `../src/app` (not `./src/app`)
   - `../src/config/database` (not `./src/config/database`)

## 📊 Expected Build Output

A successful build should show:

```
Building api/index.js with @vercel/node
Installing dependencies from package.json
Build completed
```

## 🔄 Local Development vs Production

### Local Development
```bash
cd server
npm run dev
# Uses server.js - traditional Express server
# Runs on http://localhost:5000
```

### Production (Vercel)
```bash
# Deploy to Vercel
vercel --prod
# Uses api/index.js - serverless function
# Runs on https://your-app.vercel.app
```

**Both use the same Express app** (`src/app.js`), just different entry points!

## 📝 Key Differences

| Aspect | Local (`server.js`) | Production (`api/index.js`) |
|--------|-------------------|----------------------------|
| Entry Point | `server.js` | `api/index.js` |
| Server Type | Traditional (long-lived) | Serverless (per-request) |
| Database | Connects once at startup | Connects on first request (cached) |
| Port | Listens on PORT (5000) | No port (Vercel handles HTTP) |
| Process | Stays alive | Dies after response |

## ✅ Verification Checklist

- [ ] `server/api/index.js` exists and exports handler
- [ ] `server/vercel.json` exists with correct routes
- [ ] Environment variables set in Vercel dashboard
- [ ] Root directory set to `server` in Vercel dashboard
- [ ] Build logs show "Building api/index.js"
- [ ] Health check endpoint works: `GET /`
- [ ] API endpoints work: `GET /api/auth/me`
- [ ] Database connection successful (check function logs)

## 🎯 Next Steps

After server deployment works:
1. Test all API endpoints
2. Verify database operations
3. Check function logs for any errors
4. Monitor performance and cold starts
5. Deploy frontend separately (if needed)

