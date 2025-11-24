<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'user_name' => 'required|string',
            'password' => 'required|string',
        ]);

        // ۱. جستجو با user_name، نه email
        $user = User::where('user_name', $request->user_name)->first();

        // ۲. بررسی کاربر و صحت پسورد
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'نام کاربری یا رمز عبور نامعتبر است.'
            ], 401);
        }

        // ۳. بررسی فعال بودن کاربر (این بخش عالی بود)
        if ($user->status !== 'active') {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'حساب کاربری شما غیرفعال است.'
            ], 401);
        }

        // ۴. ایجاد توکن و پاسخ (این بخش هم عالی بود)
        $tokenResult = $user->createToken('AuthToken');
        $token = $tokenResult->accessToken;
        $expiresAt = $tokenResult->token->expires_at;

        return response()->json(
            [
                'access_token' => $token,
                'token_type' => 'Bearer',
                'expires_at' => $expiresAt->toDateTimeString(),
                'user' =>
                    [
                        'id' => $user->id,
                        'user_name' => $user->user_name,
                        'email' => $user->email,
                        'roles' => $user->getRoleNames(),
                    ]
            ]);
    }




   public function logout(Request $request)
   {
        $request->user()->token()->revoke();
        return response()->json(['message' => 'خروج با موفقیت انجام شد.']);
   }
}
