<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $user = User::create([
            'email' => $request->email,
            'password' => $request->password
        ]);

        return response()->json(['user' => $user], 201);
    }

    public function login(Request $request)
    {
        $email = $request->email;
        $password = $request->password;

        $token = auth()->attempt(['email' => $email, 'password' => $password]);
        
        return response()->json(['token' => $token]);
    }
}