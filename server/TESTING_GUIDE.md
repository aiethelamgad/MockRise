# Authentication System Testing Guide

This guide provides comprehensive instructions for testing the authentication system.

## 📚 Related Documentation

- **[../README.md](../README.md)** - Project overview and quick start
- **[../PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md)** - Complete project architecture
- **[../DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md)** - Frontend design system
- **[README.md](./README.md)** - Backend documentation

## Prerequisites

1. **MongoDB**: Ensure MongoDB is running locally or update `MONGO_URI` in `.env`
2. **Node.js**: Version 14 or higher
3. **npm**: Package manager for Node.js
4. **Postman** or **cURL**: For API testing

## Setup

1. Navigate to the server directory:
   ```bash
   cd mockrise-fluent-flow/server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create/update `.env` file with your configuration:
   ```bash
   MONGO_URI=mongodb://localhost:27017/mockrise_auth
   JWT_SECRET=your_test_secret_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   LINKEDIN_CLIENT_ID=your_linkedin_client_id
   LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
   BASE_URL=http://localhost:5000
   PORT=5000
   NODE_ENV=development
   ```

4. Start the server:
   ```bash
   npm start
   ```

   You should see:
   ```
   Server started on port 5000
   MongoDB connected successfully.
   ```

## Test Cases

### 1. Email/Password Authentication

#### 1.1 Register a New User (Trainee)
**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trainee@example.com",
    "password": "password123",
    "role": "trainee"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "trainee",
  "redirect": "/dashboard/trainee"
}
```

**Verification:**
- Status code: 201
- Token is returned
- Redirect path is `/dashboard/trainee`
- Cookie is set with JWT token

#### 1.2 Register a New User (Admin)
**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123",
    "role": "admin"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "admin",
  "redirect": "/dashboard/admin"
}
```

**Verification:**
- Status code: 201
- Redirect path is `/dashboard/admin`

#### 1.3 Register a New User (Interviewer)
**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "interviewer@example.com",
    "password": "password123",
    "role": "interviewer"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "interviewer",
  "redirect": "/dashboard/interviewer"
}
```

**Verification:**
- Status code: 201
- Redirect path is `/dashboard/interviewer`

#### 1.4 Register with Duplicate Email
**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trainee@example.com",
    "password": "password123",
    "role": "trainee"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "User already exists"
}
```

**Verification:**
- Status code: 400
- Error message indicates user already exists

#### 1.5 Login with Valid Credentials
**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trainee@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "trainee",
  "redirect": "/dashboard/trainee"
}
```

**Verification:**
- Status code: 200
- Token is returned
- Redirect path matches user role

#### 1.6 Login with Invalid Email
**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

**Verification:**
- Status code: 401

#### 1.7 Login with Invalid Password
**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trainee@example.com",
    "password": "wrongpassword"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

**Verification:**
- Status code: 401

