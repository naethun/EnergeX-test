import request from 'supertest';
import express from 'express';
import Redis from 'ioredis';
import mysql from 'mysql2/promise';

// Mock dependencies
jest.mock('ioredis');
jest.mock('mysql2/promise');

const MockedRedis = Redis as jest.MockedClass<typeof Redis>;
const mockedMysql = mysql as jest.Mocked<typeof mysql>;

describe('Cache Node API', () => {
  let app: express.Application;
  let mockRedis: jest.Mocked<Redis>;
  let mockPool: any;

  beforeAll(() => {
    // Setup mocks
    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
    } as any;

    mockPool = {
      query: jest.fn(),
    };

    MockedRedis.mockImplementation(() => mockRedis);
    mockedMysql.createPool = jest.fn().mockReturnValue(mockPool);

    // Import app after mocks are setup
    app = require('./index').default || require('./index');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /cache/posts returns cached data', async () => {
    const mockPosts = [{ id: 1, title: 'Test Post' }];
    mockRedis.get.mockResolvedValue(JSON.stringify(mockPosts));

    const response = await request(app)
      .get('/cache/posts')
      .expect(200);

    expect(response.body).toEqual(mockPosts);
    expect(mockRedis.get).toHaveBeenCalledWith('posts:all');
  });

  test('GET /cache/posts fetches from DB when cache miss', async () => {
    const mockPosts = [{ id: 1, title: 'Test Post' }];
    mockRedis.get.mockResolvedValue(null);
    mockPool.query.mockResolvedValue([mockPosts]);
    mockRedis.set.mockResolvedValue('OK');

    const response = await request(app)
      .get('/cache/posts')
      .expect(200);

    expect(response.body).toEqual(mockPosts);
    expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM posts ORDER BY id DESC');
    expect(mockRedis.set).toHaveBeenCalledWith('posts:all', JSON.stringify(mockPosts), 'EX', 60);
  });

  test('GET /cache/posts/:id returns single post', async () => {
    const mockPost = { id: 1, title: 'Single Post' };
    mockRedis.get.mockResolvedValue(JSON.stringify(mockPost));

    const response = await request(app)
      .get('/cache/posts/1')
      .expect(200);

    expect(response.body).toEqual(mockPost);
    expect(mockRedis.get).toHaveBeenCalledWith('posts:1');
  });

  test('GET /cache/posts/:id returns 404 when post not found', async () => {
    mockRedis.get.mockResolvedValue(null);
    mockPool.query.mockResolvedValue([[]]);

    const response = await request(app)
      .get('/cache/posts/999')
      .expect(404);

    expect(response.body).toEqual({ message: 'Not found' });
  });
});