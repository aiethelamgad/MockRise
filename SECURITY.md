# Security Guidelines

## 🔒 Database Connection Security

### ✅ Backend-Only Database Access

**CRITICAL**: All database operations MUST be handled exclusively by the backend API routes.

- ✅ Database connection string (`MONGO_URI`) is stored ONLY in backend environment variables
- ✅ Frontend NEVER directly connects to MongoDB
- ✅ All database operations go through `/api/*` routes
- ✅ Frontend makes HTTP requests to backend API only

### ❌ What NOT to Do

- ❌ Never expose `MONGO_URI` in frontend code
- ❌ Never import mongoose or MongoDB client in frontend files
- ❌ Never commit `.env` files with actual credentials
- ❌ Never log connection strings in console or error messages

## 🔐 Environment Variables

### Backend Variables (Server-Side Only)

These are stored in Vercel Environment Variables and are ONLY accessible to the Node.js backend:

```
MONGO_URI=mongodb+srv://...          # MongoDB connection string
JWT_SECRET=your-secret-key           # JWT signing secret
```

**Location**: Vercel Dashboard → Project Settings → Environment Variables

### Frontend Variables (Build-Time)

These are prefixed with `VITE_` and are embedded in the frontend build:

```
VITE_API_URL=https://api.example.com  # Backend API URL
VITE_FRONTEND_URL=https://app.example.com  # Frontend URL
```

**Note**: These are safe to expose as they only contain public API endpoints.

## 🛡️ Security Checklist

Before deploying to production:

- [ ] `MONGO_URI` is set in Vercel Environment Variables (NOT in frontend)
- [ ] `.env` files are in `.gitignore` and not committed
- [ ] No MongoDB imports in `client/` directory
- [ ] All database operations are in `server/src/` directory
- [ ] Frontend only uses `apiClient` to make HTTP requests
- [ ] JWT_SECRET is a strong random string (32+ characters)
- [ ] MongoDB Atlas has IP whitelist configured
- [ ] Database user has minimal required permissions

## 🔍 Verification

### Check for Database Leaks

```bash
# Search for MongoDB connection strings in frontend build
grep -r "mongodb" dist/
grep -r "MONGO_URI" dist/
grep -r "mongoose" dist/

# Should return no results
```

### Verify Backend-Only Access

```bash
# Check frontend code for database imports
grep -r "mongoose\|MongoClient\|mongodb" client/ --include="*.ts" --include="*.tsx"

# Should only find text mentions, not actual imports
```

## 📋 Best Practices

1. **Environment Variables**: Always use environment variables for sensitive data
2. **Secret Rotation**: Rotate JWT secrets and database passwords regularly
3. **Access Control**: Use MongoDB Atlas IP whitelist and strong authentication
4. **Monitoring**: Monitor API logs for suspicious database access patterns
5. **Code Review**: Review all database-related code changes before merging

## 🚨 Incident Response

If a database connection string is accidentally exposed:

1. **Immediately rotate** the MongoDB password
2. **Update** the `MONGO_URI` in Vercel Environment Variables
3. **Review** access logs for unauthorized connections
4. **Revoke** any compromised API keys or tokens
5. **Audit** codebase for other exposed secrets

