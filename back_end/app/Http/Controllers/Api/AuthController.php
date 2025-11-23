<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cookie;


class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'user_name' => 'required|string',
            'password' => 'required|string',
        ]);


        $user = User::where('user_name', $request->user_name)->first();


        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'نام کاربری یا رمز عبور نامعتبر است.'
            ], 401);
        }


        if ($user->status !== 'active') {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'حساب کاربری شما غیرفعال است.'
            ], 401);
        }


        $tokenResult = $user->createToken('AuthToken');
        $token = $tokenResult->accessToken;
        $expiration = $tokenResult->token->expires_at->diffInMinutes(now());

        $cookie = cookie(
            'access_token',      // نام کوکی
            $token,              // مقدار توکن
            $expiration,         // زمان انقضا (دقیقه)
            '/',                 // مسیر
            null,
            false,
            true,
            false,
            'None'
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
       $request->user()->token()->revoke();

       $cookie = Cookie::forget('access_token');

       return response()->json([
           'message' => 'Successfully logged out'
       ])->withCookie($cookie);
   }
}