#### 1.8 Login without Email
**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Please provide an email and password"
}
```

**Verification:**
- Status code: 400

### 2. Protected Routes

#### 2.1 Access Trainee Dashboard (Trainee User)
**Request:**
```bash
curl -X GET http://localhost:5000/api/dashboard/trainee \
  -H "Cookie: token=YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Welcome to the Trainee Dashboard, trainee!",
  "user": {
    "_id": "...",
    "email": "trainee@example.com",
    "role": "trainee",
    ...
  }
}
```

**Verification:**
- Status code: 200
- User data is returned

#### 2.2 Access Trainee Dashboard without Token
**Request:**
```bash
curl -X GET http://localhost:5000/api/dashboard/trainee
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Not authorized to access this route"
}
```

**Verification:**
- Status code: 401

#### 2.3 Access Admin Dashboard (Admin User)
**Request:**
```bash
curl -X GET http://localhost:5000/api/dashboard/admin \
  -H "Cookie: token=ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Welcome to the Admin Dashboard, admin!",
  "user": {
    "_id": "...",
    "email": "admin@example.com",
    "role": "admin",
    ...
  }
}
```

**Verification:**
- Status code: 200

#### 2.4 Access Admin Dashboard (Trainee User)
**Request:**
```bash
curl -X GET http://localhost:5000/api/dashboard/admin \
  -H "Cookie: token=TRAINEE_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "User role trainee is not authorized to access this route"
}
```

**Verification:**
- Status code: 403

#### 2.5 Access Interviewer Dashboard (Interviewer User)
**Request:**
```bash
curl -X GET http://localhost:5000/api/dashboard/interviewer \
  -H "Cookie: token=INTERVIEWER_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Welcome to the Interviewer Dashboard, interviewer!",
  "user": {
    "_id": "...",
    "email": "interviewer@example.com",
    "role": "interviewer",
    ...
  }
}
```

**Verification:**
- Status code: 200

#### 2.6 Access Interviewer Dashboard (Trainee User)
**Request:**
```bash
curl -X GET http://localhost:5000/api/dashboard/interviewer \
  -H "Cookie: token=TRAINEE_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "User role trainee is not authorized to access this route"
}
```

**Verification:**
- Status code: 403

### 3. User Profile

#### 3.1 Get Current User
**Request:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Cookie: token=YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "email": "trainee@example.com",
    "role": "trainee",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Verification:**
- Status code: 200
- User data is returned

#### 3.2 Get Current User without Token
**Request:**
```bash
curl -X GET http://localhost:5000/api/auth/me
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Not authorized to access this route"
}
```

**Verification:**
- Status code: 401

### 4. Logout

#### 4.1 Logout User
**Request:**
```bash
curl -X GET http://localhost:5000/api/auth/logout
```

**Expected Response:**
```json
{
  "success": true,
  "data": {}
}
```

**Verification:**
- Status code: 200
- Cookie is cleared (token set to 'none')

### 5. OAuth Testing (Manual)

#### 5.1 Google OAuth
1. Open browser and navigate to: `http://localhost:5000/api/auth/google`
2. You will be redirected to Google login
3. After successful login, you will be redirected to the appropriate dashboard
4. Check that the JWT cookie is set

#### 5.2 GitHub OAuth
1. Open browser and navigate to: `http://localhost:5000/api/auth/github`
2. You will be redirected to GitHub login
3. After successful login, you will be redirected to the appropriate dashboard
4. Check that the JWT cookie is set

#### 5.3 LinkedIn OAuth
1. Open browser and navigate to: `http://localhost:5000/api/auth/linkedin`
2. You will be redirected to LinkedIn login
3. After successful login, you will be redirected to the appropriate dashboard
4. Check that the JWT cookie is set

## Database Verification

You can verify the data in MongoDB using the MongoDB CLI or a GUI tool like MongoDB Compass.

### Check Users Collection
```bash
mongo mockrise_auth
db.users.find()
```

You should see documents like:
```json
{
  "_id": ObjectId("..."),
  "email": "trainee@example.com",
  "password": "$2a$10$...",
  "role": "trainee",
  "createdAt": ISODate("2024-01-01T00:00:00.000Z"),
  "updatedAt": ISODate("2024-01-01T00:00:00.000Z")
}
```

## Postman Collection

You can also use Postman to test the API. Here's a sample collection:

1. Create a new Postman collection
2. Add the following requests:

**Register Trainee**
- Method: POST
- URL: `http://localhost:5000/api/auth/register`
- Body:
  ```json
  {
    "email": "trainee@example.com",
    "password": "password123",
    "role": "trainee"
  }
  ```

**Login**
- Method: POST
- URL: `http://localhost:5000/api/auth/login`
- Body:
  ```json
  {
    "email": "trainee@example.com",
    "password": "password123"
  }
  ```

**Get Current User**
- Method: GET
- URL: `http://localhost:5000/api/auth/me`
- Cookies: Add the token from login response

**Get Trainee Dashboard**
- Method: GET
- URL: `http://localhost:5000/api/dashboard/trainee`
- Cookies: Add the token from login response

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Start MongoDB service
```bash
mongod
```

### JWT Secret Not Set
```
Error: jwt must be provided
```
**Solution**: Ensure `JWT_SECRET` is set in `.env`

### CORS Error
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Solution**: Update `CORS_ORIGIN` in `.env` to match your frontend URL

### Invalid Token
```
{
  "success": false,
  "error": "Not authorized to access this route"
}
```
**Solution**: Ensure the token is valid and not expired

## Performance Testing

