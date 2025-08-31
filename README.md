# EnergeX - Full-Stack Microservice API

Simple full-stack application built with Laravel Lumen (PHP), Node.js (TypeScript), React, Redis caching, and MySQL database, fully containerized with Docker and automated CI pipeline.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│────│  Lumen Backend  │────│   MySQL DB      │
│   (TypeScript)  │    │     (PHP)       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐    ┌─────────────────┐
                    │  Cache Service  │────│   Redis Cache   │
                    │   (Node.js)     │    │                 │
                    └─────────────────┘    └─────────────────┘
```
## Project Structure

```
energeX-test/
├── backend-php/          # Lumen API (PHP)
│   ├── app/Http/Controllers/
│   ├── database/migrations/
│   ├── tests/
│   └── Dockerfile
├── cache-node/           # Cache Service (Node.js + TypeScript)  
│   ├── src/
│   ├── tests/
│   └── Dockerfile
├── frontend/             # React Frontend (TypeScript)
│   ├── src/components/
│   ├── src/pages/
│   └── Dockerfile
├── .github/workflows/    # CI/CD Pipeline
├── docker-compose.yml    # Service Orchestration
└── README.md            # This file
```

## Quick Start

### Setup & Run
```bash
git clone <repository-url>
cd energeX-test
docker-compose up -d
```

**Services will be available at:**
- Frontend: http://localhost:5173
- Lumen API: http://localhost:8000
- Cache API: http://localhost:3001
- MySQL: localhost:3306
- Redis: localhost:6379

### Development Setup
```bash
# Backend (Lumen)
cd backend-php
composer install
php artisan migrate
php artisan serve

# Cache Service (Node.js)
cd cache-node
npm install
npm run dev

# Frontend (React)
cd frontend
npm install
npm run dev
```

## Technical Fulfillment

### ✅ Backend (Lumen – PHP)

**Implementation Location:** `backend-php/`

- **JWT Authentication:** - Done through `php-open-source-saver/jwt-auth` package (`composer.json:11`)
- **REST API Endpoints:** (`routes/web.php:25-33`)
  - `POST /api/register` - User registration (`AuthController@register`)
  - `POST /api/login` - User authentication (`AuthController@login`)
  - `GET /api/posts` - Fetch all posts with Redis caching (`PostController@index`)
  - `POST /api/posts` - Create new post (`PostController@store`)
  - `GET /api/posts/{id}` - Fetch single post with Redis caching (`PostController@show`)

**Key Features:**
- Redis caching implementation (`PostController.php:13-24, 42-55`)
- JWT middleware protection (`routes/web.php:28-32`)
- Automatic cache invalidation on post creation (`PostController.php:35`)
- Password hashing via Laravel's User model

### ✅ Backend (Node.js – TypeScript)

**Implementation Location:** `cache-node/`

- **Express.js with TypeScript:** Full TypeScript implementation (`src/index.ts`)
- **Redis Client:** IORedis for high-performance caching (`package.json:15`)
- **MySQL Client:** mysql2 for database connectivity (`package.json:16`)

**Cache API Endpoints:**
- `GET /cache/posts` - Cached posts with DB fallback (`src/index.ts:14-23`)
- `GET /cache/posts/:id` - Cached single post with DB fallback (`src/index.ts:25-37`)

**Cache Strategy:**
- Cache-first approach with automatic DB fallback
- Configurable TTL (60s for all posts, 300s for single posts)
- Connection pooling for MySQL performance

### ✅ Database (MySQL)

**Implementation Location:** `backend-php/database/`

**Database Schema:**
- **Users Table:** `migrations/2025_08_31_002259_create_users_table.php`
  - Fields: id, email (unique), password (hashed), timestamps
- **Posts Table:** `migrations/2025_08_31_002305_create_posts_table.php`
  - Fields: id, title, content, user_id (foreign key), timestamps
  - Foreign key constraint with cascade delete

**Security Features:**
- Password hashing via Laravel's built-in mechanisms
- Email uniqueness constraints
- Foreign key relationships with referential integrity

### ✅ Frontend (React.js)

**Implementation Location:** `frontend/`

**Tech Stack:**
- React 19 with TypeScript (`package.json:14-15`)
- Vite build tool with SWC for fast refresh (`package.json:23`)
- React Router for navigation (`package.json:16`)
- Axios for API communication (`package.json:13`)

**Key Features:**
- **Authentication Pages:** Login (`LoginPage.tsx`) & Register (`RegisterPage.tsx`)
- **Post Management:** Display posts (`PostList.tsx`) & Create posts (`PostForm.tsx`)
- **API Integration:** Dual API client setup (`utils/api.ts:8-22`)
  - Primary: Lumen backend (port 8000)
  - Fallback: Node.js cache service (port 3001)
- **State Management:** Custom auth store (`stores/authStore.ts`)
- **Protected Routes:** JWT-based route protection (`App.tsx:30-32`)

### ✅ Unit Testing

**Backend Testing (PHPUnit):** `backend-php/tests/`
- **Auth Tests:** `AuthTest.php` - Registration, login, validation
- **Post Tests:** `PostTest.php` - CRUD operations, authorization
- **Database Transactions:** Proper test isolation (`AuthTest.php:11`)

**Node.js Testing (Jest + Supertest):** `cache-node/src/index.test.ts`
- Cache hit/miss scenarios
- Database fallback testing
- Error handling (404 responses)
- Mock implementations for Redis and MySQL

**Test Commands:**
```bash
# Backend tests
cd backend-php && ./vendor/bin/phpunit

