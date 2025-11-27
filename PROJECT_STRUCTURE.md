# MockRise - Complete Project Structure

> **Single source of truth for project structure and architecture**

## Related Documentation

- **[README.md](./README.md)** - Quick start guide and project overview
- **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** - UI/UX design system and component library
- **[server/README.md](./server/README.md)** - Backend authentication system documentation
- **[server/TESTING_GUIDE.md](./server/TESTING_GUIDE.md)** - Comprehensive backend API testing guide

> **Tip:** Start with [README.md](./README.md) for a quick overview, then dive into specific documentation as needed.

---

## 📁 Complete Directory Tree

```
MockRise/
├── server/                              # Backend (Node.js/Express)
│   ├── src/                             # ✅ All backend source code
│   │   ├── config/                      # Configuration files
│   │   │   ├── database.js              # MongoDB connection
│   │   │   ├── passport.js              # Passport OAuth strategies
│   │   │   ├── env.js                   # Environment validation
│   │   │   └── cors.js                  # CORS configuration
│   │   │
│   │   ├── routes/                      # API routes
│   │   │   ├── index.js                 # Route aggregator
│   │   │   └── v1/                      # API version 1
│   │   │       ├── index.js             # V1 route aggregator
│   │   │       ├── auth.routes.js       # Authentication routes
│   │   │       └── dashboard.routes.js  # Dashboard routes
│   │   │
│   │   ├── controllers/                 # Route controllers
│   │   │   ├── auth.controller.js       # Auth controller
│   │   │   └── dashboard.controller.js  # Dashboard controller
│   │   │
│   │   ├── services/                    # Business logic layer
│   │   │   ├── auth.service.js          # Auth business logic
│   │   │   └── token.service.js         # Token management
│   │   │
│   │   ├── models/                      # Database models
│   │   │   └── User.js                  # User model
│   │   │
│   │   ├── middlewares/                 # Express middlewares
│   │   │   ├── auth.middleware.js       # Authentication middleware
│   │   │   ├── error.middleware.js      # Error handling
│   │   │   └── logger.middleware.js     # Request logging
│   │   │
│   │   ├── utils/                       # Utility functions
│   │   │   ├── generateToken.js         # JWT token generation
│   │   │   ├── asyncHandler.js          # Async error handler
│   │   │   ├── logger.js                # Logger utility
│   │   │   └── errors.js                # Custom error classes
│   │   │
│   │   │
│   │   ├── app.js                       # Express app setup
│   │   └── server.js                    # Server entry point ⭐
│   │
│   ├── node_modules/
│   ├── .env                             # Environment variables
│   ├── package.json                     # Entry: "main": "src/server.js"
│   ├── package-lock.json
│   ├── README.md
│   └── TESTING_GUIDE.md
│
├── client/                              # Frontend (React/TypeScript)
│   ├── assets/                          # Static assets (future)
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── components/                      # React components
│   │   ├── common/                      # ✅ Common components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── ThemeToggle.tsx
│   │   │
│   │   ├── layout/                      # ✅ Layout components
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── DashboardSidebar.tsx
│   │   │   └── ResponsiveLayout.tsx
│   │   │
│   │   ├── auth/                        # ✅ Auth components
│   │   │   ├── RouteGuard.tsx
│   │   │   └── auth-background.tsx
│   │   │
│   │   ├── 3D/                          # Three.js components
│   │   │   ├── BackgroundMesh.tsx
│   │   │   ├── FloatingNodes3D.tsx
│   │   │   ├── FloatingShapes.tsx
│   │   │   ├── InteractiveMesh.tsx
│   │   │   ├── Section3D.tsx
│   │   │   ├── WaveMesh.tsx
│   │   │   ├── Hero3D.tsx
│   │   │   └── ThreeDScene.tsx
│   │   │
│   │   ├── ui/                          # Shadcn UI components
│   │   │   └── [all ui components]
│   │   │
│   │   └── [other feature components]
│   │
│   ├── pages/                           # ✅ Page components (organized)
│   │   ├── public/                      # ✅ Public pages (no auth)
│   │   │   ├── Landing.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   ├── Pricing.tsx
│   │   │   ├── Resources.tsx
│   │   │   ├── HelpCenter.tsx
│   │   │   ├── FAQ.tsx
│   │   │   └── StyleGuide.tsx
│   │   │
│   │   ├── auth/                        # ✅ Auth-related pages
│   │   │   ├── PendingVerification.tsx
│   │   │   └── RejectedNotice.tsx
│   │   │
│   │   ├── dashboard/                   # ✅ Dashboard pages (by role)
│   │   │   ├── trainee/                 # Trainee dashboard
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Schedule.tsx
│   │   │   │   ├── MySessions.tsx
│   │   │   │   ├── SessionScreen.tsx
│   │   │   │   ├── SpeechAnalysis.tsx
│   │   │   │   ├── Feedback.tsx
│   │   │   │   └── Settings.tsx
│   │   │   │
│   │   │   ├── interviewer/             # Interviewer dashboard
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── AssignedInterviews.tsx
│   │   │   │   ├── QuestionBank.tsx
│   │   │   │   ├── FeedbackReview.tsx
│   │   │   │   └── PerformanceStats.tsx
│   │   │   │
│   │   │   └── admin/                   # Admin dashboard
│   │   │       ├── Dashboard.tsx
│   │   │       ├── UsersManagement.tsx
│   │   │       ├── InterviewsManagement.tsx
│   │   │       ├── QuestionsManagement.tsx
│   │   │       ├── AdminAnalytics.tsx
│   │   │       ├── SystemConfig.tsx
│   │   │       └── Profile.tsx
│   │   │
│   │   └── error/                       # ✅ Error pages
│   │       ├── NotFound.tsx
│   │       └── Unauthorized.tsx
│   │
│   ├── routes/                          # ✅ Routing configuration
│   │   ├── index.tsx                    # Main router
│   │   ├── public.routes.tsx            # Public routes
│   │   ├── protected.routes.tsx         # Protected routes
│   │   └── routes.config.ts             # Route constants
│   │
│   ├── services/                        # ✅ API services layer
│   │   ├── api/
│   │   │   ├── client.ts                # API client (fetch wrapper)
│   │   │   └── endpoints.ts             # API endpoint constants
│   │   ├── auth.service.ts              # Auth API calls
│   │   └── dashboard.service.ts         # Dashboard API calls
│   │
│   ├── contexts/                        # React contexts
│   │   └── AuthContext.tsx              # ✅ Updated to use services
│   │
│   ├── hooks/                           # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── usePermissions.ts
│   │   ├── useScrollSpy.ts
│   │   └── use-mobile.tsx
│   │
│   ├── types/                           # TypeScript types
│   │   └── dashboard.ts
│   │
│   ├── config/                          # ✅ Configuration
│   │   ├── env.ts                       # Environment config
│   │   └── dashboardConfigs.ts
│   │
│   ├── lib/                             # Library code
│   │   ├── utils.ts
│   │   └── design-tokens.ts
│   │
│   ├── styles/                          # Global styles
│   │   ├── index.css
│   │   └── auth.css
│   │
│   ├── App.tsx                          # ✅ Updated to use new routes
│   ├── main.tsx                         # Entry point ⭐
│   └── vite-env.d.ts
│
├── public/                              # Public static files
│   ├── placeholder.svg
│   └── robots.txt
│
├── .env.local                           # Frontend environment variables
├── .env.example                         # Example env file
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── PROJECT_STRUCTURE.md                 # ✅ This file (master documentation)
└── README.md
```

