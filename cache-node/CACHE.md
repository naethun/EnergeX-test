# Cache Node Service

High-performance caching layer built with Node.js and TypeScript, providing Redis-first data access with MySQL fallback.

## Architecture

```
┌─────────────────┐
│  Cache Request  │
└─────────┬───────┘
          │
┌─────────▼───────┐
│  Express Router │
└─────────┬───────┘
          │
┌─────────▼───────┐    ┌─────────────┐
│  Redis Client   │────│   Redis     │
│   (IORedis)     │    │  (Cache)    │
└─────────┬───────┘    └─────────────┘
          │ Cache Miss
          │
┌─────────▼───────┐    ┌─────────────┐
│  MySQL Client   │────│   MySQL     │
│   (mysql2)      │    │ (Database)  │
└─────────────────┘    └─────────────┘
```

## Project Structure

```
cache-node/
├── src/
│   ├── index.ts          # Main Express server
│   └── index.test.ts     # Jest test suite
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── jest.config.js        # Jest test configuration
└── Dockerfile            # Container definition
```

## Key Components

### Main Server (`src/index.ts`)

#### Express Application Setup
```typescript
const app = express();
const redis = new Redis({ host: process.env.REDIS_HOST || '127.0.0.1' });
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'app',
  password: process.env.DB_PASS || 'app',
  database: process.env.DB_NAME || 'app',
});
```

#### Cache Endpoints

##### GET /cache/posts
**Purpose:** Retrieve all posts with cache-first strategy

**Flow:**
1. Check Redis for cached data (`posts:all` key)
2. If cache hit: Return cached JSON data
3. If cache miss: Query MySQL database
4. Store result in Redis with 60s TTL
5. Return data to client

**Code Pattern:**
```typescript
app.get('/cache/posts', async (_req, res) => {
  const key = 'posts:all';
  let data = await redis.get(key);
  if (!data) {
    const [rows] = await pool.query('SELECT * FROM posts ORDER BY id DESC');
    data = JSON.stringify(rows);
    await redis.set(key, data, 'EX', 60);
  }
  res.json(JSON.parse(data));
});
```

##### GET /cache/posts/:id
**Purpose:** Retrieve single post by ID with cache-first strategy

**Flow:**
1. Check Redis for cached post (`posts:{id}` key)
2. If cache hit: Return cached JSON data
3. If cache miss: Query MySQL for specific post
4. If post found: Cache with 300s TTL, return data
5. If not found: Return 404 error

**Code Pattern:**
```typescript
app.get('/cache/posts/:id', async (req, res) => {
  const key = `posts:${req.params.id}`;
  let data = await redis.get(key);
  if (!data) {
    const [rows] = await pool.query('SELECT * FROM posts WHERE id=? LIMIT 1', [req.params.id]);
    const row = Array.isArray(rows) ? rows[0] : rows;
    if (!row) return res.status(404).json({message:'Not found'});
    data = JSON.stringify(row);
    await redis.set(key, data, 'EX', 300);
  }
  res.json(JSON.parse(data));
});
```

## Configuration

### Environment Variables
```bash
# Database Configuration
DB_HOST=127.0.0.1
DB_USER=app
DB_PASS=app
DB_NAME=app

# Redis Configuration
REDIS_HOST=127.0.0.1

# Server Configuration
PORT=3001
NODE_ENV=production
```

### Dependencies (`package.json`)

#### Production Dependencies
- `express` - Web application framework
- `ioredis` - High-performance Redis client
- `mysql2` - Fast MySQL client with Promises

#### Development Dependencies
- `typescript` - TypeScript compiler
- `ts-node-dev` - Development server with hot reload
- `jest` - Testing framework
- `supertest` - HTTP testing library
- `@types/*` - TypeScript type definitions

## Caching Strategy

### Cache Keys
- **All Posts:** `posts:all`
- **Single Post:** `posts:{id}`

### TTL (Time To Live)
- **All Posts:** 60 seconds (frequent updates expected)
- **Single Post:** 300 seconds (less frequent changes)

