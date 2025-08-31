<?php

namespace Tests;

use Laravel\Lumen\Testing\DatabaseTransactions;

class UnauthenticatedTest extends TestCase
{
    use DatabaseTransactions;
    public function test_posts_require_authentication()
    {
        $response = $this->get('/api/posts');
        $response->seeStatusCode(401);
    }

    public function test_create_post_requires_authentication()
    {
        $response = $this->post('/api/posts', [
            'title' => 'Test Post',
            'content' => 'Test content'
        ]);
        $response->seeStatusCode(401);
    }
}