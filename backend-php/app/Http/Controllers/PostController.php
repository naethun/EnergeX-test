<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;

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
}