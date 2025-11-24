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

            $request->headers->set('Authorization', 'Bearer ' . $token);
        }

        return $next($request);
    }
}