---

## 🏗️ Architecture Overview

### Backend Architecture (`server/src/`)

**Separation of Concerns:**
1. **Routes** (`routes/v1/`) - Define API endpoints
2. **Controllers** (`controllers/`) - Handle HTTP requests/responses
3. **Services** (`services/`) - Business logic (testable, reusable)
4. **Models** (`models/`) - Database schemas (MongoDB/Mongoose)
5. **Middlewares** (`middlewares/`) - Request processing (auth, errors, logging)
6. **Utils** (`utils/`) - Helper functions and utilities
7. **Config** (`config/`) - Configuration and setup

**Key Features:**
- ✅ Clean API routes (`/api/`)
- ✅ Service layer for business logic
- ✅ Centralized error handling
- ✅ Request logging
- ✅ Environment validation
- ✅ Custom error classes

### Frontend Architecture (`client/`)

**Organized Structure:**
1. **Pages** (`pages/`) - Organized by access level and role
   - `public/` - No authentication required
   - `auth/` - Authentication-related pages
   - `dashboard/[role]/` - Role-based dashboards
   - `error/` - Error pages

2. **Components** (`components/`) - Organized by type
   - `common/` - Shared components (Navbar, Footer)
   - `layout/` - Layout components
   - `auth/` - Auth-specific components
   - `ui/` - UI component library

3. **Services** (`services/`) - API communication layer
   - Centralized API client
   - Service functions for each feature
   - Type-safe API calls

4. **Routes** (`routes/`) - Route configuration
   - Separated from App.tsx
   - Route constants for maintainability

**Key Features:**
- ✅ Centralized API client
- ✅ Environment configuration
- ✅ Type-safe API services
- ✅ Organized routing
- ✅ Component organization

---

## 📡 API Routes Structure

### Backend API Endpoints (`/api/`)

#### Authentication Routes
```
POST   /api/auth/register          # Register user
POST   /api/auth/login             # Login user
GET    /api/auth/me                # Get current user
POST   /api/auth/logout            # Logout user
GET    /api/auth/google            # Google OAuth
GET    /api/auth/google/callback   # Google OAuth callback
GET    /api/auth/github            # GitHub OAuth
GET    /api/auth/github/callback   # GitHub OAuth callback
```

