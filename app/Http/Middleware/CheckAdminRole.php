<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAdminRole
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect('/login');
        }

        // Only allow admin, super_admin, marketing to access /admin routes
        if (!in_array($user->role, ['super_admin', 'admin', 'marketing'])) {
            return redirect('/');
        }

        // Marketing role restrictions
        if ($user->role === 'marketing') {
            $path = $request->path();
            
            // Allow root admin dashboard
            if ($path === 'admin') {
                return $next($request);
            }

            // Allowed paths for marketing (Website Content)
            $allowedMarketingPaths = [
                'admin/settings/general',
                'admin/company-profile',
                'admin/services',
                'admin/gallery',
                'admin/testimonials',
                'admin/packages',
                'admin/portfolio'
            ];

            $isAllowed = false;
            foreach ($allowedMarketingPaths as $allowedPath) {
                if ($path === $allowedPath || str_starts_with($path, $allowedPath . '/')) {
                    $isAllowed = true;
                    break;
                }
            }

            if (!$isAllowed) {
                // If it's an API request, return 403
                if ($request->wantsJson() || $request->is('api/*')) {
                    return response()->json(['message' => 'Unauthorized access for marketing role.'], 403);
                }
                return redirect('/admin')->with('error', 'Anda tidak memiliki akses ke halaman ini.');
            }
        }

        return $next($request);
    }
}
