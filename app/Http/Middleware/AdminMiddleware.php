<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     * Only super_admin, admin, and marketing can access the admin panel.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();

        if (!$user || !in_array($user->role, ['super_admin', 'admin', 'marketing'])) {
            // Inertia request → redirect ke homepage
            if ($request->header('X-Inertia')) {
                return redirect('/');
            }

            abort(403, 'Akses ditolak. Hanya admin, owner, dan marketing yang bisa mengakses halaman ini.');
        }

        return $next($request);
    }
}