You can use tools like Apache Bench or wrk to test the performance:

```bash
# Using Apache Bench
ab -n 100 -c 10 http://localhost:5000/

# Using wrk
wrk -t4 -c100 -d30s http://localhost:5000/
```

## Security Testing

### Test Password Hashing
1. Register a user
2. Check the database
3. Verify the password is hashed (starts with `$2a$` or `$2b$`)

### Test JWT Expiration
1. Login to get a token
2. Modify the token in the cookie
3. Try to access a protected route
4. Verify you get an unauthorized error

### Test CORS
1. Make a request from a different origin
2. Verify the response includes CORS headers

## 6. Interviewer Verification Flow

### 6.1 Sign Up as Interviewer

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Interviewer",
    "email": "john.interviewer@example.com",
    "password": "password123",
    "role": "interviewer",
    "experience": "5 years",
    "expertise": "Software Engineering",
    "linkedin": "https://linkedin.com/in/johninterviewer"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "interviewer",
  "redirect": "/pending-verification",
  "user": {
    "id": "...",
    "name": "John Interviewer",
    "email": "john.interviewer@example.com",
    "role": "interviewer",
    "status": "pending_verification",
    "isApproved": false
  }
}
```

**Verification:**
- Status code: 201
- `status` is `"pending_verification"`
- `redirect` is `"/pending-verification"`
- `isApproved` is `false`
- User is created with interviewer-specific fields (experience, expertise, linkedin)

### 6.2 Login as Pending Interviewer

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.interviewer@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "interviewer",
  "redirect": "/pending-verification",
  "user": {
    "status": "pending_verification",
    "isApproved": false
  }
}
```

**Verification:**
- Status code: 200
- Redirects to `/pending-verification`
- User sees pending verification page

### 6.3 Admin: Get Pending Interviewers

**Request:**
```bash
curl -X GET http://localhost:5000/api/interviewers/pending \
  -H "Cookie: token=ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "...",
      "name": "John Interviewer",
      "email": "john.interviewer@example.com",
      "role": "interviewer",
      "status": "pending_verification",
      "experience": "5 years",
      "expertise": "Software Engineering",
      "linkedin": "https://linkedin.com/in/johninterviewer",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Verification:**
- Status code: 200
- Returns all interviewers with `status: "pending_verification"`
- Admin sees list in dashboard

### 6.4 Admin: Approve Interviewer

**Request:**
```bash
curl -X PUT http://localhost:5000/api/interviewers/INTERVIEWER_ID/approve \
  -H "Cookie: token=ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Interviewer approved successfully",
  "data": {
    "_id": "...",
    "status": "approved",
    "isApproved": true
  }
}
```

**Verification:**
- Status code: 200
- `status` changed to `"approved"`
- `isApproved` changed to `true`
- Admin receives notification about approval

### 6.5 Login as Approved Interviewer

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.interviewer@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "interviewer",
  "redirect": "/dashboard/interviewer",
  "user": {
    "status": "approved",
    "isApproved": true
  }
}
```

**Verification:**
- Status code: 200
- Redirects to `/dashboard/interviewer`
- Interviewer sees approval notification

### 6.6 Admin: Reject Interviewer

**Request:**
```bash
curl -X PUT http://localhost:5000/api/interviewers/INTERVIEWER_ID/reject \
  -H "Cookie: token=ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Interviewer rejected",
  "data": {
    "_id": "...",
    "status": "rejected",
    "isApproved": false
  }
}
```

**Verification:**
- Status code: 200
- `status` changed to `"rejected"`
- `isApproved` changed to `false`

