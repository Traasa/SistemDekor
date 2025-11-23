<?php

namespace App\Http\Middleware;

use App\Models\UserActivity;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogUserActivity
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only log for authenticated users
        if (auth()->check()) {
            $this->logActivity($request, $response);
        }

        return $response;
    }

    /**
     * Log the user activity
     */
    protected function logActivity(Request $request, Response $response): void
    {
        // Skip logging for certain routes
        $skipRoutes = [
            'debugbar',
            'horizon',
            '_ignition',
            'api/user',
            'livewire',
        ];

        foreach ($skipRoutes as $route) {
            if (str_contains($request->path(), $route)) {
                return;
            }
        }

        // Skip logging for asset requests
        if ($request->is('build/*') || $request->is('storage/*')) {
            return;
        }

        // Determine activity type and description
        $activityType = $this->determineActivityType($request);
        $description = $this->generateDescription($request, $activityType);

        // Extract subject info if available
        $subjectType = null;
        $subjectId = null;
        $properties = [];

        // Try to extract model info from route parameters
        $routeParams = $request->route()?->parameters() ?? [];
        foreach ($routeParams as $key => $value) {
            if (is_numeric($value) && in_array($key, ['id', 'order', 'user', 'role', 'payment'])) {
                $subjectId = $value;
                $subjectType = $this->guessModelClass($key);
                break;
            }
        }

        // Store request data for create/update operations
        if (in_array($request->method(), ['POST', 'PUT', 'PATCH'])) {
            $properties['request_data'] = $this->sanitizeRequestData($request->all());
        }

        // Only log successful responses (2xx, 3xx)
        if ($response->getStatusCode() < 400) {
            UserActivity::create([
                'user_id' => auth()->id(),
                'activity_type' => $activityType,
                'description' => $description,
                'subject_type' => $subjectType,
                'subject_id' => $subjectId,
                'properties' => !empty($properties) ? $properties : null,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'method' => $request->method(),
                'url' => $request->fullUrl(),
            ]);
        }
    }

    /**
     * Determine activity type based on request
     */
    protected function determineActivityType(Request $request): string
    {
        $method = $request->method();
        $path = $request->path();

        // Check for specific actions
        if (str_contains($path, 'login')) return 'login';
        if (str_contains($path, 'logout')) return 'logout';
        if (str_contains($path, 'verify')) return 'verify';
        if (str_contains($path, 'reject')) return 'reject';
        if (str_contains($path, 'upload')) return 'upload';
        if (str_contains($path, 'download')) return 'download';

        // Map HTTP methods to activity types
        return match($method) {
            'GET', 'HEAD' => 'view',
            'POST' => 'create',
            'PUT', 'PATCH' => 'update',
            'DELETE' => 'delete',
            default => 'action',
        };
    }

    /**
     * Generate human-readable description
     */
    protected function generateDescription(Request $request, string $activityType): string
    {
        $path = $request->path();
        $user = auth()->user();

        // Extract resource name from path
        $pathParts = explode('/', $path);
        $resource = $pathParts[count($pathParts) - 1];
        
        // Remove numeric IDs
        if (is_numeric($resource)) {
            $resource = $pathParts[count($pathParts) - 2] ?? 'resource';
        }

        // Clean up resource name
        $resource = ucfirst(str_replace(['-', '_'], ' ', $resource));

        return match($activityType) {
            'login' => "{$user->name} logged into the system",
            'logout' => "{$user->name} logged out from the system",
            'view' => "{$user->name} viewed {$resource}",
            'create' => "{$user->name} created new {$resource}",
            'update' => "{$user->name} updated {$resource}",
            'delete' => "{$user->name} deleted {$resource}",
            'verify' => "{$user->name} verified {$resource}",
            'reject' => "{$user->name} rejected {$resource}",
            'upload' => "{$user->name} uploaded {$resource}",
            'download' => "{$user->name} downloaded {$resource}",
            default => "{$user->name} performed action on {$resource}",
        };
    }

    /**
     * Guess model class from route parameter name
     */
    protected function guessModelClass(string $param): ?string
    {
        $modelMap = [
            'id' => null,
            'order' => 'App\Models\Order',
            'user' => 'App\Models\User',
            'role' => 'Spatie\Permission\Models\Role',
            'payment' => 'App\Models\PaymentProof',
            'client' => 'App\Models\Client',
            'package' => 'App\Models\Package',
            'inventory' => 'App\Models\InventoryItem',
        ];

        return $modelMap[$param] ?? null;
    }

    /**
     * Sanitize request data (remove sensitive information)
     */
    protected function sanitizeRequestData(array $data): array
    {
        $sensitiveKeys = ['password', 'password_confirmation', 'token', 'api_token', 'remember_token'];
        
        foreach ($sensitiveKeys as $key) {
            if (isset($data[$key])) {
                $data[$key] = '***REDACTED***';
            }
        }

        return $data;
    }
}
