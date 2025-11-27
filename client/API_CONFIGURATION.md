# API Configuration Guide

## 🎯 Server Deployment

Your server is deployed at: **https://mock-rise-server.vercel.app/**

The API endpoints are available at: **https://mock-rise-server.vercel.app/api/**

## ⚙️ Client Configuration

The client needs to be configured to use the server URL for API calls.

### Option 1: Environment Variable (Recommended)

Set the `VITE_API_URL` environment variable in Vercel Dashboard:

1. Go to **Vercel Dashboard** → Your Client Project → **Settings** → **Environment Variables**
2. Add:
   ```
   VITE_API_URL=https://mock-rise-server.vercel.app
   ```
   **Note:** The `/api` suffix is automatically added by the configuration.

3. **Redeploy** the client after adding the variable

### Option 2: Direct URL (Alternative)

If you want to specify the full API URL including `/api`:

```
VITE_API_URL=https://mock-rise-server.vercel.app/api
```

## 📋 Environment Variables Checklist

For **Client Deployment**, set these in Vercel:

```
VITE_API_URL=https://mock-rise-server.vercel.app
VITE_FRONTEND_URL=https://your-client-domain.vercel.app
```

For **Server Deployment**, set these in Vercel:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
NODE_ENV=production
FRONTEND_URL=https://your-client-domain.vercel.app
```

**Important:** `FRONTEND_URL` must match your client's domain exactly for CORS to work!

## 🔍 How It Works

### Configuration Flow

1. **Client checks for `VITE_API_URL`** environment variable
2. **If set:** Uses that URL (adds `/api` if not present)
3. **If not set in production:** Falls back to relative URL `/api` (same domain)
4. **If development:** Uses `http://localhost:5000`

### API Request Flow

```
Client (https://your-client.vercel.app)
    ↓
    Makes request to: https://mock-rise-server.vercel.app/api/auth/login
    ↓
Server (https://mock-rise-server.vercel.app)
    ↓
    Processes request and returns response
```

## 🧪 Testing

### Test Server Health

```bash
curl https://mock-rise-server.vercel.app/
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
curl https://mock-rise-server.vercel.app/api/auth/me
```

### Test from Client

After deploying the client with `VITE_API_URL` set:

1. Open browser console
2. Check network requests
3. API calls should go to: `https://mock-rise-server.vercel.app/api/...`

## 🐛 Troubleshooting

### Issue: API calls failing with CORS error

**Cause:** Server CORS not configured for client domain

**Fix:** Update server CORS configuration to allow your client domain:

In `server/src/config/cors.js`, ensure:
```javascript
origin: process.env.FRONTEND_URL || 'http://localhost:8080'
```

Set `FRONTEND_URL` in server's Vercel environment variables:
```
FRONTEND_URL=https://your-client-domain.vercel.app
```

### Issue: API calls going to wrong URL

**Cause:** `VITE_API_URL` not set or incorrect

**Fix:**
1. Check Vercel Dashboard → Environment Variables
2. Verify `VITE_API_URL` is set correctly
3. Rebuild client after setting variable

### Issue: 404 on API endpoints

**Cause:** Server routes not configured correctly

**Fix:**
1. Verify server is deployed correctly
2. Check server function logs in Vercel
3. Test server directly: `curl https://mock-rise-server.vercel.app/api/`

### Issue: Cookies not working (authentication)

**Cause:** Cross-origin cookie issues

**Fix:**
1. Ensure `credentials: 'include'` in API client (already configured)
2. Set CORS to allow credentials on server
3. Verify cookie domain settings

## 📊 Current Configuration

### Server
- **URL:** https://mock-rise-server.vercel.app/
- **API Base:** https://mock-rise-server.vercel.app/api/
- **Health Check:** https://mock-rise-server.vercel.app/ ✅

### Client (After Configuration)
- **API URL:** https://mock-rise-server.vercel.app/api (from `VITE_API_URL`)
- **All API calls:** Will use the server URL

## ✅ Verification Steps

1. [ ] Server is deployed and accessible
2. [ ] Server health check works: `GET /`
3. [ ] `VITE_API_URL` set in client's Vercel environment variables
4. [ ] Client rebuilt after setting environment variable
5. [ ] API calls in browser console show correct server URL
6. [ ] CORS configured on server for client domain
7. [ ] Authentication works (cookies are sent/received)

## 🔄 Deployment Workflow

1. **Deploy Server:**
   ```bash
   cd server
   vercel --prod
   ```
   → Server URL: `https://mock-rise-server.vercel.app/`

2. **Set Server Environment Variables:**
   - `MONGO_URI`
   - `JWT_SECRET`
   - `FRONTEND_URL` (your client domain)

3. **Deploy Client:**
   ```bash
   cd client
   vercel --prod
   ```
   → Client URL: `https://your-client.vercel.app/`

4. **Set Client Environment Variables:**
   - `VITE_API_URL=https://mock-rise-server.vercel.app`
   - `VITE_FRONTEND_URL=https://your-client.vercel.app`

5. **Redeploy Client** (to pick up new env vars)

6. **Test:**
   - Client loads correctly
   - API calls work
   - Authentication works

