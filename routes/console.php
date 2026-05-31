<?php

use App\Models\SystemNotification;
use App\Models\UserActivity;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('logs:cleanup', function () {
    $deletedActivities = UserActivity::query()
        ->where('created_at', '<', now()->subMonth())
        ->delete();

    $deletedNotifications = SystemNotification::query()
        ->where('created_at', '<', now()->subMonths(3))
        ->delete();

    $this->info("Deleted {$deletedActivities} user activities older than 1 month.");
    $this->info("Deleted {$deletedNotifications} notifications older than 3 months.");
})->purpose('Cleanup old user activities and important notifications');

Schedule::command('logs:cleanup')->dailyAt('02:00');