### 6.7 Login as Rejected Interviewer

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.interviewer@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "interviewer",
  "redirect": "/rejected-notice",
  "user": {
    "status": "rejected",
    "isApproved": false
  }
}
```

**Verification:**
- Status code: 200
- Redirects to `/rejected-notice`
- Interviewer sees rejection notification

### 6.8 Unauthorized Access Test

**Request:**
```bash
# As unapproved interviewer, try to access dashboard directly
curl -X GET http://localhost:5000/api/dashboard/interviewer \
  -H "Cookie: token=PENDING_INTERVIEWER_TOKEN"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Access denied"
}
```

**Verification:**
- Status code: 403 (if route guard is implemented)
- Or redirects to `/pending-verification` (if frontend guard catches it)

### 6.9 Frontend Testing Steps

1. **Pending Verification Test:**
   - Sign up as an interviewer with required fields
   - Ensure redirect to `/pending-verification` page
   - Verify page shows "Application Under Review" message
   - Login again → should redirect to `/pending-verification`

2. **Admin Flow Test:**
   - Login as admin
   - Navigate to Admin Dashboard → Overview tab
   - Verify "Pending Interviewer Applications" section appears
   - See list of pending interviewers with details (name, email, experience, expertise, LinkedIn)
   - Click "Approve" on an interviewer
   - Verify interviewer is removed from pending list
   - Verify admin receives notification: "Interviewer Approved"

3. **Approval Test:**
   - As the approved interviewer, login again
   - Should redirect to `/dashboard/interviewer`
   - Should see in-app notification: "Your interviewer application has been approved"

4. **Rejection Test:**
   - As admin, reject a pending interviewer
   - As the rejected interviewer, login again
   - Should redirect to `/rejected-notice` page
   - Should see in-app notification: "Your interviewer application has been rejected"

5. **Unauthorized Access Test:**
   - As unapproved interviewer, try to manually navigate to `/dashboard/interviewer`
   - Should redirect to `/pending-verification` or show unauthorized error

## 7. Notification System Testing

### 7.1 Backend: Notification Creation on Interviewer Signup

#### 7.1.1 Register Interviewer and Verify Notification Creation

**Prerequisites:**
- Ensure you have at least one admin user in the database
- Admin email: `admin@example.com`

**Step 1: Register an Interviewer**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Interviewer",
    "email": "jane.interviewer@example.com",
    "password": "password123",
    "role": "interviewer",
    "experience": "3-5 years",
    "expertise": "Frontend Development",
    "linkedin": "https://linkedin.com/in/janeinterviewer"
  }'
```

**Step 2: Verify Notification in Database**
```bash
# Connect to MongoDB
mongo mockrise_auth

# Check notifications collection
db.notifications.find().sort({ createdAt: -1 }).limit(5).pretty()
```

**Expected Result:**
- At least one notification document exists
- `userId` matches the admin user's `_id`
- `title` is "New Pending Interviewer Application"
- `message` contains the interviewer's name or email
- `type` is "info"
- `isRead` is `false`
- `metadata.interviewerId` matches the new interviewer's `_id`
- `metadata.type` is "pending_interviewer_application"

**Verification:**
- Notification is created for ALL admin users in the system (admin, super_admin, hr_admin)
- If multiple admins exist, each should receive a notification

**Troubleshooting:**
If you're getting an empty array `{"success": true, "data": [], "total": 0, "unreadCount": 0}`, check the following:

1. **Verify you're logged in as an admin:**
   ```bash
   curl -X GET http://localhost:5000/api/auth/me \
     -H "Cookie: token=YOUR_TOKEN"
   ```
   - Check that `role` is `"admin"`, `"super_admin"`, or `"hr_admin"`

2. **Check if notifications exist in the database:**
   ```bash
   mongo mockrise_auth
   db.notifications.find().pretty()
   ```
   - If empty, no notifications have been created yet
   - If notifications exist, check the `userId` field matches your admin user's `_id`

3. **Verify your user ID matches notification userId:**
   ```bash
   # Get your user ID
   var admin = db.users.findOne({ email: "admin@example.com" })
   print("Admin ID:", admin._id)
   
   # Check notifications for your user ID
   db.notifications.find({ userId: admin._id }).pretty()
   ```

4. **Test notification creation manually:**
   - Register a new interviewer (see section 7.1.1)
   - Check server logs for any errors during notification creation
   - Verify notifications were created in the database

5. **Check if admin users exist:**
   ```bash
   db.users.find({ role: { $in: ["admin", "super_admin", "hr_admin"] } }).pretty()
   ```
   - If no admins exist, create one first (see section 1.2)

### 7.2 Backend: Get Notifications API

#### 7.2.1 Get All Notifications (Admin User)

**Prerequisites:**
- Login as admin to get an admin token (see section 1.2)
- Ensure at least one notification exists for this admin

