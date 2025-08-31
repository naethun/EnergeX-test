<?php

namespace Tests;

use App\Models\User;
use App\Models\Post;

class PostTest extends TestCase
{
    private $user;
    private $token;

    public function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::create([
            'email' => 'testuser' . uniqid() . '@example.com',
            'password' => 'password123'
        ]);
        
        $this->token = auth()->login($this->user);
    }

    public function test_can_get_posts()
    {
        Post::create([
            'title' => 'Test Post',
            'content' => 'Test content',
            'user_id' => $this->user->id
        ]);

        $response = $this->get('/api/posts', [
            'Authorization' => 'Bearer ' . $this->token
        ]);

        $response->seeStatusCode(200);
    }

    public function test_can_create_post()
    {
        $postData = [
            'title' => 'New Post',
            'content' => 'New post content'
        ];

        $response = $this->post('/api/posts', $postData, [
            'Authorization' => 'Bearer ' . $this->token
        ]);

        $response->seeStatusCode(201)
                ->seeJson(['title' => 'New Post']);

        $this->seeInDatabase('posts', ['title' => 'New Post']);
    }

    public function test_can_get_single_post()
    {
        $post = Post::create([
            'title' => 'Single Post',
            'content' => 'Single post content',
            'user_id' => $this->user->id
        ]);

        $response = $this->get("/api/posts/{$post->id}", [
            'Authorization' => 'Bearer ' . $this->token
        ]);

        $response->seeStatusCode(200)
                ->seeJson(['title' => 'Single Post']);
    }

    public function test_posts_require_authentication()
    {
        $response = $this->get('/api/posts');
        $response->seeStatusCode(401);
    }
}