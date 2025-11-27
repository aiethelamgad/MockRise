# URL Migration Summary

## ✅ Completed Migration

All hardcoded `localhost` URLs have been replaced with environment-aware configuration.

## 📁 Files Updated

### Server-Side Files

1. **`server/src/config/urls.js`** (NEW)
   - Centralized URL configuration utility
   - Automatically switches between development and production
   - Exports: `server`, `frontend`, `api`, and getter functions

2. **`server/src/config/passport.js`**
   - Updated OAuth callback URLs to use `urls.getServerUrl()`
   - Google OAuth callback
   - GitHub OAuth callback

3. **`server/src/services/email.service.js`**
   - Updated password reset email links to use `urls.getFrontendUrl()`
   - Both development logging and production email sending

4. **`server/src/routes/v1/auth.routes.js`**
   - Updated all OAuth redirect URLs to use `urls.getFrontendUrl()`
   - Google OAuth routes
   - GitHub OAuth routes
   - Error redirects

5. **`server/src/server.js`**
   - Updated startup log to use `urls.getServerUrl()`

### Client-Side Files

Already configured in `client/config/env.ts`:
- Uses `VITE_API_URL` environment variable
- Falls back to relative URLs in production
- Uses `http://localhost:5000` in development

## 🔧 Configuration

### Server URL Configuration

The `server/src/config/urls.js` module provides:

```javascript
const urls = require('./config/urls');

// Get URLs
urls.server      // Server URL
urls.frontend    // Frontend URL
urls.api         // API URL (server + /api)

// Or use getters for dynamic access
urls.getServerUrl()
urls.getFrontendUrl()
urls.getApiUrl()
```

### Environment Variables

**Server Environment Variables:**
- `BACKEND_URL` or `SERVER_URL` - Override server URL
- `FRONTEND_URL` - Frontend URL (required for CORS and redirects)
- `VERCEL_URL` - Auto-detected in Vercel deployments

**Client Environment Variables:**
- `VITE_API_URL` - API server URL
- `VITE_FRONTEND_URL` - Frontend URL

## 📊 URL Resolution Logic

### Server URL (`getServerUrl()`)

1. Check `BACKEND_URL` or `SERVER_URL` env var
2. If production and `VERCEL_URL` exists: `https://${VERCEL_URL}`
3. If production: `https://mock-rise-server.vercel.app`
4. Development: `http://localhost:${PORT}`

### Frontend URL (`getFrontendUrl()`)

1. Check `FRONTEND_URL` env var
2. If production: `https://mock-rise.vercel.app`
3. Development: `http://localhost:8080`

## 🎯 Production URLs

**Server:** `https://mock-rise-server.vercel.app/`
**Client:** `https://mock-rise.vercel.app/`

## 🧪 Development URLs

**Server:** `http://localhost:5000`
**Client:** `http://localhost:8080`

## ✅ Benefits

1. **Automatic Environment Detection** - No manual URL changes needed
2. **Type-Safe** - Centralized configuration reduces errors
3. **Maintainable** - Single source of truth for URLs
4. **Flexible** - Easy to override with environment variables
5. **Production-Ready** - Works seamlessly in Vercel deployments

## 🔍 Verification

To verify the migration:

1. **Check server logs** - Should show correct URL on startup
2. **Test OAuth flows** - Redirects should go to correct frontend
3. **Test email links** - Password reset emails should have correct URLs
4. **Check API calls** - Client should call correct server URL

## 📝 Notes

- All URLs automatically remove trailing slashes
- Environment variables take precedence over defaults
- Development fallbacks ensure local development works without configuration
- Production defaults ensure deployment works without additional setup

