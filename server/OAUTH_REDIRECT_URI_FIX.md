# OAuth Redirect URI Mismatch Fix

## 🐛 Error

**Error:** `Error 400: redirect_uri_mismatch`

**Cause:** The callback URL in your OAuth request doesn't match what's registered in your Google/GitHub OAuth apps.

## ✅ Solution

### Step 1: Determine Your Production Callback URL

Your server generates callback URLs using `urls.getServerUrl()`. In production, this should be:

**Google:**
```
https://mock-rise-server.vercel.app/api/auth/google/callback
```

**GitHub:**
```
https://mock-rise-server.vercel.app/api/auth/github/callback
```

### Step 2: Update Google OAuth App

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add:
   ```
   https://mock-rise-server.vercel.app/api/auth/google/callback
   ```
5. **Save** the changes

**Important:** 
- The URL must match **exactly** (including `https://`, no trailing slash)
- You can add multiple redirect URIs (one per line)
- Changes may take a few minutes to propagate

### Step 3: Update GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click on your OAuth App
3. Under **Authorization callback URL**, set:
   ```
   https://mock-rise-server.vercel.app/api/auth/github/callback
   ```
4. **Update application** to save

**Important:**
- GitHub allows only **one** callback URL per app
- The URL must match **exactly**

### Step 4: Set Environment Variables in Vercel

**Important:** The server needs to know it's in production. Set these in Vercel:

**In Vercel Dashboard → Server Project → Environment Variables:**

```
NODE_ENV=production
BACKEND_URL=https://mock-rise-server.vercel.app
```

**Why both?**
- `NODE_ENV=production` - Ensures production mode is detected
- `BACKEND_URL` - Explicitly sets the server URL (recommended)

**Note:** Vercel automatically sets `VERCEL=1` and `VERCEL_URL`, but it's better to be explicit with `BACKEND_URL`.

### Step 5: Redeploy Server

After updating OAuth apps and environment variables:

```bash
cd server
vercel --prod
```

Or push to Git if auto-deploy is enabled.

## 🔍 How to Check Current Callback URL

The callback URL is generated in `server/src/config/passport.js`:

```javascript
callbackURL: `${urls.getServerUrl()}/api/auth/google/callback`
```

To see what URL is actually being used, you can temporarily add logging:

```javascript
const serverUrl = urls.getServerUrl();
const callbackURL = `${serverUrl}/api/auth/google/callback`;
console.log('Google OAuth Callback URL:', callbackURL);
```

## 📋 Callback URL Resolution

The callback URL is determined by `urls.getServerUrl()`:

1. **If `BACKEND_URL` or `SERVER_URL` is set:** Uses that value
2. **If `VERCEL_URL` exists:** Uses `https://${VERCEL_URL}`
3. **If production (default):** Uses `https://mock-rise-server.vercel.app`
4. **If development:** Uses `http://localhost:5000`

## 🧪 Testing

### Test Google OAuth

1. Visit: `https://mock-rise.vercel.app/login`
2. Click "Sign in with Google"
3. Should redirect to Google login
4. After login, should redirect back to your app

### Test GitHub OAuth

1. Visit: `https://mock-rise.vercel.app/login`
2. Click "Sign in with GitHub"
3. Should redirect to GitHub login
4. After login, should redirect back to your app

## 🐛 Troubleshooting

### Error: redirect_uri_mismatch

**Possible causes:**
1. Callback URL not registered in OAuth app
2. URL doesn't match exactly (trailing slash, http vs https, etc.)
3. Changes not propagated yet (wait a few minutes)

**Fix:**
- Double-check the exact URL in OAuth app settings
- Ensure no trailing slashes
- Use `https://` not `http://`
- Wait a few minutes after updating

### Error: Invalid client

**Cause:** Client ID or Client Secret incorrect

**Fix:**
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Vercel environment variables
- Verify `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in Vercel environment variables

### Error: OAuth works locally but not in production

**Cause:** Localhost callback URL registered but production URL not

**Fix:**
- Register both URLs in OAuth apps:
  - `http://localhost:5000/api/auth/google/callback` (development)
  - `https://mock-rise-server.vercel.app/api/auth/google/callback` (production)

## 📝 Required OAuth App Settings

### Google OAuth App

- **Application type:** Web application
- **Authorized JavaScript origins:**
  - `https://mock-rise-server.vercel.app`
  - `http://localhost:5000` (for development)
- **Authorized redirect URIs:**
  - `https://mock-rise-server.vercel.app/api/auth/google/callback`
  - `http://localhost:5000/api/auth/google/callback` (for development)

### GitHub OAuth App

- **Application name:** MockRise (or your app name)
- **Homepage URL:** `https://mock-rise.vercel.app`
- **Authorization callback URL:** `https://mock-rise-server.vercel.app/api/auth/github/callback`

**Note:** For development, you may need a separate GitHub OAuth app with:
- **Authorization callback URL:** `http://localhost:5000/api/auth/github/callback`

## ✅ Verification Checklist

- [ ] Google OAuth app has callback URL registered
- [ ] GitHub OAuth app has callback URL registered
- [ ] URLs match exactly (no trailing slashes, correct protocol)
- [ ] `BACKEND_URL` set in Vercel (or using default)
- [ ] Server redeployed after changes
- [ ] OAuth apps saved/updated
- [ ] Waited a few minutes for changes to propagate
- [ ] Tested OAuth flow end-to-end

## 🎯 Quick Reference

**Production Callback URLs:**
- Google: `https://mock-rise-server.vercel.app/api/auth/google/callback`
- GitHub: `https://mock-rise-server.vercel.app/api/auth/github/callback`

**Development Callback URLs:**
- Google: `http://localhost:5000/api/auth/google/callback`
- GitHub: `http://localhost:5000/api/auth/github/callback`

