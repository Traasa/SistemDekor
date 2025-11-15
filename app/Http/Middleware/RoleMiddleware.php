<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        if (!$this->hasRole($user, $role)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Required role: ' . $role
            ], 403);
        }

        return $next($request);
    }

    /**
     * Check if user has the required role
     */
    private function hasRole($user, string $role): bool
    {
        switch ($role) {
            case 'admin':
                return $user->isAdmin();
            case 'staff':
                return $user->isStaff();
            default:
                return false;
        }
    }
}
