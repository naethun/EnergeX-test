# Backend PHP (Laravel Lumen)

RESTful API backend built with Laravel Lumen, featuring JWT authentication, Redis caching, and MySQL database integration.

## Architecture

```
┌─────────────────┐
│   HTTP Request  │
└─────────┬───────┘
          │
┌─────────▼───────┐
│  CORS Middleware│
└─────────┬───────┘
          │
┌─────────▼───────┐
│ JWT Auth Guard  │
└─────────┬───────┘
          │
┌─────────▼───────┐
│   Controllers   │
└─────────┬───────┘
          │
┌─────────▼───────┐    ┌─────────────┐
│   Eloquent ORM  │────│   MySQL     │
└─────────┬───────┘    └─────────────┘
          │
┌─────────▼───────┐    ┌─────────────┐
│  Redis Cache    │────│   Redis     │
└─────────────────┘    └─────────────┘
```

## Project Structure

```
backend-php/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AuthController.php    # User authentication
│   │   │   ├── PostController.php    # Posts CRUD with caching
│   │   │   └── Controller.php        # Base controller
│   │   └── Middleware/
│   └── Models/
│       ├── User.php                  # User model with JWT
│       └── Post.php                  # Post model with relationships
├── config/                           # Configuration files
├── database/
│   └── migrations/
│       ├── *_create_users_table.php  # Users schema
│       └── *_create_posts_table.php  # Posts schema
├── routes/
│   └── web.php                       # API routes definition
├── tests/
│   ├── AuthTest.php                  # Authentication tests
│   ├── PostTest.php                  # Posts API tests
│   └── TestCase.php                  # Base test class
├── bootstrap/app.php                 # Application bootstrap
├── composer.json                     # Dependencies
├── phpunit.xml                       # Test configuration
└── Dockerfile                        # Container definition
```

## Key Components

### Controllers

#### AuthController (`app/Http/Controllers/AuthController.php`)
Handles user authentication and registration:

**Methods:**
- `register()` - Creates new user account with email validation
- `login()` - Authenticates user and returns JWT token

**Features:**
- Email uniqueness validation
- Password length requirements (min 6 chars)
- Automatic JWT token generation
- User model integration

#### PostController (`app/Http/Controllers/PostController.php`)
Manages posts CRUD operations with Redis caching:

**Methods:**
- `index()` - Lists all posts (cached for 60s)
- `store()` - Creates new post (invalidates cache)
- `show($id)` - Shows single post (cached for 60s)

**Caching Strategy:**
- Cache key patterns: `posts:all`, `posts:{id}`
- Automatic cache invalidation on creation
- JSON serialization for complex objects
- Eager loading of user relationships

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### Posts Table
```sql
CREATE TABLE posts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## API Endpoints

### Authentication
```http
POST /api/register
POST /api/login
```

### Posts (Protected by JWT)
```http
GET    /api/posts      # List all posts (cached)
POST   /api/posts      # Create new post
GET    /api/posts/{id} # Get single post (cached)
```

## Configuration

### Environment Variables
```bash
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=app
DB_USERNAME=app
DB_PASSWORD=app

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

JWT_SECRET=your-secret-key
JWT_TTL=60
```

### Dependencies (`composer.json`)
- `laravel/lumen-framework` - Micro-framework
- `php-open-source-saver/jwt-auth` - JWT authentication
- `illuminate/redis` - Redis integration
- `predis/predis` - Redis client

## Development

### Setup
```bash
composer install
cp .env.example .env
php artisan migrate
php artisan serve
```

### Testing
```bash
./vendor/bin/phpunit
./vendor/bin/phpunit --filter=AuthTest
./vendor/bin/phpunit tests/PostTest.php
```

### Docker
```bash
docker build -t energex-backend .
docker run -p 8000:8000 energex-backend
```

## Security Features

- **JWT Authentication**: Stateless token-based auth
- **Password Hashing**: bcrypt with salt
- **CORS Protection**: Configurable CORS middleware
- **Input Validation**: Request validation on all endpoints
- **SQL Injection Protection**: Eloquent ORM parameterized queries
- **Mass Assignment Protection**: Fillable attributes

## Performance Optimizations

- **Redis Caching**: 60-second TTL for frequently accessed data
- **Eager Loading**: User relationships loaded efficiently
- **Connection Pooling**: Database connection optimization
- **Optimized Autoloader**: Composer optimization flags
- **Cache Invalidation**: Strategic cache clearing on updates

## Testing Strategy

- **Feature Tests**: Full HTTP request/response cycle testing
- **Database Transactions**: Isolated test data with rollback
- **Authentication Testing**: Login/register flows
- **Authorization Testing**: Protected route access
- **Validation Testing**: Input validation rules
- **Cache Testing**: Redis integration testing