#### Dashboard Routes
```
GET    /api/dashboard/trainee      # Trainee dashboard data
GET    /api/dashboard/interviewer  # Interviewer dashboard data
GET    /api/dashboard/admin        # Admin dashboard data
```

---

## 🔗 Frontend Routes

### Public Routes
```
/                     → Landing
/login                → Login
/forgot-password      → Forgot Password
/pricing              → Pricing
/resources            → Resources
/help                 → Help Center
/faq                  → FAQ
/pending-verification → Pending Verification
/rejected-notice      → Rejected Notice
/unauthorized         → Unauthorized
```

### Trainee Dashboard (`/dashboard/trainee`)
```
/dashboard/trainee                 → Dashboard
/dashboard/trainee/schedule        → Schedule
/dashboard/trainee/sessions        → My Sessions
/dashboard/trainee/sessions/:id    → Session Detail
/dashboard/trainee/speech-analysis → Speech Analysis
/dashboard/trainee/feedback        → Feedback
/dashboard/trainee/settings        → Settings
```

### Interviewer Dashboard (`/dashboard/interviewer`)
```
/dashboard/interviewer         → Dashboard
/dashboard/interviewer/assigned → Assigned Interviews
/dashboard/interviewer/questions → Question Bank
/dashboard/interviewer/feedback  → Feedback Review
/dashboard/interviewer/stats     → Performance Stats
/dashboard/interviewer/settings  → Settings
```

### Admin Dashboard (`/dashboard/admin`)
```
/dashboard/admin         → Dashboard
/dashboard/admin/users   → Users Management
/dashboard/admin/interviews → Interviews Management
/dashboard/admin/questions  → Questions Management
/dashboard/admin/analytics  → Analytics
/dashboard/admin/config     → System Config
/dashboard/admin/profile    → Profile
```

---

## ✅ Completed Restructuring

### Backend (`server/`)
- ✅ Created `server/src/` structure
- ✅ Clean API routes (`/api/`)
- ✅ Created services layer
- ✅ Added error handling middleware
- ✅ Added request logging middleware
- ✅ Organized configuration files
- ✅ Cleaned up old files

### Frontend (`client/`)
- ✅ Organized pages by type and role
- ✅ Organized components by category
- ✅ Created API services layer
- ✅ Separated routes from App.tsx
- ✅ Added environment configuration
- ✅ Updated all imports

---

## 🚀 Getting Started

### Installation & Setup

Follow these steps to get the project running:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub:**
- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces:**
- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

### Technologies Used

This project is built with:

- **Vite** - Next-generation frontend tooling
- **TypeScript** - Typed JavaScript
- **React** - UI library
- **shadcn-ui** - UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **Node.js/Express** - Backend runtime and framework
- **MongoDB/Mongoose** - Database and ODM
- **Passport.js** - Authentication middleware

### Environment Variables

**Backend (`server/.env`):**
```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:8080
BACKEND_URL=http://localhost:5000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

**Frontend (`.env.local`):**
```env
VITE_API_URL=http://localhost:5000
VITE_FRONTEND_URL=http://localhost:8080
```

### Start Development Servers

**Backend:**
```bash
cd server
npm install  # If not already installed
npm run dev   # Starts on port 5000
```

**Frontend:**
```bash
npm install  # If not already installed
npm run dev  # Starts on port 8080
```

**Note:** Make sure to set up your environment variables (`.env` files) before starting the servers.

---

## 📝 Key Files

### Entry Points
- **Backend:** `server/src/server.js`
- **Frontend:** `client/main.tsx`

### Main Configuration
- **Backend App:** `server/src/app.js`
- **Frontend App:** `client/App.tsx`
- **Routes:** `client/routes/index.tsx`

### API Services
- **API Client:** `client/services/api/client.ts`
- **Auth Service:** `client/services/auth.service.ts`
- **Dashboard Service:** `client/services/dashboard.service.ts`

---

## 🔄 Migration Notes

### API Routes
- All API routes are mounted at `/api/` (no versioning)
- ✅ Frontend uses centralized endpoint definitions via service layer

### File Organization
- ✅ All pages organized by type and role
- ✅ Components organized by category
- ✅ All import paths updated

---

## 📚 Architecture Benefits

1. **Scalability** - Easy to add new features and routes
2. **Maintainability** - Clear separation of concerns
3. **Testability** - Services layer makes unit testing easier
4. **API Versioning** - Allows future API changes without breaking clients
5. **Type Safety** - TypeScript types for API responses
6. **Error Handling** - Centralized error handling
7. **Code Reusability** - Shared services and utilities
8. **Environment Management** - Proper configuration management

---

## 🔜 Future Enhancements

- [ ] Input validation layer (backend)
- [ ] Rate limiting middleware
- [ ] Request/response interceptors
- [ ] Unit and integration tests
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Shared TypeScript types between frontend/backend
- [ ] Performance monitoring
- [ ] CI/CD pipeline

---

**Last Updated:** Structure reorganization completed ✅  
**Status:** Production-ready architecture implemented

