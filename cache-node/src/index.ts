import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Redis from 'ioredis';
import mysql from 'mysql2/promise';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const redis = new Redis({ host: process.env.REDIS_HOST || '127.0.0.1' });
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'app',
  password: process.env.DB_PASS || 'app',
  database: process.env.DB_NAME || 'app',
});

app.get('/cache/posts', async (_req,res)=>{
  const key='posts:all';
  let data = await redis.get(key);
  if(!data){
    const [rows] = await pool.query('SELECT * FROM posts ORDER BY id DESC');
    data = JSON.stringify(rows);
    await redis.set(key, data, 'EX', 60);
  }
  res.json(JSON.parse(data));
});

app.get('/cache/posts/:id', async (req,res)=>{
  const key=`posts:${req.params.id}`;
  let data = await redis.get(key);
  if(!data){
    const [rows] = await pool.query('SELECT * FROM posts WHERE id=? LIMIT 1',[req.params.id]);
    const row = Array.isArray(rows) ? rows[0] : rows;
    if(!row) return res.status(404).json({message:'Not found'});
    data = JSON.stringify(row);
    await redis.set(key, data, 'EX', 300);
  }
  res.json(JSON.parse(data));
  console.log(JSON.parse(data))
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.post('/webhook/post-created', express.json(), (req, res) => {
  const post = req.body;
  io.emit('post-created', post);
  redis.del('posts:all');
  res.status(200).json({ success: true });
});

app.post('/webhook/post-updated', express.json(), (req, res) => {
  const post = req.body;
  io.emit('post-updated', post);
  redis.del('posts:all');
  redis.del(`posts:${post.id}`);
  res.status(200).json({ success: true });
});

const PORT = process.env.PORT || 3001;

if (require.main === module) {
  httpServer.listen(PORT, () => console.log('cache-node with socket.io up'));
}

export default app;
