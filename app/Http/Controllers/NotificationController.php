<?php

namespace App\Http\Controllers;

use App\Models\UserActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        // Get recent important activities only as notifications
        $notifications = UserActivity::with('user')
            ->where(function($query) {
                // Filter hanya event penting
                $query->where('action', 'LIKE', '%created_order%')
                      ->orWhere('action', 'LIKE', '%created_payment%')
                      ->orWhere('action', 'LIKE', '%verified_payment%')
                      ->orWhere('action', 'LIKE', '%rejected_payment%')
                      ->orWhere('action', 'LIKE', '%created_user%')
                      ->orWhere('action', 'LIKE', '%updated_order_status%')
                      ->orWhere('action', 'LIKE', '%uploaded_payment_proof%');
            })
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'type' => $this->getNotificationType($activity->action),
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

    private function getNotificationType($action)
    {
        if (str_contains($action, 'order')) {
            return 'order';
        } elseif (str_contains($action, 'payment')) {
            return 'payment';
        } elseif (str_contains($action, 'user')) {
            return 'user';
        }
        return 'system';
    }

    private function getNotificationTitle($activity)
    {
        $action = $activity->action;
        
        // Order related
        if (str_contains($action, 'created_order')) {
            return '📋 Order Baru Dibuat';
        } elseif (str_contains($action, 'updated_order_status')) {
            return '📝 Status Order Diupdate';
        }
        
        // Payment related
        elseif (str_contains($action, 'uploaded_payment_proof')) {
            return '💰 Bukti Pembayaran Diupload';
        } elseif (str_contains($action, 'verified_payment')) {
            return '✅ Pembayaran Diverifikasi';
        } elseif (str_contains($action, 'rejected_payment')) {
            return '❌ Pembayaran Ditolak';
        } elseif (str_contains($action, 'created_payment')) {
            return '💳 Pembayaran Baru';
        }
        
        // User related
        elseif (str_contains($action, 'created_user')) {
            return '👤 User Baru Terdaftar';
        }
        
        return ucfirst(str_replace('_', ' ', $action));
    }

    private function getNotificationLink($activity)
    {
        $action = $activity->action;
        
        if (str_contains($action, 'order') && isset($activity->properties['order_id'])) {
            return '/admin/orders/' . $activity->properties['order_id'];
        } elseif (str_contains($action, 'payment') && isset($activity->properties['payment_id'])) {
            return '/admin/orders'; // Link to orders page
        }
        
        return null;
    }
}
