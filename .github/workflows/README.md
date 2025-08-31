# CI/CD Pipeline

Automated Continuous Integration and Continuous Deployment pipeline using GitHub Actions for comprehensive testing of both PHP and Node.js services.

## Architecture

```
┌─────────────────┐
│  GitHub Event   │
│ (Push/PR/etc.)  │
└─────────┬───────┘
          │
┌─────────▼───────┐
│ GitHub Actions  │
│    Runner       │
└─────────┬───────┘
          │
┌─────────▼───────┐    ┌─────────────────┐
│  Service Setup  │────│ MySQL Container │
└─────────┬───────┘    └─────────────────┘
          │
          ├─────────────┐ ┌─────────────────┐
          │             └─│ Redis Container │
          │               └─────────────────┘
          │
┌─────────▼───────┐
│  Test Execution │
└─────────┬───────┘
          │
┌─────────▼───────┐
│ Results Report  │
└─────────────────┘
```

## Pipeline Configuration (`.github/workflows/ci.yml`)

### Trigger Events
```yaml
on: [push, pull_request]
```
**Activates on:**
- Every push to any branch
- All pull request events (open, sync, etc.)
- Manual workflow dispatch

### Job: `test`

#### Environment
- **OS**: Ubuntu Latest
- **Concurrency**: Single job with parallel service containers
- **Timeout**: Default GitHub Actions timeout (6 hours max)

#### Service Containers

##### MySQL Service
```yaml
mysql:
  image: mysql:8
  env:
    MYSQL_DATABASE: app
    MYSQL_ROOT_PASSWORD: root
    MYSQL_USER: app
    MYSQL_PASSWORD: app
  ports: ['3306:3306']
  options: >-
    --health-cmd="mysqladmin ping -h localhost -proot"
    --health-interval=10s --health-timeout=5s --health-retries=10
```

**Features:**
- MySQL 8.0 official Docker image
- Custom database and user configuration
- Health checks with retry logic
- Port mapping for localhost access

##### Redis Service
```yaml
redis:
  image: redis:7
  ports: ['6379:6379']
```

**Features:**
- Redis 7.0 official Docker image
- Standard port mapping
- No authentication required (test environment)

### Pipeline Steps

#### 1. Repository Checkout
```yaml
- uses: actions/checkout@v4
```
- Checks out the repository code
- Uses the latest stable checkout action
- Includes all files needed for testing

#### 2. PHP Environment Setup
```yaml
- uses: shivammathur/setup-php@v2
  with: { php-version: '8.2' }
```
**Configuration:**
- PHP 8.2 (matches production environment)
- Automatic extension detection from composer.json
- Optimized for CI performance

#### 3. PHP Dependencies
```yaml
- run: composer install --no-interaction --prefer-dist
  working-directory: backend-php
```
**Features:**
- Non-interactive installation
- Prefers distribution packages over source
- Installs to backend-php directory

#### 4. Database Migration
```yaml
- run: php artisan migrate --force
  working-directory: backend-php
  env:
    DB_CONNECTION: mysql
    DB_HOST: 127.0.0.1
    DB_PORT: 3306
    DB_DATABASE: app
    DB_USERNAME: app
    DB_PASSWORD: app
    REDIS_HOST: 127.0.0.1
```
**Process:**
- Runs Laravel Lumen migrations
- Uses force flag for non-interactive execution
- Connects to CI MySQL container
- Sets up Redis connection

#### 5. PHP Unit Tests
```yaml
- run: ./vendor/bin/phpunit
  working-directory: backend-php
  env:
    DB_CONNECTION: mysql
    DB_HOST: 127.0.0.1
    DB_PORT: 3306
    DB_DATABASE: app
    DB_USERNAME: app
    DB_PASSWORD: app
    JWT_SECRET: test-secret-key-for-jwt-testing-only-not-for-production
```

**Test Configuration:**
- Full PHPUnit test suite execution
- Database integration testing
- JWT token testing with secure test key
- Isolated test database transactions

#### 6. Node.js Environment Setup
```yaml
- uses: actions/setup-node@v4
  with: { node-version: '20' }
```
**Configuration:**
- Node.js 20 LTS (latest stable)
- Automatic npm/yarn detection
- Caches node_modules for performance

#### 7. Node.js Dependencies
```yaml
- run: npm ci
  working-directory: cache-node
```
**Features:**
- Clean install from package-lock.json
- Faster and more reliable than `npm install`
- Ensures reproducible builds

