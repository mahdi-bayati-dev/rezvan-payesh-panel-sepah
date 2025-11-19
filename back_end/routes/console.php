<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');


Schedule::command('attendance:reconcile')
        ->dailyAt('08:00');

//back up

Schedule::command('backup:clean')->daily()->at('01:00');

Schedule::command('backup:run')->daily()->at('01:30');