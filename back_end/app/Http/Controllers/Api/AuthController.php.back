<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'user_name' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('user_name', $request->user_name)->first();

        if (!$user || !Hash::check($request->password, $user->password))
        {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'نام کاربری یا رمز عبور نامعتبر است.'
            ], 401);
        }

        if ($user->status !== 'active')
        {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'حساب کاربری شما غیرفعال است.'
            ], 401);
        }

        $tokenResult = $user->createToken('AuthToken');
        $token = $tokenResult->accessToken;


        $domain = config('SESSION_DOMAIN');

        $cookie = cookie(
            'access_token',
            $token,
            360,
            '/',
            $domain,
            true,
            true,
            false,
            'Lax'
        );

        return response()->json([
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'user_name' => $user->user_name,
                'email' => $user->email,
                'roles' => $user->getRoleNames(),
            ],
            'expires_at' => $tokenResult->token->expires_at->toDateTimeString(),
        ])->withCookie($cookie);
    }

    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->token()->revoke();
        }

        $domain = config('SESSION_DOMAIN');

        $cookie = cookie(
            'access_token',
            '',
            -1,
            '/',
            $domain,
            true,
            true,
            false,
            'Lax'
        );

        return response()->json([
            'message' => 'خروج با موفقیت انجام شد.'
        ])->withCookie($cookie);
    }
}