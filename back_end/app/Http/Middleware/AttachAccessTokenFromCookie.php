<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AttachAccessTokenFromCookie
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->cookie('access_token');



        if ($token && !$request->header('Authorization'))
        {
            $bearerToken = 'Bearer ' . $token;

            $request->headers->set('Authorization', $bearerToken);

            $request->server->set('HTTP_AUTHORIZATION', $bearerToken);
            $_SERVER['HTTP_AUTHORIZATION'] = $bearerToken;
        }
//        dd($request->cookie('access_token'), $request->cookies->all());
        return $next($request);
    }
}