<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class RequestLoggingMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $startTime = microtime(true);
        
        // Log the incoming request
        $this->logRequest($request);
        
        // Process the request
        $response = $next($request);
        
        // Log the response
        $this->logResponse($request, $response, $startTime);
        
        return $response;
    }
    
    private function logRequest(Request $request)
    {
        $userId = 'guest';
        
        try {
            $user = Auth::user();
            if ($user) {
                $userId = $user->id ?? 'authenticated';
            }
        } catch (\Exception $e) {
            // Auth not available or failed
        }
        
        $logData = [
            'endpoint' => $request->method() . ' ' . $request->path(),
            'user_id' => $userId,
        ];
        
        Log::info('REQUEST', $logData);
    }
    
    private function logResponse(Request $request, $response, $startTime)
    {
        $userId = 'guest';
        
        try {
            $user = Auth::user();
            if ($user) {
                $userId = $user->id ?? 'authenticated';
            }
        } catch (\Exception $e) {
            // Auth not available or failed
        }
        
        $logData = [
            'endpoint' => $request->method() . ' ' . $request->path(),
            'status' => $response->getStatusCode(),
            'user_id' => $userId,
        ];
        
        // Add specific action messages
        $message = $this->getActionMessage($request, $response);
        if ($message) {
            $logData['message'] = $message;
        }
        
        // Determine log level based on status code
        if ($response->getStatusCode() >= 500) {
            Log::error('RESPONSE', $logData);
        } elseif ($response->getStatusCode() >= 400) {
            Log::warning('RESPONSE', $logData);
        } else {
            Log::info('RESPONSE', $logData);
        }
    }
    
    private function getActionMessage(Request $request, $response)
    {
        $path = $request->path();
        $method = $request->method();
        $statusCode = $response->getStatusCode();
        
        // Authentication actions
        if ($path === 'api/login' && $method === 'POST') {
            return $statusCode === 200 ? 'User logged in' : 'Login failed';
        }
        
        if ($path === 'api/register' && $method === 'POST') {
            return ($statusCode === 201 || $statusCode === 200) ? 'User registered' : 'Registration failed';
        }
        
        // Posts actions
        if (str_contains($path, 'api/posts')) {
            if ($method === 'GET') {
                return preg_match('/api\/posts\/\d+/', $path) ? 'Viewed post' : 'Listed posts';
            } elseif ($method === 'POST') {
                return ($statusCode === 201 || $statusCode === 200) ? 'Created post' : 'Post creation failed';
            }
        }
        
        return null;
    }
}