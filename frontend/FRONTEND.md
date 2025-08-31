# Frontend (React + TypeScript)

Modern React frontend built with TypeScript, featuring JWT authentication, post management, and dual API integration with caching fallback.

## Architecture

```
┌─────────────────┐
│    Browser      │
└─────────┬───────┘
          │
┌─────────▼───────┐
│  React Router   │
└─────────┬───────┘
          │
┌─────────▼───────┐
│   Components    │
└─────────┬───────┘
          │
┌─────────▼───────┐    ┌─────────────┐
│   Auth Store    │────│ LocalStorage│
└─────────┬───────┘    └─────────────┘
          │
┌─────────▼───────┐    ┌─────────────────┐
│  API Client     │────│ Lumen Backend   │
│   (Axios)       │    │   (Port 8000)   │
└─────────┬───────┘    └─────────────────┘
          │
          └─────────────┐ ┌─────────────────┐
                        └─│ Cache Service   │
                          │   (Port 3001)   │
                          └─────────────────┘
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── AuthForm.tsx      # Reusable auth form component
│   │   ├── PostForm.tsx      # Create post form
│   │   └── PostList.tsx      # Display posts list
│   ├── pages/
│   │   ├── LoginPage.tsx     # Login page
│   │   ├── RegisterPage.tsx  # Registration page  
│   │   └── PostsPage.tsx     # Main posts dashboard
│   ├── stores/
│   │   └── authStore.ts      # Authentication state management
│   ├── utils/
│   │   ├── api.ts            # API client configuration
│   │   └── error.ts          # Error handling utilities
│   ├── types/
│   │   └── index.ts          # TypeScript type definitions
│   ├── App.tsx               # Main app component with routing
│   ├── main.tsx              # App entry point
│   └── App.css               # Global styles
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite build configuration
├── eslint.config.js          # ESLint configuration
└── Dockerfile                # Container definition
```

## Key Components

### Authentication System

#### Auth Store (`src/stores/authStore.ts`)
Centralized authentication state management with JWT token storage.

#### Auth Form Component (`src/components/AuthForm.tsx`)
Reusable form component supporting both login and registration modes.

#### Page Components
- **LoginPage** - User authentication
- **RegisterPage** - New user registration  
- **PostsPage** - Main dashboard with posts

### Post Management

#### Post List Component (`src/components/PostList.tsx`)
Displays posts with loading states and responsive design.

#### Post Form Component (`src/components/PostForm.tsx`)
Create new posts with validation and loading states.

## API Integration (`src/utils/api.ts`)

### Dual Client Setup
- **Primary**: Lumen backend (port 8000)
- **Fallback**: Cache service (port 3001) for faster data access

### Features
- JWT authentication with automatic token injection
- Automatic logout on 401 responses
- Cache-first strategy for post retrieval
- Error handling with user feedback

## Type Safety (`src/types/index.ts`)

Complete TypeScript definitions for:
- User and authentication data
- Post entities and forms
- API request/response interfaces

## Routing (`src/App.tsx`)

Protected routes with automatic redirects:
- `/login` - Authentication page
- `/register` - User registration
- `/posts` - Main dashboard (protected)
- `/` - Auto-redirect based on auth state

## Development

### Setup
```bash
npm install
npm run dev          # Development server (http://localhost:5173)
```

### Build
```bash
npm run build        # TypeScript check + Vite build
npm run preview      # Preview production build
```

### Linting
```bash
npm run lint         # ESLint check
```

## Performance Features

- **Vite**: Lightning-fast HMR and optimized builds
- **SWC**: Fast TypeScript compilation and React refresh
- **React 19**: Latest React with improved performance
- **Caching Strategy**: Cache service fallback for faster data access

## Security Features

- **JWT Storage**: Secure token storage in localStorage
- **Protected Routes**: Authentication-based route guards
- **Automatic Logout**: Token expiry handling
- **Input Validation**: Form validation before API calls
