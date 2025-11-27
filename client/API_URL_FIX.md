# API URL Double /api Fix

## 🐛 Problem

**Error:** `Cannot GET /api/api/auth/google`

**Cause:** Double `/api` in the URL path
- `apiUrl` was: `https://mock-rise-server.vercel.app/api`
- Endpoint was: `/api/auth/google`
- Final URL: `https://mock-rise-server.vercel.app/api/api/auth/google` ❌

## ✅ Solution

Updated `client/config/env.ts` to:
- Remove `/api` from the base URL if present
- Endpoints already include `/api` prefix
- Base URL should be just the server domain

### How It Works Now

1. **If `VITE_API_URL=https://mock-rise-server.vercel.app`:**
   - `apiUrl` = `https://mock-rise-server.vercel.app`
   - Endpoint = `/api/auth/google`
   - Final URL = `https://mock-rise-server.vercel.app/api/auth/google` ✅

2. **If `VITE_API_URL=https://mock-rise-server.vercel.app/api`:**
   - `apiUrl` = `https://mock-rise-server.vercel.app` (removes `/api`)
   - Endpoint = `/api/auth/google`
   - Final URL = `https://mock-rise-server.vercel.app/api/auth/google` ✅

3. **In production (no env var):**
   - `apiUrl` = `` (empty string for relative URLs)
   - Endpoint = `/api/auth/google`
   - Final URL = `/api/auth/google` ✅ (relative)

4. **In development:**
   - `apiUrl` = `http://localhost:5000`
   - Endpoint = `/api/auth/google`
   - Final URL = `http://localhost:5000/api/auth/google` ✅

## 📋 Environment Variable

Set in **Client's Vercel Environment Variables**:

```
VITE_API_URL=https://mock-rise-server.vercel.app
```

**Both formats work:**
- `https://mock-rise-server.vercel.app` ✅ (recommended)
- `https://mock-rise-server.vercel.app/api` ✅ (also works, auto-removed)

## 🔄 Next Steps

1. **Set Environment Variable** in Vercel Dashboard (if not already set)
2. **Redeploy Client** to pick up the fix
3. **Test** - API calls should work without double `/api` error

## ✅ Verification

After redeploying, test:

```bash
# Should work now
curl https://mock-rise-server.vercel.app/api/auth/google
```

In browser console on your frontend:
```javascript
fetch('https://mock-rise-server.vercel.app/api/')
  .then(r => r.json())
  .then(console.log);
```

Should return: `{"success":true,"message":"MockRise API Server",...}`