**Request:**
```bash
curl -X GET http://localhost:5000/api/notifications \
  -H "Cookie: token=ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "userId": "admin_user_id",
      "title": "New Pending Interviewer Application",
      "message": "Jane Interviewer has submitted an interviewer application and is awaiting review.",
      "type": "info",
      "isRead": false,
      "metadata": {
        "interviewerId": "...",
        "interviewerName": "Jane Interviewer",
        "type": "pending_interviewer_application"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1,
  "unreadCount": 1
}
```

**Verification:**
- Status code: 200
- Returns array of notifications sorted by `createdAt` (newest first)
- `total` field shows total number of notifications
- `unreadCount` shows number of unread notifications

#### 7.2.2 Get Unread Notifications Only

**Request:**
```bash
curl -X GET "http://localhost:5000/api/notifications?unreadOnly=true" \
  -H "Cookie: token=ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "isRead": false,
      ...
    }
  ],
  "total": 1,
  "unreadCount": 1
}
```

**Verification:**
- Only returns notifications where `isRead: false`
- `unreadCount` matches the number of items in `data` array

#### 7.2.3 Get Notifications with Pagination

**Request:**
```bash
curl -X GET "http://localhost:5000/api/notifications?limit=10&skip=0" \
  -H "Cookie: token=ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [...], // Up to 10 notifications
  "total": 15,
  "unreadCount": 5
}
```

**Verification:**
- Returns at most `limit` notifications
- `total` shows total count regardless of pagination
- Can paginate with `skip` parameter

#### 7.2.4 Get Notifications without Authentication

**Request:**
```bash
curl -X GET http://localhost:5000/api/notifications
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Not authorized to access this route"
}
```

**Verification:**
- Status code: 401

### 7.3 Backend: Mark Notification as Read

#### 7.3.1 Mark Single Notification as Read

**Prerequisites:**
- Have a notification ID from previous test

**Request:**
```bash
curl -X PUT http://localhost:5000/api/notifications/NOTIFICATION_ID/read \
  -H "Cookie: token=ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "NOTIFICATION_ID",
    "isRead": true,
    ...
  }
}
```

**Verification:**
- Status code: 200
- `isRead` is now `true`
- Verify in database: `db.notifications.findOne({ _id: ObjectId("NOTIFICATION_ID") })`
- Unread count decreases by 1

#### 7.3.2 Mark Non-Existent Notification as Read

**Request:**
```bash
curl -X PUT http://localhost:5000/api/notifications/nonexistent_id/read \
  -H "Cookie: token=ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Notification not found"
}
```

**Verification:**
- Status code: 404

#### 7.3.3 Mark Another User's Notification as Read (Should Fail)

**Request:**
```bash
# Try to mark a notification belonging to a different user
curl -X PUT http://localhost:5000/api/notifications/OTHER_USER_NOTIFICATION_ID/read \
  -H "Cookie: token=ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Notification not found"
}
```

**Verification:**
- Status code: 404
- Users can only mark their own notifications as read (security check)

### 7.4 Backend: Mark All Notifications as Read

#### 7.4.1 Mark All Notifications as Read

**Prerequisites:**
- Have multiple unread notifications for the admin user

**Request:**
```bash
curl -X PUT http://localhost:5000/api/notifications/read-all \
  -H "Cookie: token=ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "modifiedCount": 3
}
```

**Verification:**
- Status code: 200
- `modifiedCount` shows number of notifications updated
- All user's notifications now have `isRead: true`
- Unread count becomes 0

**Database Verification:**
```bash
mongo mockrise_auth
db.notifications.find({ userId: ObjectId("ADMIN_USER_ID"), isRead: false }).count()
# Should return 0
```

### 7.5 Backend: Delete Notification

#### 7.5.1 Delete a Notification

**Prerequisites:**
- Have a notification ID

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/notifications/NOTIFICATION_ID \
  -H "Cookie: token=ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Notification deleted"
}
```

**Verification:**
- Status code: 200
- Notification is removed from database
- Verify: `db.notifications.findOne({ _id: ObjectId("NOTIFICATION_ID") })` returns null

#### 7.5.2 Delete Non-Existent Notification

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/notifications/nonexistent_id \
  -H "Cookie: token=ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Notification not found"
}
```

