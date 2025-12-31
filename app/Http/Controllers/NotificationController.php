<?php

namespace App\Http\Controllers;

use App\Models\UserActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        // Get recent important activities - hanya order dan inventory/stok
        $notifications = UserActivity::with('user')
            ->where(function($query) {
                // Filter hanya order dan inventory/stok
                $query->where(function($q) {
                    // Order related
                    $q->where('subject_type', 'LIKE', '%Order%')
                      ->orWhere('description', 'LIKE', '%order%')
                      ->orWhere('description', 'LIKE', '%pesanan%');
                })
                ->orWhere(function($q) {
                    // Inventory/Stock related
                    $q->where('subject_type', 'LIKE', '%Inventory%')
                      ->orWhere('description', 'LIKE', '%inventory%')
                      ->orWhere('description', 'LIKE', '%stock%')
                      ->orWhere('description', 'LIKE', '%stok%');
                });
            })
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'type' => $this->getNotificationType($activity),
                    'title' => $this->getNotificationTitle($activity),
                    'message' => $activity->description,
                    'link' => $this->getNotificationLink($activity),
                    'read' => false, // For now, all unread
                    'created_at' => $activity->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $notifications,
        ]);
    }

    public function markAsRead($id)
    {
        // For now, just return success
        // In production, you'd track read status in database
        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read',
        ]);
    }

    public function markAllAsRead()
    {
        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read',
        ]);
    }

    public function destroy($id)
    {
        return response()->json([
            'success' => true,
            'message' => 'Notification deleted',
        ]);
    }

    private function getNotificationType($activity)
    {
        $description = strtolower($activity->description ?? '');
        $subjectType = $activity->subject_type ?? '';
        
        if (str_contains($subjectType, 'Order') || str_contains($description, 'order') || str_contains($description, 'pesanan')) {
            return 'order';
        } elseif (str_contains($subjectType, 'Inventory') || str_contains($description, 'inventory') || str_contains($description, 'stock') || str_contains($description, 'stok')) {
            return 'inventory';
        }
        return 'system';
    }

    private function getNotificationTitle($activity)
    {
        $activityType = $activity->activity_type;
        $subjectType = $activity->subject_type ?? '';
        $description = strtolower($activity->description ?? '');
        
        // Order related
        if (str_contains($subjectType, 'Order') || str_contains($description, 'order') || str_contains($description, 'pesanan')) {
            if ($activityType === 'create') {
                return '📋 Order Baru Dibuat';
            } elseif ($activityType === 'update') {
                if (str_contains($description, 'status')) {
                    return '📝 Status Order Diupdate';
                }
                return '✏️ Order Diupdate';
            } elseif ($activityType === 'delete') {
                return '🗑️ Order Dihapus';
            }
            return '📋 Order';
        }
        
        // Inventory/Stock related
        if (str_contains($subjectType, 'Inventory') || str_contains($description, 'inventory') || str_contains($description, 'stock') || str_contains($description, 'stok')) {
            if ($activityType === 'create') {
                return '📦 Item Inventory Baru';
            } elseif ($activityType === 'update') {
                if (str_contains($description, 'stock') || str_contains($description, 'stok')) {
                    return '📊 Stok Diupdate';
                }
                return '✏️ Inventory Diupdate';
            } elseif ($activityType === 'delete') {
                return '🗑️ Item Inventory Dihapus';
            }
            if (str_contains($description, 'low') || str_contains($description, 'rendah')) {
                return '⚠️ Stok Menipis';
            }
            return '📦 Inventory';
        }
        
        return '📌 ' . ucfirst($activityType);
    }

    private function getNotificationLink($activity)
    {
        $properties = $activity->properties ?? [];
        $subjectType = $activity->subject_type ?? '';
        $subjectId = $activity->subject_id;
        $description = strtolower($activity->description ?? '');
        
        // Link to orders for order related activities
        if (str_contains($subjectType, 'Order') || str_contains($description, 'order') || str_contains($description, 'pesanan')) {
            if ($subjectId) {
                return '/admin/orders/' . $subjectId;
            }
            return '/admin/orders';
        }
        
        // Link to inventory for inventory related activities
        if (str_contains($subjectType, 'Inventory') || str_contains($description, 'inventory') || str_contains($description, 'stock') || str_contains($description, 'stok')) {
            return '/admin/inventory';
        }
        
        // Check properties for specific IDs
        if (is_array($properties)) {
            if (isset($properties['order_id'])) {
                return '/admin/orders/' . $properties['order_id'];
            }
            if (isset($properties['inventory_id'])) {
                return '/admin/inventory';
            }
        }
        
        return null;
    }
}
