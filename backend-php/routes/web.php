<?php

/** @var \Laravel\Lumen\Routing\Router $router */

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
*/
$router->post('/api/register','AuthController@register');
$router->post('/api/login','AuthController@login');

$router->group(['middleware' => 'auth:api'], function() use ($router){
  $router->get('/api/posts','PostController@index');        // cached
  $router->post('/api/posts','PostController@store');
  $router->get('/api/posts/{id}','PostController@show');    // cached
});

