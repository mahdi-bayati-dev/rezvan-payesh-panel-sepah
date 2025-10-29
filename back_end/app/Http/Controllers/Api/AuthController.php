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

        $credentials = $request->only('user_name', 'password');
        $user = User::where('user_name', $request->user_name)->first();
        if (!$user || !Hash::check($request->password, $user->password))
        {

            return response()->json(['message' => 'Unauthorized'], 401);
        }
       $token = $user->createToken('AppName-AuthToken')->accessToken;

       // ۵. توکن را به همراه اطلاعات کاربر برگردان
       return response()->json([
           'message' => 'Login successful',
           'user' => $user,
           'token' => $token,
       ]);

   }

   public function logout(Request $request)
   {
        $request->user()->token()->revoke();
        return response()->json(['message' => 'خروج با موفقیت انجام شد.']);
   }
}
