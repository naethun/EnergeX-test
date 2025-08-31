import express from 'express';
import Redis from 'ioredis';
import mysql from 'mysql2/promise';

const app = express();
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
});

app.listen(process.env.PORT || 3001, ()=> console.log('cache-node up'));
