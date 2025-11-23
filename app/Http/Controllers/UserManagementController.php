<?php

namespace App\Http\Controllers;

use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserManagementController extends Controller
{
    public function index()
    {
        $users = User::with('roles')->get();
        
        return Inertia::render('admin/users/UsersManagementPage', [
            'users' => $users->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role, // old field
                    'roles' => $user->roles->pluck('name')->toArray(),
                    'role_names' => $user->roles->pluck('name')->map(function($role) {
                        return ucwords(str_replace('_', ' ', $role));
                    })->implode(', '),
                    'is_active' => $user->is_active,
                    'permissions_count' => $user->getAllPermissions()->count(),
                    'created_at' => $user->created_at->format('d M Y'),
                ];
            })
        ]);
    }

    public function create()
    {
        $roles = Role::all();

        return Inertia::render('admin/users/CreateUserPage', [
            'roles' => $roles->map(function($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'display_name' => ucwords(str_replace('_', ' ', $role->name)),
                ];
            })
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'roles' => 'required|array|min:1',
            'roles.*' => 'exists:roles,name',
            'is_active' => 'boolean',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'is_active' => $validated['is_active'] ?? true,
            'role' => $validated['roles'][0], // keep old field for backward compatibility
        ]);

        $user->assignRole($validated['roles']);

        return redirect()->route('admin.users.index')->with('success', 'User created successfully');
    }

    public function edit($id)
    {
        $user = User::with('roles')->findOrFail($id);
        $roles = Role::all();

        return Inertia::render('admin/users/EditUserPage', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name')->toArray(),
                'is_active' => $user->is_active,
            ],
            'roles' => $roles->map(function($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'display_name' => ucwords(str_replace('_', ' ', $role->name)),
                ];
            })
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'password' => 'nullable|string|min:8|confirmed',
            'roles' => 'required|array|min:1',
            'roles.*' => 'exists:roles,name',
            'is_active' => 'boolean',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'is_active' => $validated['is_active'] ?? $user->is_active,
            'role' => $validated['roles'][0], // keep old field
        ]);

        if (!empty($validated['password'])) {
            $user->update(['password' => Hash::make($validated['password'])]);
        }

        $user->syncRoles($validated['roles']);

        return redirect()->route('admin.users.index')->with('success', 'User updated successfully');
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // Prevent deleting yourself
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'Cannot delete your own account']);
        }

        $user->delete();

        return redirect()->route('admin.users.index')->with('success', 'User deleted successfully');
    }

    public function toggleStatus($id)
    {
        $user = User::findOrFail($id);
        
        $user->update([
            'is_active' => !$user->is_active
        ]);

        return back()->with('success', 'User status updated successfully');
    }
}
