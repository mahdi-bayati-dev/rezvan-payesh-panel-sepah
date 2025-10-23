<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
   public function login(Request $request)
   {
        $request->validate([
            'user_name' => 'required|string',
            'password' => 'required|string',
        ]);

        $credentials = $request->only('user_name', 'password');

        if (Auth::attempt($credentials)) {
            /** @var User $user */
            $user = Auth::user();

            if ($user->status !== 'active') {
                return response()->json([
                    'error' => 'Unauthorized',
                    'message' => 'حساب کاربری شما غیرفعال است.'
                ], 401);
            }
            $tokenResult = $user->createToken('AuthToken');
            $token = $tokenResult->accessToken;
            $expiresAt = $tokenResult->token->expires_at;
            return response()->json([
                'access_token' => $token,
                'token_type' => 'Bearer',
                'expires_at' => $expiresAt->toDateTimeString(),
                'user' =>
                    [
                        'id' => $user->id,
                        'user_name' => $user->user_name,
                        'email' => $user->email,
                        'roles' => $user->getRoleNames(),
//                        'permissions' => $user->getAllPermissions()->pluck('name'),
                    ]
            ]);
        }
        else
        {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'نام کاربری یا رمز عبور نامعتبر است.'
            ], 401);
        }

   }

   public function logout(Request $request)
   {
        $request->user()->token()->revoke();
        return response()->json(['message' => 'خروج با موفقیت انجام شد.']);
   }
}
