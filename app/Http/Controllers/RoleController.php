<?php

namespace App\Http\Controllers;

use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::with('permissions')->get();
        
        return Inertia::render('admin/roles/RolesPage', [
            'roles' => $roles->map(function($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'display_name' => ucwords(str_replace('_', ' ', $role->name)),
                    'permissions_count' => $role->permissions->count(),
                    'permissions' => $role->permissions->pluck('name')->toArray(),
                    'users_count' => $role->users()->count(),
                    'created_at' => $role->created_at->format('d M Y'),
                ];
            })
        ]);
    }

    public function create()
    {
        $permissions = Permission::all()->groupBy(function($permission) {
            return explode(' ', $permission->name)[1] ?? 'other';
        });

        return Inertia::render('admin/roles/CreateRolePage', [
            'permissions' => $permissions->map(function($perms, $group) {
                return [
                    'group' => ucfirst($group),
                    'permissions' => $perms->map(function($perm) {
                        return [
                            'id' => $perm->id,
                            'name' => $perm->name,
                            'display_name' => ucwords($perm->name),
                        ];
                    })->values()
                ];
            })->values()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'permissions' => 'required|array|min:1',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role = Role::create(['name' => $validated['name']]);
        $role->givePermissionTo($validated['permissions']);

        return redirect()->route('admin.roles.index')->with('success', 'Role created successfully');
    }

    public function edit($id)
    {
        $role = Role::with('permissions')->findOrFail($id);
        
        $permissions = Permission::all()->groupBy(function($permission) {
            return explode(' ', $permission->name)[1] ?? 'other';
        });

        return Inertia::render('admin/roles/EditRolePage', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'display_name' => ucwords(str_replace('_', ' ', $role->name)),
                'permissions' => $role->permissions->pluck('name')->toArray(),
            ],
            'permissions' => $permissions->map(function($perms, $group) {
                return [
                    'group' => ucfirst($group),
                    'permissions' => $perms->map(function($perm) {
                        return [
                            'id' => $perm->id,
                            'name' => $perm->name,
                            'display_name' => ucwords($perm->name),
                        ];
                    })->values()
                ];
            })->values()
        ]);
    }

    public function update(Request $request, $id)
    {
        $role = Role::findOrFail($id);

        // Prevent updating super_admin role
        if ($role->name === 'super_admin') {
            return back()->withErrors(['error' => 'Cannot update super admin role']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,' . $id,
            'permissions' => 'required|array|min:1',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role->update(['name' => $validated['name']]);
        $role->syncPermissions($validated['permissions']);

        return redirect()->route('admin.roles.index')->with('success', 'Role updated successfully');
    }

    public function destroy($id)
    {
        $role = Role::findOrFail($id);

        // Prevent deleting super_admin role
        if ($role->name === 'super_admin') {
            return back()->withErrors(['error' => 'Cannot delete super admin role']);
        }

        // Check if role has users
        if ($role->users()->count() > 0) {
            return back()->withErrors(['error' => 'Cannot delete role with assigned users']);
        }

        $role->delete();

        return redirect()->route('admin.roles.index')->with('success', 'Role deleted successfully');
    }
}
