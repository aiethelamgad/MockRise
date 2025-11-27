# MockRise Backend Server

Express.js backend API server for MockRise.

## Environment Variables

**⚠️ CRITICAL SECURITY**: Never commit `.env` files. All sensitive data must be stored in Vercel Environment Variables for production.

### Required Variables

- `MONGO_URI` - MongoDB connection string (stored securely in Vercel)
- `JWT_SECRET` - Secret key for JWT token signing

### Optional Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS configuration

## Database Security

✅ **Backend-Only Access**: All database operations are handled exclusively by this backend server.

❌ **Never Expose**: The `MONGO_URI` is NEVER exposed to the frontend. It's only available in server-side code.

## Local Development

1. Copy `.env.example` to `.env` (if it exists)
2. Set your environment variables in `.env`
3. Run `npm install` in the `server/` directory
4. Run `npm run dev` to start the development server

## Production Deployment

See [../DEPLOYMENT.md](../DEPLOYMENT.md) for complete deployment instructions.
