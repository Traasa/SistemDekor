<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| SPA Catch-All Route
|--------------------------------------------------------------------------
| This route serves the React SPA for all routes
*/

Route::get('/{any}', function () {
    return view('spa');
})->where('any', '.*');

require __DIR__.'/auth.php';
