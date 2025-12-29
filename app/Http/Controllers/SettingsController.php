<?php

namespace App\Http\Controllers;

use App\Models\CompanyProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Carbon\Carbon;

class SettingsController extends Controller
{
    /**
     * GENERAL SETTINGS
     */
    public function generalSettings()
    {
        $settings = CompanyProfile::first();
        
        return Inertia::render('admin/settings/general/index', [
            'settings' => $settings,
        ]);
    }

    public function getGeneralSettings()
    {
        $settings = CompanyProfile::first();
        
        if (!$settings) {
            $settings = CompanyProfile::create([
                'company_name' => 'Sistem Dekor',
                'email' => 'info@sistemdekor.com',
                'phone' => '',
                'address' => '',
                'description' => '',
                'logo' => null,
                'favicon' => null,
                'social_media' => [
                    'facebook' => '',
                    'instagram' => '',
                    'twitter' => '',
                    'whatsapp' => '',
                ],
            ]);
        }

        return response()->json($settings);
    }

    public function updateGeneralSettings(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'description' => 'nullable|string',
            'logo' => 'nullable|image|max:2048',
            'favicon' => 'nullable|image|max:512',
            'social_media' => 'nullable|array',
        ]);

        $settings = CompanyProfile::first();
        
        if (!$settings) {
            $settings = new CompanyProfile();
        }

        // Handle logo upload
        if ($request->hasFile('logo')) {
            if ($settings->logo) {
                Storage::disk('public')->delete($settings->logo);
            }
            $validated['logo'] = $request->file('logo')->store('company', 'public');
        }

        // Handle favicon upload
        if ($request->hasFile('favicon')) {
            if ($settings->favicon) {
                Storage::disk('public')->delete($settings->favicon);
            }
            $validated['favicon'] = $request->file('favicon')->store('company', 'public');
        }

        $settings->fill($validated);
        $settings->save();

        Cache::forget('company_settings');

        return response()->json([
            'message' => 'Pengaturan berhasil diupdate',
            'settings' => $settings,
        ]);
    }

    /**
     * NOTIFICATION SETTINGS
     */
    public function notificationSettings()
    {
        $settings = $this->getNotificationConfig();
        
        return Inertia::render('admin/settings/notifications/index', [
            'settings' => $settings,
        ]);
    }

    public function getNotificationSettings()
    {
        $settings = $this->getNotificationConfig();
        return response()->json($settings);
    }

    public function updateNotificationSettings(Request $request)
    {
        $validated = $request->validate([
            'email_notifications' => 'required|boolean',
            'order_notifications' => 'required|boolean',
            'payment_notifications' => 'required|boolean',
            'event_notifications' => 'required|boolean',
            'low_stock_notifications' => 'required|boolean',
            'admin_email' => 'required|email',
            'notification_emails' => 'nullable|array',
        ]);

        $configPath = config_path('notifications.php');
        $content = "<?php\n\nreturn " . var_export($validated, true) . ";\n";
        file_put_contents($configPath, $content);

        Cache::forget('notification_settings');

        return response()->json([
            'message' => 'Pengaturan notifikasi berhasil diupdate',
            'settings' => $validated,
        ]);
    }

    private function getNotificationConfig()
    {
        if (file_exists(config_path('notifications.php'))) {
            return config('notifications');
        }

        return [
            'email_notifications' => true,
            'order_notifications' => true,
            'payment_notifications' => true,
            'event_notifications' => true,
            'low_stock_notifications' => true,
            'admin_email' => 'admin@sistemdekor.com',
            'notification_emails' => [],
        ];
    }

    /**
     * EMAIL TEMPLATES
     */
    public function emailTemplates()
    {
        $templates = $this->getEmailTemplatesConfig();
        
        return Inertia::render('admin/settings/email-templates/index', [
            'templates' => $templates,
        ]);
    }

    public function getEmailTemplates()
    {
        $templates = $this->getEmailTemplatesConfig();
        return response()->json($templates);
    }

    public function updateEmailTemplate(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string|in:order_confirmation,payment_confirmation,event_reminder,low_stock_alert,welcome_email',
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
            'enabled' => 'required|boolean',
        ]);

        $templates = $this->getEmailTemplatesConfig();
        $templates[$validated['type']] = [
            'subject' => $validated['subject'],
            'content' => $validated['content'],
            'enabled' => $validated['enabled'],
        ];

        $configPath = config_path('email-templates.php');
        $content = "<?php\n\nreturn " . var_export($templates, true) . ";\n";
        file_put_contents($configPath, $content);

        Cache::forget('email_templates');

        return response()->json([
            'message' => 'Template email berhasil diupdate',
            'templates' => $templates,
        ]);
    }

    private function getEmailTemplatesConfig()
    {
        if (file_exists(config_path('email-templates.php'))) {
            return config('email-templates');
        }

        return [
            'order_confirmation' => [
                'subject' => 'Konfirmasi Order - {order_number}',
                'content' => "Halo {client_name},\n\nTerima kasih telah memesan layanan kami.\n\nDetail Order:\nNomor Order: {order_number}\nPackage: {package_name}\nTotal: {total_price}\n\nTerima kasih,\n{company_name}",
                'enabled' => true,
            ],
            'payment_confirmation' => [
                'subject' => 'Konfirmasi Pembayaran - {order_number}',
                'content' => "Halo {client_name},\n\nPembayaran Anda telah kami terima.\n\nDetail:\nNomor Order: {order_number}\nJumlah: {amount}\nTanggal: {date}\n\nTerima kasih,\n{company_name}",
                'enabled' => true,
            ],
            'event_reminder' => [
                'subject' => 'Reminder: Event {event_name}',
                'content' => "Halo {client_name},\n\nEvent Anda akan berlangsung pada:\nTanggal: {event_date}\nLokasi: {venue}\n\nPersiapan sudah kami lakukan.\n\nTerima kasih,\n{company_name}",
                'enabled' => true,
            ],
            'low_stock_alert' => [
                'subject' => 'Alert: Stok Rendah - {item_name}',
                'content' => "Alert Stok Rendah!\n\nItem: {item_name}\nStok Saat Ini: {current_stock}\nMinimum: {minimum_stock}\n\nSegera lakukan restock.",
                'enabled' => true,
            ],
            'welcome_email' => [
                'subject' => 'Selamat Datang di {company_name}',
                'content' => "Halo {client_name},\n\nSelamat datang di {company_name}!\n\nTerima kasih telah mendaftar. Kami siap membantu mewujudkan acara impian Anda.\n\nSalam,\nTeam {company_name}",
                'enabled' => true,
            ],
        ];
    }

    /**
     * BACKUP & RESTORE
     */
    public function backupRestore()
    {
        $backups = $this->getBackupList();
        
        return Inertia::render('admin/settings/backup/index', [
            'backups' => $backups,
        ]);
    }

    public function getBackupList()
    {
        $backupPath = storage_path('app/backups');
        
        if (!file_exists($backupPath)) {
            mkdir($backupPath, 0755, true);
        }

        $files = array_diff(scandir($backupPath), ['.', '..']);
        $backups = [];

        foreach ($files as $file) {
            $filePath = $backupPath . '/' . $file;
            if (is_file($filePath)) {
                $backups[] = [
                    'filename' => $file,
                    'size' => filesize($filePath),
                    'date' => date('Y-m-d H:i:s', filemtime($filePath)),
                    'path' => $filePath,
                ];
            }
        }

        usort($backups, function($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });

        return response()->json($backups);
    }

    public function createBackup(Request $request)
    {
        try {
            $backupPath = storage_path('app/backups');
            
            if (!file_exists($backupPath)) {
                mkdir($backupPath, 0755, true);
            }

            $filename = 'backup_' . date('Y-m-d_H-i-s') . '.sql';
            $filepath = $backupPath . '/' . $filename;

            $dbName = env('DB_DATABASE');
            $dbUser = env('DB_USERNAME');
            $dbPass = env('DB_PASSWORD');
            $dbHost = env('DB_HOST');

            // Get all tables
            $tables = DB::select('SHOW TABLES');
            $output = "-- Database Backup\n";
            $output .= "-- Generated: " . date('Y-m-d H:i:s') . "\n\n";

            foreach ($tables as $table) {
                $tableName = array_values((array)$table)[0];
                
                // Get table structure
                $createTable = DB::select("SHOW CREATE TABLE `$tableName`");
                $output .= "\n\n-- Table: $tableName\n";
                $output .= "DROP TABLE IF EXISTS `$tableName`;\n";
                $output .= $createTable[0]->{'Create Table'} . ";\n\n";

                // Get table data
                $rows = DB::table($tableName)->get();
                if ($rows->count() > 0) {
                    $output .= "-- Data for table $tableName\n";
                    foreach ($rows as $row) {
                        $values = array_map(function($value) {
                            return is_null($value) ? 'NULL' : "'" . addslashes($value) . "'";
                        }, (array)$row);
                        $output .= "INSERT INTO `$tableName` VALUES (" . implode(', ', $values) . ");\n";
                    }
                }
            }

            file_put_contents($filepath, $output);

            return response()->json([
                'message' => 'Backup berhasil dibuat',
                'filename' => $filename,
                'size' => filesize($filepath),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal membuat backup: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function downloadBackup($filename)
    {
        $filepath = storage_path('app/backups/' . $filename);
        
        if (!file_exists($filepath)) {
            abort(404, 'Backup file not found');
        }

        return response()->download($filepath);
    }

    public function deleteBackup($filename)
    {
        $filepath = storage_path('app/backups/' . $filename);
        
        if (file_exists($filepath)) {
            unlink($filepath);
            return response()->json(['message' => 'Backup berhasil dihapus']);
        }

        return response()->json(['message' => 'Backup tidak ditemukan'], 404);
    }

    public function restoreBackup(Request $request, $filename)
    {
        try {
            $filepath = storage_path('app/backups/' . $filename);
            
            if (!file_exists($filepath)) {
                return response()->json(['message' => 'Backup tidak ditemukan'], 404);
            }

            $sql = file_get_contents($filepath);
            
            // Disable foreign key checks
            DB::statement('SET FOREIGN_KEY_CHECKS=0');
            
            // Execute SQL
            DB::unprepared($sql);
            
            // Enable foreign key checks
            DB::statement('SET FOREIGN_KEY_CHECKS=1');

            // Clear all caches
            Cache::flush();
            Artisan::call('config:clear');
            Artisan::call('cache:clear');
            Artisan::call('view:clear');

            return response()->json(['message' => 'Database berhasil direstore']);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal restore database: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * SYSTEM INFO
     */
    public function getSystemInfo()
    {
        return response()->json([
            'php_version' => phpversion(),
            'laravel_version' => app()->version(),
            'database' => [
                'driver' => config('database.default'),
                'name' => env('DB_DATABASE'),
            ],
            'server' => [
                'software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
                'os' => PHP_OS,
            ],
            'storage' => [
                'total' => disk_total_space('/'),
                'free' => disk_free_space('/'),
            ],
            'cache_driver' => config('cache.default'),
            'session_driver' => config('session.driver'),
        ]);
    }

    public function clearCache()
    {
        try {
            Cache::flush();
            Artisan::call('config:clear');
            Artisan::call('cache:clear');
            Artisan::call('route:clear');
            Artisan::call('view:clear');

            return response()->json(['message' => 'Cache berhasil dibersihkan']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal membersihkan cache: ' . $e->getMessage()], 500);
        }
    }
}
