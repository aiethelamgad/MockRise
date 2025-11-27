# Production Deployment Guide

This guide covers secure deployment of MockRise to Vercel with proper environment variable management.

## 🔒 Security Principles

1. **Database Connection String**: Stored ONLY in backend environment variables, NEVER exposed to frontend
2. **Backend-Only Database Access**: All database operations happen exclusively through API routes
3. **Environment Variables**: All sensitive data stored in Vercel Environment Variables

## 📋 Pre-Deployment Checklist

- [ ] MongoDB Atlas cluster created and accessible
- [ ] Database connection string ready
- [ ] JWT secret generated (strong random string)
- [ ] Vercel account created
- [ ] Repository connected to Vercel

## 🚀 Vercel Deployment Steps

### 1. Store Environment Variables in Vercel

Go to your Vercel project settings → Environment Variables and add:

#### Backend Environment Variables (Server)

These are used by the Node.js backend server:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

**Important**: 
- Replace `MONGO_URI` with your actual MongoDB Atlas connection string
- Generate a strong `JWT_SECRET` (minimum 32 characters, use a password generator)
- Set `FRONTEND_URL` to your production frontend URL

#### Frontend Environment Variables (Client)

These are used by the Vite frontend build:

```
VITE_API_URL=https://your-backend-api.vercel.app/api
VITE_FRONTEND_URL=https://your-frontend-domain.vercel.app
```

**Important**:
- `VITE_API_URL` should point to your Vercel API routes (e.g., `https://your-app.vercel.app/api`)
- These variables are prefixed with `VITE_` so they're available in the frontend build

### 2. Configure Vercel Project Settings

1. **Root Directory**: Set to project root (where `vercel.json` is located)
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist` (for frontend)
4. **Install Command**: `npm install`

### 3. Deploy

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy to production
vercel --prod
```

Or push to your connected Git repository - Vercel will auto-deploy.

## 🔍 Verification

### Verify Database Security

1. **Check Frontend Bundle**: 
   - Inspect the built JavaScript in `dist/assets/`
   - Search for "mongodb" or "MONGO_URI"
   - Should find NO database connection strings

2. **Check API Routes**:
   - All database operations should be in `server/src/`
   - Frontend only makes HTTP requests to `/api/*` routes

3. **Test API Endpoints**:
   ```bash
   curl https://your-app.vercel.app/api/health
   ```

### Verify Environment Variables

1. In Vercel Dashboard → Settings → Environment Variables
2. Verify all variables are set for Production environment
3. Ensure `MONGO_URI` is NOT exposed in frontend variables

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │
│   (Vite/React)  │
│                 │
│  Makes HTTP     │
│  requests to    │
│  /api/* routes  │
└────────┬────────┘
         │
         │ HTTPS
         │
         ▼
┌─────────────────┐
│   Vercel API    │
│   Routes        │
│   /api/*        │
└────────┬────────┘
         │
         │
         ▼
┌─────────────────┐
│   Backend       │
│   (Express)     │
│                 │
│  Uses MONGO_URI │
│  env variable   │
└────────┬────────┘
         │
         │ MongoDB Connection
         │ (MONGO_URI)
         │
         ▼
┌─────────────────┐
│   MongoDB       │
│   Atlas         │
└─────────────────┘
```

## 🔐 Security Best Practices

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use different JWT secrets** for development and production
3. **Rotate secrets regularly** in production
4. **Monitor API logs** for suspicious activity
5. **Use MongoDB Atlas IP whitelist** to restrict database access
6. **Enable MongoDB Atlas authentication** with strong passwords

## 🐛 Troubleshooting

### Database Connection Issues

- Verify `MONGO_URI` is correctly set in Vercel
- Check MongoDB Atlas network access (IP whitelist)
- Verify database user has correct permissions
- Check Vercel function logs for connection errors

### API Route Not Found

- Verify `vercel.json` routes configuration
- Check that API routes are in `server/src/routes/`
- Ensure build completed successfully

### Environment Variables Not Working

- Frontend variables must be prefixed with `VITE_`
- Rebuild after adding environment variables
- Check Vercel deployment logs for variable loading

## 📚 Additional Resources

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [MongoDB Atlas Security](https://www.mongodb.com/docs/atlas/security/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

