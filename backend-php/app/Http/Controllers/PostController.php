<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Http;

class PostController extends Controller
{
    public function index()
    {
        $cacheKey = 'posts:all';
        $posts = Redis::get($cacheKey);

        if (!$posts) {
            $posts = Post::with('user')->get();
            Redis::setex($cacheKey, 60, json_encode($posts));
        } else {
            $posts = json_decode($posts, true);
        }

        return response()->json($posts);
    }

    public function store(Request $request)
    {
        $post = Post::create([
            'title' => $request->title,
            'content' => $request->content,
            'user_id' => auth()->id()
        ]);

        // Clear cache
        Redis::del('posts:all');

        // Trigger WebSocket event
        $this->notifyWebSocket('post-created', $post->load('user'));

        return response()->json($post, 201);
    }

    public function show($id)
    {
        $cacheKey = "posts:{$id}";
        $post = Redis::get($cacheKey);

        if (!$post) {
            $post = Post::with('user')->find($id);
            if ($post) {
                Redis::setex($cacheKey, 60, json_encode($post));
            }
        } else {
            $post = json_decode($post, true);
        }

        return response()->json($post);
    }

    public function update(Request $request, $id)
    {
        $post = Post::find($id);
        
        if (!$post) {
            return response()->json(['error' => 'Post not found'], 404);
        }

        $post->update([
            'title' => $request->title ?? $post->title,
            'content' => $request->content ?? $post->content,
        ]);

        // Clear cache
        Redis::del('posts:all');
        Redis::del("posts:{$id}");

        // Trigger WebSocket event
        $this->notifyWebSocket('post-updated', $post->load('user'));

        return response()->json($post);
    }

    private function notifyWebSocket($event, $post)
    {
        $websocketUrl = env('WEBSOCKET_URL', 'http://localhost:3001');
        
        try {
            Http::timeout(2)->post("{$websocketUrl}/webhook/{$event}", $post->toArray());
        } catch (\Exception $e) {
            // Log error but don't fail the request
            \Log::error("WebSocket notification failed: " . $e->getMessage());
        }
    }
}