**Verification:**
- Status code: 404

### 7.6 Frontend: Notification Display and Interaction

#### 7.6.1 Admin Notification Panel Display

**Test Steps:**
1. Login as admin user
2. Navigate to Admin Dashboard (`/dashboard/admin`)
3. Look for the notification bell icon in the top navigation bar
4. Click the bell icon

**Expected Result:**
- Notification panel slides in from the right
- Shows all notifications for the admin
- Pending interviewer application notifications are visible
- Unread count badge appears on the bell icon if there are unread notifications
- Notifications are sorted by date (newest first)

**Verification:**
- Panel displays correctly
- Notifications are formatted properly
- Timestamps are human-readable (e.g., "2 minutes ago", "Just now")
- Icons match notification types (Info icon for pending applications)

#### 7.6.2 Notification Count Badge

**Test Steps:**
1. Login as admin with unread notifications
2. Check the notification bell icon

**Expected Result:**
- Red badge appears on the top-right of the bell icon
- Badge shows the number of unread notifications
- Badge disappears when all notifications are read

**Verification:**
- Badge count matches the `unreadCount` from API
- Badge updates in real-time when notifications are marked as read

#### 7.6.3 Mark Notification as Read (Frontend)

**Test Steps:**
1. Open notification panel
2. Click on an unread notification

**Expected Result:**
- Notification is immediately marked as read (optimistic update)
- Unread count decreases by 1
- Visual indicator (dot) disappears
- Notification style changes to indicate it's read

**Verification:**
- UI updates immediately
- API call is made in the background
- Changes persist after refresh

#### 7.6.4 Mark All as Read (Frontend)

**Test Steps:**
1. Open notification panel with multiple unread notifications
2. Click "Mark all read" button in the panel header

**Expected Result:**
- All notifications are marked as read
- Unread count badge disappears
- All notifications show as read state
- Success message may appear

**Verification:**
- All notifications update visually
- Unread count becomes 0
- API call succeeds

#### 7.6.5 Navigate to Pending Interviewers from Notification

**Test Steps:**
1. Receive a notification about pending interviewer application
2. Click on the notification

**Expected Result:**
- Notification panel closes
- User is navigated to `/dashboard/admin/pending-interviewers`
- Notification is marked as read
- Pending interviewers page loads correctly

**Verification:**
- Navigation works correctly
- Page shows the pending interviewer that triggered the notification

#### 7.6.6 Real-time Notification Updates

**Test Steps:**
1. Login as admin in Browser Tab 1
2. Keep notification panel closed
3. In Browser Tab 2 (or different browser), register a new interviewer
4. Wait up to 30 seconds
5. Check Browser Tab 1

**Expected Result:**
- New notification appears automatically (without refresh)
- Unread count badge updates
- New notification is at the top of the list when panel is opened

**Verification:**
- Polling mechanism works (checks every 30 seconds)
- Notifications update without page refresh

### 7.7 End-to-End: Complete Notification Flow

#### 7.7.1 Full Interviewer Application to Admin Notification Flow

**Test Steps:**

1. **Setup:**
   - Ensure at least one admin user exists
   - Note the admin's email

2. **Register New Interviewer:**
   - Go to Sign Up page (`/login?signup=true`)
   - Select "Interviewer" role
   - Fill in all required fields:
     - Full Name: "Test Interviewer"
     - Email: "test.interviewer@example.com"
     - Password: "password123"
     - Years of Experience: "2-5 years"
     - Area of Expertise: "Full Stack Development"
     - LinkedIn Profile: "https://linkedin.com/in/testinterviewer"
     - Upload Resume (PDF)
   - Submit the form

3. **Verify Backend:**
   - Check MongoDB: `db.notifications.find().sort({ createdAt: -1 }).limit(1).pretty()`
   - Should see a new notification for the admin user

4. **Admin Receives Notification:**
   - Login as admin
   - Check notification bell icon
   - Should see red badge with count "1" (or higher)
   - Click bell icon
   - Should see notification: "New Pending Interviewer Application"
   - Message: "Test Interviewer has submitted an interviewer application and is awaiting review."

5. **Admin Reviews Application:**
   - Click on the notification
   - Should navigate to `/dashboard/admin/pending-interviewers`
   - Notification is marked as read
   - Should see the new interviewer in the pending list

