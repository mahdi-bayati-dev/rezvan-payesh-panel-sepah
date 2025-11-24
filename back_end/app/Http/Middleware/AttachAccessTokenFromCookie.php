<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AttachAccessTokenFromCookie
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->hasCookie('access_token') && !$request->header('Authorization'))
        {
            $token = $request->cookie('access_token');
            $headerValue = 'Bearer ' . $token;

            $request->headers->set('Authorization', $headerValue);

            $request->server->set('HTTP_AUTHORIZATION', $headerValue);
        }

        return $next($request);
    }
}