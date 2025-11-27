# CORS Configuration Guide

## ✅ Current Configuration

The CORS is configured to allow requests from: **https://mock-rise.vercel.app**

## 🔧 Environment Variable

Set in **Server's Vercel Environment Variables**:

```
FRONTEND_URL=https://mock-rise.vercel.app
```

**Important:** 
- No trailing slash needed (automatically handled)
- Can support multiple origins (comma-separated)

## 📋 Configuration Details

### Single Origin (Current Setup)

```
FRONTEND_URL=https://mock-rise.vercel.app
```

### Multiple Origins (Optional)

If you need to support multiple frontend domains:

```
FRONTEND_URL=https://mock-rise.vercel.app,https://staging.mock-rise.vercel.app,http://localhost:8080
```

### Development Fallback

If `FRONTEND_URL` is not set, defaults to:
```
http://localhost:8080
```

## 🔍 How It Works

1. **Request arrives** from frontend
2. **CORS middleware checks** the `Origin` header
3. **Compares** against allowed origins
4. **Allows/denies** based on configuration
5. **Sets CORS headers** in response

### CORS Headers Set

- `Access-Control-Allow-Origin`: Your frontend URL
- `Access-Control-Allow-Credentials`: `true` (for cookies)
- `Access-Control-Allow-Methods`: GET, POST, PUT, DELETE, PATCH, OPTIONS
- `Access-Control-Allow-Headers`: Content-Type, Authorization, X-Requested-With

## 🧪 Testing CORS

### Test from Browser Console

Open browser console on `https://mock-rise.vercel.app` and run:

```javascript
fetch('https://mock-rise-server.vercel.app/api/', {
  method: 'GET',
  credentials: 'include'
})
.then(res => res.json())
.then(data => console.log('Success:', data))
.catch(err => console.error('CORS Error:', err));
```

### Test with curl

```bash
# Test preflight (OPTIONS request)
curl -X OPTIONS https://mock-rise-server.vercel.app/api/ \
  -H "Origin: https://mock-rise.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Should see:
# Access-Control-Allow-Origin: https://mock-rise.vercel.app
# Access-Control-Allow-Credentials: true
```

### Test Actual Request

```bash
curl -X GET https://mock-rise-server.vercel.app/api/ \
  -H "Origin: https://mock-rise.vercel.app" \
  -H "Cookie: token=your-token" \
  -v
```

## 🐛 Troubleshooting

### Error: "Not allowed by CORS"

**Cause:** Frontend URL not in allowed origins

**Fix:**
1. Verify `FRONTEND_URL` is set in server's Vercel environment variables
2. Ensure URL matches exactly (no trailing slash)
3. Redeploy server after changing environment variable
4. Check server logs for CORS warnings

### Error: "Credentials not included"

**Cause:** Frontend not sending credentials

**Fix:**
1. Ensure `credentials: 'include'` in fetch requests
2. Check that CORS allows credentials (already configured)

### Error: CORS works in browser but not in API client

**Cause:** API client might not be sending Origin header

**Fix:**
1. Check API client configuration
2. Verify `credentials: 'include'` is set
3. Check browser network tab for CORS headers

## ✅ Verification Checklist

- [ ] `FRONTEND_URL` set in server's Vercel environment variables
- [ ] Value: `https://mock-rise.vercel.app` (no trailing slash)
- [ ] Server redeployed after setting environment variable
- [ ] CORS test from browser console works
- [ ] API calls from frontend work without CORS errors
- [ ] Cookies are sent/received correctly
- [ ] Preflight (OPTIONS) requests work

## 🔄 Current Setup

### Frontend
- **URL:** https://mock-rise.vercel.app
- **API URL:** https://mock-rise-server.vercel.app/api

### Server
- **URL:** https://mock-rise-server.vercel.app
- **CORS Origin:** https://mock-rise.vercel.app ✅

## 📝 Notes

- **Trailing Slashes:** Automatically handled (both with and without `/`)
- **Credentials:** Enabled for cookie-based authentication
- **Methods:** All standard HTTP methods allowed
- **Headers:** Standard headers allowed (Content-Type, Authorization, etc.)

## 🚀 Quick Setup

1. **Set Environment Variable:**
   ```
   FRONTEND_URL=https://mock-rise.vercel.app
   ```

2. **Redeploy Server:**
   ```bash
   cd server
   vercel --prod
   ```

3. **Test:**
   - Open https://mock-rise.vercel.app
   - Check browser console for CORS errors
   - Verify API calls work