#### 8. Node.js Unit Tests
```yaml
- run: npx jest --runInBand
  working-directory: cache-node
```
**Configuration:**
- Jest test runner with TypeScript support
- `--runInBand` for serial test execution
- Prevents port conflicts in CI environment

## Environment Variables

### Database Configuration
```bash
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=app
DB_USERNAME=app
DB_PASSWORD=app
```

### Redis Configuration
```bash
REDIS_HOST=127.0.0.1
REDIS_PORT=6379        # Default port
REDIS_PASSWORD=null    # No auth in CI
```

### JWT Configuration
```bash
JWT_SECRET=test-secret-key-for-jwt-testing-only-not-for-production
JWT_TTL=60             # Default from backend config
```

## Test Coverage

### PHP Backend Tests
- **Authentication Tests**: Registration, login, JWT validation
- **Post Tests**: CRUD operations, caching, authorization
- **Database Tests**: Schema validation, relationships, transactions
- **Integration Tests**: Full HTTP request/response cycles

### Node.js Cache Tests
- **Cache Hit/Miss**: Redis integration testing
- **Database Fallback**: MySQL fallback when cache fails
- **Error Handling**: Network failures, invalid requests
- **API Contract**: Response format validation

## Performance Optimizations

### Caching Strategies
- **Composer Cache**: Automatic PHP dependency caching
- **npm Cache**: Node.js dependency caching via setup-node
- **Docker Layer Cache**: Service container image reuse

### Parallel Execution
- **Service Containers**: MySQL and Redis run in parallel
- **Test Isolation**: Independent test environments
- **Resource Management**: Optimal CI resource utilization

## Security Features

### Secrets Management
- **JWT Secret**: Secure test key (not production)
- **Database Credentials**: Isolated test credentials
- **Environment Isolation**: CI-specific configuration

### Test Data Isolation
- **Database Transactions**: Automatic rollback after tests
- **Clean State**: Fresh environment for each run
- **No Data Persistence**: Temporary containers only

## Monitoring & Debugging

### Build Status
- **GitHub Status Checks**: Required for pull requests
- **Badge Integration**: Build status badges available
- **Notification**: Email/Slack notifications on failure

### Log Access
```bash
# View CI logs via GitHub Actions interface
# Or using GitHub CLI:
gh run list
gh run view [run-id]
gh run view [run-id] --log
```

### Debugging Failed Builds
1. **Check Service Health**: MySQL/Redis container status
2. **Database Connection**: Network connectivity issues
3. **Environment Variables**: Missing or incorrect config
4. **Test Dependencies**: Missing packages or wrong versions

## Pipeline Extensions

### Additional Checks (Future)
```yaml
# Code quality checks
- run: ./vendor/bin/phpstan analyse
- run: npm run lint

# Security scanning
- uses: securecodewarrior/github-action-add@v1

# Deploy to staging
- name: Deploy to Staging
  if: github.ref == 'refs/heads/main'
```

### Multi-Environment Testing
```yaml
strategy:
  matrix:
    php-version: [8.1, 8.2, 8.3]
    node-version: [18, 20]
```

## Best Practices

### Commit Standards
- All commits must pass CI checks
- Required status checks for protected branches
- Automatic PR blocking on test failures

### Branch Protection
```yaml
# Recommended GitHub branch protection rules
required_status_checks:
  strict: true
  contexts: ["test"]
enforce_admins: true
required_pull_request_reviews:
  required_approving_review_count: 1
```

### Development Workflow
1. **Feature Branch**: Create feature branch from main
2. **Local Testing**: Run tests locally before push
3. **Push & CI**: Push triggers automated testing
4. **Code Review**: PR review with passing tests
5. **Merge**: Squash and merge to main

## Troubleshooting

### Common Issues

#### MySQL Connection Failures
```bash
# Check service health
# Increase health check retries
# Verify port mapping (3306)
```

#### Redis Connection Issues
```bash
# Verify Redis container startup
# Check port mapping (6379)
# Ensure no authentication required
```

#### PHP Extension Missing
```bash
# Add to composer.json requirements
# Update Docker setup-php action version
```

#### Node.js Module Issues
```bash
# Clear npm cache
# Check package-lock.json consistency
# Verify Node.js version compatibility
```

### Performance Issues
- **Slow Database**: Increase MySQL health check timeout
- **Long Test Runtime**: Parallelize test execution where possible
- **Cache Misses**: Verify caching configuration in actions