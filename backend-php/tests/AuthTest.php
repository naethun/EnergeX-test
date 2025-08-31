<?php

namespace Tests;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthTest extends TestCase
{
    public function test_user_can_register()
    {
        $userData = [
            'email' => 'test@example.com',
            'password' => 'password123'
        ];

        $response = $this->post('/api/register', $userData);

        $response->seeStatusCode(201)
                ->seeJsonStructure([
                    'access_token',
                    'token_type',
                    'user' => ['id', 'email']
                ]);

        $this->seeInDatabase('users', ['email' => 'test@example.com']);
    }

    public function test_user_can_login()
    {
        $user = User::create([
            'email' => 'login@example.com',
            'password' => Hash::make('password123')
        ]);

        $response = $this->post('/api/login', [
            'email' => 'login@example.com',
            'password' => 'password123'
        ]);

        $response->seeStatusCode(200)
                ->seeJsonStructure([
                    'access_token',
                    'token_type',
                    'user'
                ]);
    }

    public function test_login_with_invalid_credentials()
    {
        $response = $this->post('/api/login', [
            'email' => 'wrong@example.com',
            'password' => 'wrongpassword'
        ]);

        $response->seeStatusCode(401)
                ->seeJson(['error' => 'Invalid credentials']);
    }

    public function test_register_requires_valid_email()
    {
        $response = $this->post('/api/register', [
            'email' => 'invalid-email',
            'password' => 'password123'
        ]);

        $response->seeStatusCode(422);
    }
}