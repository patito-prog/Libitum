<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Cada día a las 9:00 AM se buscan eventos que ocurren en las próximas 24 horas
// y se envía un email a cada usuario que tenga el recordatorio activado.
// En producción solo se necesita un cron: * * * * * php artisan schedule:run
Schedule::command('reminders:send')->dailyAt('09:00');