### Cache Policies
- **Cache-First:** Always check Redis before database
- **Write-Through:** Not implemented (handled by main API)
- **Invalidation:** Managed by Lumen backend

## API Endpoints

### GET /cache/posts
```http
GET /cache/posts
Content-Type: application/json

Response: 200 OK
[
  {
    "id": 1,
    "title": "Post Title",
    "content": "Post content...",
    "user_id": 1,
    "created_at": "2025-01-01T00:00:00.000Z"
  }
]
```

### GET /cache/posts/:id
```http
GET /cache/posts/1
Content-Type: application/json

Response: 200 OK (Cache Hit/Miss)
{
  "id": 1,
  "title": "Post Title",
  "content": "Post content...",
  "user_id": 1,
  "created_at": "2025-01-01T00:00:00.000Z"
}

Response: 404 Not Found (Post Not Found)
{
  "message": "Not found"
}
```

## Development

### Setup
```bash
npm install
npm run dev
```

### Testing
```bash
npm test                    # Run all tests
npm test -- --verbose      # Verbose test output
npm test -- --watch        # Watch mode
```

### Build & Run
```bash
npm run build              # Compile TypeScript
node dist/index.js         # Run compiled JavaScript
```

### Docker
```bash
docker build -t energex-cache .
docker run -p 3001:3001 energex-cache
```

## Testing Strategy (`src/index.test.ts`)

### Test Setup
- **Mocking:** Redis and MySQL clients fully mocked
- **Framework:** Jest with Supertest for HTTP testing
- **Isolation:** Each test has clean mock state

### Test Cases

#### Cache Hit Scenarios
```typescript
test('GET /cache/posts returns cached data', async () => {
  const mockPosts = [{ id: 1, title: 'Test Post' }];
  mockRedis.get.mockResolvedValue(JSON.stringify(mockPosts));

  const response = await request(app)
    .get('/cache/posts')
    .expect(200);

  expect(response.body).toEqual(mockPosts);
  expect(mockRedis.get).toHaveBeenCalledWith('posts:all');
});
```

#### Cache Miss Scenarios
```typescript
test('GET /cache/posts fetches from DB when cache miss', async () => {
  const mockPosts = [{ id: 1, title: 'Test Post' }];
  mockRedis.get.mockResolvedValue(null);
  mockPool.query.mockResolvedValue([mockPosts]);

  await request(app).get('/cache/posts').expect(200);

  expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM posts ORDER BY id DESC');
  expect(mockRedis.set).toHaveBeenCalledWith('posts:all', JSON.stringify(mockPosts), 'EX', 60);
});
```

#### Error Handling
```typescript
test('GET /cache/posts/:id returns 404 when post not found', async () => {
  mockRedis.get.mockResolvedValue(null);
  mockPool.query.mockResolvedValue([[]]);

  const response = await request(app)
    .get('/cache/posts/999')
    .expect(404);

  expect(response.body).toEqual({ message: 'Not found' });
});
```

## Performance Features

### Connection Pooling
- MySQL connection pool for optimal resource usage
- Automatic connection management and reuse
- Configurable pool size and timeouts

### Redis Optimization
- IORedis for high-performance Redis operations
- Pipeline support for bulk operations
- Automatic reconnection handling

### Memory Management
- JSON parsing/stringification for data serialization
- Efficient key-value storage patterns
- TTL-based automatic cleanup

## Error Handling

### Database Errors
- Connection pool handles database disconnections
- Graceful degradation when MySQL unavailable
- Proper HTTP status codes for client errors

### Cache Errors
- Redis connection failures handled gracefully
- Fallback to database when cache unavailable
- Logging for debugging cache issues

## Monitoring & Debugging

### Development Logging
```typescript
console.log(JSON.parse(data)); // Debug cache responses
```

### Production Monitoring
- Express.js access logs
- Error handling with proper HTTP status codes
- Health check endpoints (can be added)

## Security Considerations

- **Input Validation:** Basic parameter validation for post IDs
- **SQL Injection Protection:** Parameterized queries with mysql2
- **CORS:** Not explicitly configured (handled by main API)
- **Rate Limiting:** Not implemented (typically handled at load balancer level)