**Verification Checklist:**
- ✅ Notification created in database when interviewer signs up
- ✅ Notification appears in admin's notification panel
- ✅ Unread count badge displays correctly
- ✅ Clicking notification navigates to pending interviewers page
- ✅ Notification is marked as read after clicking
- ✅ Notification count updates in real-time

### 7.8 Edge Cases and Error Scenarios

#### 7.8.1 Multiple Admins Receive Notifications

**Test Steps:**
1. Create 3 admin users:
   ```bash
   # Admin 1
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email": "admin1@example.com", "password": "password123", "role": "admin"}'
   
   # Admin 2
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email": "admin2@example.com", "password": "password123", "role": "admin"}'
   
   # Admin 3
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email": "admin3@example.com", "password": "password123", "role": "admin"}'
   ```

2. Register a new interviewer

3. Check notifications in database:
   ```bash
   db.notifications.find({ "metadata.type": "pending_interviewer_application" }).count()
   ```

**Expected Result:**
- 3 notifications created (one for each admin)
- Each notification has the correct `userId`
- All admins receive the notification

**Verification:**
- Count equals number of admin users
- Each notification is personalized to the admin

#### 7.8.2 Notification Creation Failure Doesn't Break Registration

**Test Steps:**
1. Temporarily break notification service (or disconnect MongoDB)
2. Try to register an interviewer

**Expected Result:**
- Interviewer registration succeeds
- Error is logged but doesn't prevent user creation
- User can still login

**Verification:**
- Registration completes successfully
- User exists in database
- Registration response doesn't mention notification error

#### 7.8.3 Empty Notifications List

**Test Steps:**
1. Login as admin with no notifications
2. Open notification panel

**Expected Result:**
- Panel opens successfully
- Shows empty state: "No notifications"
- Bell icon has no badge
- No errors in console

**Verification:**
- Empty state displays correctly
- UI doesn't break with empty list

#### 7.8.4 Rapid Notification Creation

**Test Steps:**
1. Register 5 interviewers in quick succession
2. Check admin notifications

**Expected Result:**
- All 5 notifications appear
- Each notification is distinct
- All notifications are unread
- Unread count shows correct number

**Verification:**
- No notifications are lost
- Count is accurate
- Timestamps are unique

### 7.9 Database Verification Queries

#### 7.9.1 Check All Notifications for an Admin

```bash
mongo mockrise_auth

# Find admin user ID
var admin = db.users.findOne({ email: "admin@example.com" })

# Get all notifications for this admin
db.notifications.find({ userId: admin._id }).sort({ createdAt: -1 }).pretty()
```

#### 7.9.2 Check Unread Notification Count

```bash
# Get unread count for an admin
var admin = db.users.findOne({ email: "admin@example.com" })
db.notifications.countDocuments({ userId: admin._id, isRead: false })
```

#### 7.9.3 Check Pending Interviewer Notifications

```bash
# Find all notifications about pending interviewer applications
db.notifications.find({ 
  "metadata.type": "pending_interviewer_application" 
}).sort({ createdAt: -1 }).pretty()
```

#### 7.9.4 Verify Notification Structure

```bash
# Get a sample notification to verify structure
db.notifications.findOne()
```

