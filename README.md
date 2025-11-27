# MockRise - AI-Powered Interview Platform

A comprehensive full-stack application for conducting AI-powered mock interviews with role-based dashboards for trainees, interviewers, and admins.

## 🚀 Quick Start

Follow these steps to get started:

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

## 💻 Technologies Used

This project is built with:

- **Vite** - Next-generation frontend tooling
- **TypeScript** - Typed JavaScript
- **React** - UI library
- **React Three Fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers and abstractions for React Three Fiber
- **shadcn-ui** - UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **Node.js/Express** - Backend runtime and framework
- **MongoDB/Mongoose** - Database and ODM
- **Passport.js** - Authentication middleware

## 📚 Documentation

For detailed information, see:

- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Complete project structure, architecture, API routes, and setup guide
- **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** - UI/UX design system, components, styling, and theme guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide with Vercel setup and security best practices
- **[server/README.md](./server/README.md)** - Backend authentication system documentation and API endpoints
- **[server/TESTING_GUIDE.md](./server/TESTING_GUIDE.md)** - Comprehensive backend API testing guide and test cases

## 🏗️ Project Overview

### Backend
- Node.js/Express server with RESTful API routes (`/api/`)
- MongoDB database with Mongoose ODM
- JWT authentication with HTTP-only cookies
- OAuth integration (Google, GitHub)
- Role-based access control (trainee, interviewer, admin)
- Professional MVC architecture with services layer

### Frontend
- React with TypeScript
- Organized component structure
- Centralized API services
- Role-based dashboards
- Responsive design with Tailwind CSS
- 3D visualizations with Three.js

## 📖 Features

- **Authentication**: Email/password and OAuth login
- **Role-Based Dashboards**: Separate dashboards for trainees, interviewers, and admins
- **Protected Routes**: Route guards based on user roles
- **Modern UI**: Built with shadcn-ui components
- **3D Visualizations**: Interactive 3D scenes
- **Responsive Design**: Works on all device sizes

## 🛠️ Development

### Start Development Servers

**Frontend:**
```bash
npm run dev  # Starts on port 8080
```

**Backend:**
```bash
cd server
npm install
npm run dev  # Starts on port 5000
```

### Environment Setup

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for complete environment variable configuration.

---

**For more detailed information, please refer to the documentation files listed above.**

