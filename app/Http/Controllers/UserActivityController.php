<?php

namespace App\Http\Controllers;

use App\Models\UserActivity;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserActivityController extends Controller
{
    public function index(Request $request)
    {
        $query = UserActivity::with('user');

        // Filter by user
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by activity type
        if ($request->filled('activity_type')) {
            $query->where('activity_type', $request->activity_type);
        }

        // Filter by date range
        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // Search in description
        if ($request->filled('search')) {
            $query->where('description', 'like', '%' . $request->search . '%');
        }

        // Order by latest first
        $activities = $query->orderBy('created_at', 'desc')
            ->paginate(50)
            ->through(function ($activity) {
                return [
                    'id' => $activity->id,
                    'user' => $activity->user ? [
                        'id' => $activity->user->id,
                        'name' => $activity->user->name,
                        'email' => $activity->user->email,
                    ] : [
                        'id' => null,
                        'name' => 'System',
                        'email' => 'system@example.com',
                    ],
                    'activity_type' => $activity->activity_type,
                    'description' => $activity->description,
                    'subject_type' => $activity->subject_type ? class_basename($activity->subject_type) : null,
                    'subject_id' => $activity->subject_id,
                    'properties' => $activity->properties,
                    'ip_address' => $activity->ip_address,
                    'user_agent' => $activity->user_agent,
                    'method' => $activity->method,
                    'url' => $activity->url,
                    'icon' => $activity->icon,
                    'color' => $activity->color,
                    'created_at' => $activity->created_at->format('Y-m-d H:i:s'),
                    'created_at_human' => $activity->created_at->diffForHumans(),
                ];
            });

        // Get all users for filter
        $users = User::select('id', 'name', 'email')->orderBy('name')->get();

        // Activity type options
        $activityTypes = [
            'login' => 'Login',
            'logout' => 'Logout',
            'create' => 'Create',
            'update' => 'Update',
            'delete' => 'Delete',
            'view' => 'View',
            'upload' => 'Upload',
            'download' => 'Download',
            'verify' => 'Verify',
            'reject' => 'Reject',
        ];

        // Get statistics
        $stats = [
            'total_today' => UserActivity::whereDate('created_at', today())->count(),
            'total_week' => UserActivity::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            'total_month' => UserActivity::whereMonth('created_at', now()->month)->count(),
            'unique_users_today' => UserActivity::whereDate('created_at', today())->distinct('user_id')->count('user_id'),
        ];

        return Inertia::render('admin/user-activity/UserActivityPage', [
            'activities' => $activities,
            'users' => $users,
            'activityTypes' => $activityTypes,
            'stats' => $stats,
            'filters' => $request->only(['user_id', 'activity_type', 'start_date', 'end_date', 'search']),
        ]);
    }

    public function show($id)
    {
        $activity = UserActivity::with('user')->findOrFail($id);

        return Inertia::render('admin/user-activity/ActivityDetailPage', [
            'activity' => [
                'id' => $activity->id,
                'user' => $activity->user ? [
                    'id' => $activity->user->id,
                    'name' => $activity->user->name,
                    'email' => $activity->user->email,
                ] : null,
                'activity_type' => $activity->activity_type,
                'description' => $activity->description,
                'subject_type' => $activity->subject_type,
                'subject_id' => $activity->subject_id,
                'properties' => $activity->properties,
                'ip_address' => $activity->ip_address,
                'user_agent' => $activity->user_agent,
                'method' => $activity->method,
                'url' => $activity->url,
                'icon' => $activity->icon,
                'color' => $activity->color,
                'created_at' => $activity->created_at->format('Y-m-d H:i:s'),
                'created_at_human' => $activity->created_at->diffForHumans(),
            ],
        ]);
    }

    public function destroy($id)
    {
        $activity = UserActivity::findOrFail($id);
        $activity->delete();

        return back()->with('success', 'Activity log deleted successfully');
    }

    public function clear(Request $request)
    {
        $validated = $request->validate([
            'days' => 'required|integer|min:1|max:365',
        ]);

        $date = now()->subDays($validated['days']);
        $deleted = UserActivity::where('created_at', '<', $date)->delete();

        return back()->with('success', "Deleted {$deleted} activity logs older than {$validated['days']} days");
    }
}