# Cache service tests  
cd cache-node && npm test
```

### ✅ DevOps (Docker)

**Implementation Location:** Root `docker-compose.yml` + individual Dockerfiles

**Services Architecture:**
- **MySQL:** Official MySQL 8 image with custom database (`docker-compose.yml:2-12`)
- **Redis:** Official Redis 7 image (`docker-compose.yml:14-17`)
- **Lumen Backend:** Custom PHP 8.2 Alpine image (`backend-php/Dockerfile`)
- **Cache Service:** Node.js 20 Alpine with TypeScript (`cache-node/Dockerfile`)
- **React Frontend:** Node.js build with Vite production server (`frontend/Dockerfile`)

**Container Features:**
- Multi-stage builds for optimized images
- Proper dependency management and build caching
- Health checks and service dependencies
- Volume persistence for MySQL data

### ✅ CI/CD Pipeline

**Implementation Location:** `.github/workflows/ci.yml`

**Pipeline Features:**
- **Triggers:** Push and Pull Request events
- **Services:** MySQL and Redis containers for testing
- **PHP Testing:** 
  - PHP 8.2 setup with extensions
  - Composer dependency installation
  - Database migrations
  - PHPUnit test execution
- **Node.js Testing:**
  - Node 20 environment
  - Jest test execution with proper isolation

**Environment Configuration:**
- Database and Redis connection strings
- JWT secrets for testing
- Parallel test execution where possible

## API Documentation

### Authentication Endpoints

```http
POST /api/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 201 Created
{
  "access_token": "jwt_token_here",
  "token_type": "bearer",
  "user": { "id": 1, "email": "user@example.com" }
}
```

```http
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com", 
  "password": "password123"
}

Response: 200 OK
{
  "access_token": "jwt_token_here",
  "token_type": "bearer",
  "user": { "id": 1, "email": "user@example.com" }
}
```

### Posts Endpoints

```http
GET /api/posts
Authorization: Bearer {jwt_token}

Response: 200 OK (Cached via Redis)
[
  {
    "id": 1,
    "title": "Post Title",
    "content": "Post content...",
    "user_id": 1,
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

```http
POST /api/posts  
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "title": "New Post",
  "content": "Post content here..."
}

Response: 201 Created
{
  "id": 2,
  "title": "New Post", 
  "content": "Post content here...",
  "user_id": 1,
  "created_at": "2025-01-01T00:00:00Z"
}
```

### Cache Service Endpoints

```http
GET /cache/posts
Response: 200 OK (Redis first, MySQL fallback)

GET /cache/posts/{id}  
Response: 200 OK (Redis first, MySQL fallback)
Response: 404 Not Found (if post doesn't exist)
```

## Testing

### Running Tests

```bash
# All services
docker-compose up -d
docker-compose exec backend-php ./vendor/bin/phpunit
docker-compose exec cache-node npm test

# Local development
cd backend-php && ./vendor/bin/phpunit --filter=AuthTest
cd cache-node && npm test -- --verbose
```

### Test Coverage

- **Backend:** Authentication, authorization, CRUD operations, validation
- **Cache Service:** Cache hits/misses, fallback mechanisms, error handling
- **Integration:** End-to-end API workflows with real database transactions

## Security Features

- **JWT Authentication:** Secure token-based auth with configurable expiry
- **Password Hashing:** Laravel's bcrypt implementation
- **CORS Middleware:** Proper cross-origin request handling
- **Input Validation:** Request validation on all endpoints
- **SQL Injection Protection:** Parameterized queries and ORM usage
- **Environment Isolation:** Separate configs for dev/test/prod

## Performance Features

- **Redis Caching:** Sub-millisecond response times for cached content
- **Connection Pooling:** MySQL connection optimization
- **Cache Invalidation:** Automatic cache clearing on data updates
- **Docker Optimization:** Multi-stage builds and Alpine images
- **Database Indexing:** Proper primary keys and foreign key indexes

## Development Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f [service_name]

# Backend development
cd backend-php
composer install
php artisan migrate
php artisan serve

# Cache service development  
cd cache-node
npm install
npm run dev

# Frontend development
cd frontend
npm install  
npm run dev

# Run tests
./vendor/bin/phpunit           # Backend
npm test                       # Cache service
npm run lint                   # Frontend linting
```

## Monitoring & Debugging

- **Application Logs:** Available via `docker-compose logs`
- **Database Access:** MySQL on port 3306 (user: app, password: app)
- **Redis CLI:** `docker-compose exec redis redis-cli`
- **Health Checks:** Built into Docker containers
- **Error Handling:** Comprehensive error responses with proper HTTP status codes