**Expected Structure:**
```json
{
  "_id": ObjectId("..."),
  "userId": ObjectId("..."),  // Admin user ID
  "title": "New Pending Interviewer Application",
  "message": "Interviewer Name has submitted an interviewer application...",
  "type": "info",
  "isRead": false,
  "metadata": {
    "interviewerId": "...",
    "interviewerName": "...",
    "type": "pending_interviewer_application"
  },
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

### 7.10 Frontend UI/UX Testing Checklist

- [ ] Notification bell icon is visible in admin dashboard header
- [ ] Unread count badge appears correctly on bell icon
- [ ] Badge updates in real-time (within 30 seconds of new notification)
- [ ] Notification panel opens/closes smoothly with animations
- [ ] Backdrop click closes the panel
- [ ] Notifications are sorted newest first
- [ ] Timestamps display correctly (relative time)
- [ ] Notification icons match their type
- [ ] Clicking notification marks it as read
- [ ] "Mark all read" button works
- [ ] Clicking pending interviewer notification navigates to correct page
- [ ] Empty state displays when no notifications
- [ ] Panel is responsive on mobile devices
- [ ] Notifications panel doesn't break layout
- [ ] Loading states display during fetch

### 7.11 Performance Testing

#### 7.11.1 Large Number of Notifications

**Test:**
1. Create 100+ notifications for an admin
2. Test notification fetching and display

**Expected:**
- API response time remains reasonable (< 500ms)
- Frontend renders efficiently
- Pagination works correctly
- UI remains responsive

#### 7.11.2 Concurrent Notification Creation

**Test:**
1. Register 10 interviewers simultaneously
2. Verify all notifications are created

**Expected:**
- All notifications are created
- No race conditions
- Database integrity maintained

## Troubleshooting

### Notification System Issues

#### Problem: Notifications Not Appearing

If notifications exist in the database but don't appear when calling `GET /api/notifications`, follow these steps:

**1. Verify User Authentication**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Cookie: token=YOUR_TOKEN"
```
- Check that you're logged in as the correct user
- Verify the user ID matches the notification's `userId`

**2. Check Database**
```bash
# Connect to MongoDB
mongo mockrise_auth

# Check all notifications
db.notifications.find().pretty()

# Check notifications for your user ID
var user = db.users.findOne({ email: "your-email@example.com" })
db.notifications.find({ userId: user._id }).pretty()

# Count unread notifications
db.notifications.countDocuments({ userId: user._id, isRead: false })
```

**3. Common Issues**

**Issue: User ID Mismatch**
- Problem: Logged in as different user than notification recipient
- Solution: Login as the correct user, or check which user should receive the notification

**Issue: ObjectId Type Mismatch (Fixed)**
- Problem: Query used string instead of ObjectId
- Solution: Code now automatically converts to ObjectId - restart server if issue persists

**Issue: No Notifications Created**
- Problem: Notification creation failed silently
- Solution:
  - Check server logs for errors
  - Register a new interviewer to trigger notification creation
  - Verify admin users exist in database

**Issue: Empty Notifications List**
- Problem: User has no notifications or wrong user ID
- Solution:
  - Verify correct user is logged in
  - Check database for notifications with matching userId
  - Register new interviewer to create test notifications

**4. Debug Endpoint**

For detailed debugging, check server console logs when calling `GET /api/notifications`. The logs include:
- User ID being used
- User ID type
- Query results
- Any errors encountered

### Email Configuration Issues

**Problem: Emails Not Sending**

1. **Restart Server**: After updating `.env`, always restart the server
2. **Test Configuration**: Visit `GET /api/email/test` to verify SMTP setup
3. **Check .env File**:
   - Ensure `.env` is in `server/` directory
   - No extra spaces around `=` sign
   - Values not quoted unless necessary
4. **Gmail Users**: Use App Password, not regular password
5. **Development Mode**: In development, check server console for reset links instead of emails

**Common Email Errors:**
- `SMTP connection failed`: Check host and port
- `Authentication failed`: Verify username and password/app password
- `Connection timeout`: Check firewall or network settings

### OAuth Errors

**Problem: OAuth Login Fails**

1. **Verify Credentials**: Check OAuth Client ID and Secret in `.env`
2. **Check Callback URLs**: Must match exactly in provider settings
3. **Clear Cookies**: Clear browser cookies and try again
4. **Provider Settings**: Verify OAuth app is active and properly configured

**Problem: Admin Role Blocked**

- This is intentional security behavior
- Admin roles cannot be assigned via OAuth
- Use email/password registration for admin accounts

### Database Connection Issues

**Problem: MongoDB Connection Fails**

1. **Check MongoDB Status**: `mongod --version` or `systemctl status mongod`
2. **Verify Connection String**: Check `MONGO_URI` in `.env`
3. **Network Issues**: For MongoDB Atlas, check IP whitelist
4. **Connection Pool**: Restart server if connection pool exhausted

## Conclusion

This testing guide covers all major functionality of the authentication system, including the interviewer verification flow and the notification system. Use the troubleshooting section above for common issues. Make sure to test all scenarios to ensure the system is working correctly before deploying to production.
