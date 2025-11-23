<?php

test('globals')
    ->expect(['dd', 'dump', 'ray', 'var_dump'])
    ->not->toBeUsed();

test('controllers')
    ->expect('App\Http\Controllers')
    ->not->toUse('App\Models') // قانون: کنترلر نباید مستقیم مدل صدا بزند (باید از ریپازیتوری/سرویس استفاده شود)
    ->ignoring('App\Http\Controllers\Auth'); // استثنا برای Auth

test('security headers')
    ->expect('App\Http\Controllers')
    ->toUseStrictTypes(); // اجبار به استفاده از declare(strict_types=1);

test('environment variables')
    ->expect('env')
    ->not->toBeUsed()
    ->ignoring('config'); // قانون: در کد نباید env() استفاده شود، فقط باید از config() استفاده کرد.