<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Employee;
use App\Models\EmployeeSchedule;
use App\Models\EmployeeAssignment;
use App\Models\EmployeeAttendance;
use App\Models\Order;
use App\Models\User;
use Carbon\Carbon;

class EmployeeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🔄 Clearing existing employee data...');
        
        // Clear existing data - order matters due to foreign keys
        \DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        EmployeeAttendance::truncate();
        EmployeeAssignment::truncate();
        EmployeeSchedule::truncate();
        Employee::truncate();
        \DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $this->command->info('👥 Seeding Employee data...');

        // Create Employees
        $employees = $this->createEmployees();
        $this->command->info('✓ Created ' . count($employees) . ' employees');

        // Create Employee Schedules
        $schedules = $this->createEmployeeSchedules($employees);
        $this->command->info('✓ Created ' . count($schedules) . ' employee schedules');

        // Create Employee Assignments
        $assignments = $this->createEmployeeAssignments($employees);
        $this->command->info('✓ Created ' . count($assignments) . ' employee assignments');

        // Create Employee Attendance
        $attendances = $this->createEmployeeAttendance($employees);
        $this->command->info('✓ Created ' . count($attendances) . ' attendance records');

        $this->command->info('✅ Employee seeding completed successfully!');
    }

    private function createEmployees()
    {
        $employeesData = [
            // Event Coordinators
            [
                'employee_code' => 'EMP-001',
                'name' => 'Rina Susanti',
                'email' => 'rina.susanti@sistemdekor.com',
                'phone' => '081234567801',
                'position' => 'event_coordinator',
                'department' => 'Event Management',
                'join_date' => '2023-01-15',
                'employment_type' => 'full_time',
                'status' => 'active',
                'address' => 'Jl. Tebet Raya No. 45, Jakarta Selatan',
                'city' => 'Jakarta Selatan',
                'emergency_contact_name' => 'Budi Susanto (Suami)',
                'emergency_contact_phone' => '081234567802',
                'salary' => 8000000,
                'skills' => json_encode(['Event Planning', 'Client Management', 'Team Leadership', 'Budget Management', 'Problem Solving']),
                'notes' => 'Koordinator senior dengan pengalaman 5 tahun. Excellent di wedding & corporate events.',
            ],
            [
                'employee_code' => 'EMP-002',
                'name' => 'Dian Pramesti',
                'email' => 'dian.pramesti@sistemdekor.com',
                'phone' => '081234567803',
                'position' => 'event_coordinator',
                'department' => 'Event Management',
                'join_date' => '2023-06-01',
                'employment_type' => 'full_time',
                'status' => 'active',
                'address' => 'Jl. Kemang Utara No. 12, Jakarta Selatan',
                'city' => 'Jakarta Selatan',
                'emergency_contact_name' => 'Siti Nurhaliza (Ibu)',
                'emergency_contact_phone' => '081234567804',
                'salary' => 7000000,
                'skills' => json_encode(['Event Coordination', 'Vendor Management', 'Timeline Management', 'Communication']),
                'notes' => 'Spesialisasi di intimate wedding dan engagement party.',
            ],

            // Decorators
            [
                'employee_code' => 'EMP-003',
                'name' => 'Budi Setiawan',
                'email' => 'budi.setiawan@sistemdekor.com',
                'phone' => '081234567805',
                'position' => 'decorator',
                'department' => 'Decoration',
                'join_date' => '2022-08-10',
                'employment_type' => 'full_time',
                'status' => 'active',
                'address' => 'Jl. Cibubur Raya No. 78, Jakarta Timur',
                'city' => 'Jakarta Timur',
                'emergency_contact_name' => 'Ani Setiawati (Istri)',
                'emergency_contact_phone' => '081234567806',
                'salary' => 5500000,
                'skills' => json_encode(['Floral Arrangement', 'Stage Design', 'Backdrop Setup', 'Color Theory', 'Space Planning']),
                'notes' => 'Ahli dekorasi bunga dan backdrop. Kreatif dan detail oriented.',
            ],
            [
                'employee_code' => 'EMP-004',
                'name' => 'Sari Indah',
                'email' => 'sari.indah@sistemdekor.com',
                'phone' => '081234567807',
                'position' => 'decorator',
                'department' => 'Decoration',
                'join_date' => '2023-03-15',
                'employment_type' => 'full_time',
                'status' => 'active',
                'address' => 'Jl. Pondok Indah No. 23, Jakarta Selatan',
                'city' => 'Jakarta Selatan',
                'emergency_contact_name' => 'Ahmad Hidayat (Ayah)',
                'emergency_contact_phone' => '081234567808',
                'salary' => 5000000,
                'skills' => json_encode(['Table Setting', 'Lighting Setup', 'Props Arrangement', 'Modern Design']),
                'notes' => 'Spesialisasi di modern minimalist decoration.',
            ],

            // Photographers
            [
                'employee_code' => 'EMP-005',
                'name' => 'Andi Wijaya',
                'email' => 'andi.wijaya@sistemdekor.com',
                'phone' => '081234567809',
                'position' => 'photographer',
                'department' => 'Documentation',
                'join_date' => '2022-05-20',
                'employment_type' => 'full_time',
                'status' => 'active',
                'address' => 'Jl. Cipete Raya No. 56, Jakarta Selatan',
                'city' => 'Jakarta Selatan',
                'emergency_contact_name' => 'Rina Wijaya (Istri)',
                'emergency_contact_phone' => '081234567810',
                'salary' => 6500000,
                'skills' => json_encode(['Wedding Photography', 'Portrait', 'Event Coverage', 'Photo Editing', 'Lightroom', 'Photoshop']),
                'notes' => 'Fotografer senior dengan portfolio wedding 100+ events.',
            ],
            [
                'employee_code' => 'EMP-006',
                'name' => 'Dimas Prasetyo',
                'email' => 'dimas.prasetyo@sistemdekor.com',
                'phone' => '081234567811',
                'position' => 'photographer',
                'department' => 'Documentation',
                'join_date' => '2023-09-01',
                'employment_type' => 'freelance',
                'status' => 'active',
                'address' => 'Jl. Menteng Dalam No. 34, Jakarta Pusat',
                'city' => 'Jakarta Pusat',
                'emergency_contact_name' => 'Budi Prasetyo (Ayah)',
                'emergency_contact_phone' => '081234567812',
                'salary' => null,
                'skills' => json_encode(['Product Photography', 'Candid Photography', 'Photo Editing']),
                'notes' => 'Freelancer untuk backup events.',
            ],

            // Videographers
            [
                'employee_code' => 'EMP-007',
                'name' => 'Reza Firmansyah',
                'email' => 'reza.firmansyah@sistemdekor.com',
                'phone' => '081234567813',
                'position' => 'videographer',
                'department' => 'Documentation',
                'join_date' => '2022-11-10',
                'employment_type' => 'full_time',
                'status' => 'active',
                'address' => 'Jl. Kelapa Gading No. 89, Jakarta Utara',
                'city' => 'Jakarta Utara',
                'emergency_contact_name' => 'Siti Firmansyah (Ibu)',
                'emergency_contact_phone' => '081234567814',
                'salary' => 7000000,
                'skills' => json_encode(['Cinematic Video', 'Drone Operation', 'Video Editing', 'Premiere Pro', 'After Effects', 'Color Grading']),
                'notes' => 'Expert di cinematic wedding video dan drone footage.',
            ],

            // MC (Master of Ceremony)
            [
                'employee_code' => 'EMP-008',
                'name' => 'Ayu Kartika',
                'email' => 'ayu.kartika@sistemdekor.com',
                'phone' => '081234567815',
                'position' => 'mc',
                'department' => 'Entertainment',
                'join_date' => '2023-02-01',
                'employment_type' => 'freelance',
                'status' => 'active',
                'address' => 'Jl. Bintaro Raya No. 12, Tangerang Selatan',
                'city' => 'Tangerang Selatan',
                'emergency_contact_name' => 'Dewi Kartika (Kakak)',
                'emergency_contact_phone' => '081234567816',
                'salary' => null,
                'skills' => json_encode(['Public Speaking', 'Bilingual (ID/EN)', 'Event Hosting', 'Entertainment', 'Audience Engagement']),
                'notes' => 'MC profesional untuk wedding dan corporate events.',
            ],
            [
                'employee_code' => 'EMP-009',
                'name' => 'Fahmi Rahman',
                'email' => 'fahmi.rahman@sistemdekor.com',
                'phone' => '081234567817',
                'position' => 'mc',
                'department' => 'Entertainment',
                'join_date' => '2023-04-15',
                'employment_type' => 'freelance',
                'status' => 'active',
                'address' => 'Jl. Senopati No. 45, Jakarta Selatan',
                'city' => 'Jakarta Selatan',
                'emergency_contact_name' => 'Indah Rahman (Istri)',
                'emergency_contact_phone' => '081234567818',
                'salary' => null,
                'skills' => json_encode(['Public Speaking', 'Comedy', 'Improvisation', 'Trilingual (ID/EN/Mandarin)']),
                'notes' => 'MC versatile, bisa formal dan casual events.',
            ],

            // Sound Technicians
            [
                'employee_code' => 'EMP-010',
                'name' => 'Agus Santoso',
                'email' => 'agus.santoso@sistemdekor.com',
                'phone' => '081234567819',
                'position' => 'sound_technician',
                'department' => 'Technical',
                'join_date' => '2022-03-01',
                'employment_type' => 'full_time',
                'status' => 'active',
                'address' => 'Jl. Cakung Raya No. 67, Jakarta Timur',
                'city' => 'Jakarta Timur',
                'emergency_contact_name' => 'Wati Santoso (Istri)',
                'emergency_contact_phone' => '081234567820',
                'salary' => 5500000,
                'skills' => json_encode(['Sound System Setup', 'Audio Mixing', 'Microphone Setup', 'Troubleshooting', 'Equipment Maintenance']),
                'notes' => 'Teknisi sound berpengalaman 7 tahun.',
            ],

            // Lighting Technicians
            [
                'employee_code' => 'EMP-011',
                'name' => 'Eko Prasetyo',
                'email' => 'eko.prasetyo@sistemdekor.com',
                'phone' => '081234567821',
                'position' => 'lighting_technician',
                'department' => 'Technical',
                'join_date' => '2022-07-15',
                'employment_type' => 'full_time',
                'status' => 'active',
                'address' => 'Jl. Sunter Agung No. 34, Jakarta Utara',
                'city' => 'Jakarta Utara',
                'emergency_contact_name' => 'Rina Prasetyo (Istri)',
                'emergency_contact_phone' => '081234567822',
                'salary' => 5500000,
                'skills' => json_encode(['Stage Lighting', 'LED Setup', 'DMX Control', 'Lighting Design', 'Moving Lights']),
                'notes' => 'Ahli lighting design dan operation.',
            ],

            // Caterers
            [
                'employee_code' => 'EMP-012',
                'name' => 'Siti Rahayu',
                'email' => 'siti.rahayu@sistemdekor.com',
                'phone' => '081234567823',
                'position' => 'caterer',
                'department' => 'Catering',
                'join_date' => '2022-09-01',
                'employment_type' => 'full_time',
                'status' => 'active',
                'address' => 'Jl. Condet Raya No. 78, Jakarta Timur',
                'city' => 'Jakarta Timur',
                'emergency_contact_name' => 'Ahmad Yani (Suami)',
                'emergency_contact_phone' => '081234567824',
                'salary' => 4500000,
                'skills' => json_encode(['Food Preparation', 'Food Service', 'Buffet Setup', 'Kitchen Management', 'Hygiene Standards']),
                'notes' => 'Kepala tim catering dengan tim 5 orang.',
            ],

            // Drivers
            [
                'employee_code' => 'EMP-013',
                'name' => 'Joko Widodo',
                'email' => 'joko.widodo@sistemdekor.com',
                'phone' => '081234567825',
                'position' => 'driver',
                'department' => 'Logistics',
                'join_date' => '2022-04-01',
                'employment_type' => 'full_time',
                'status' => 'active',
                'address' => 'Jl. Ciracas No. 23, Jakarta Timur',
                'city' => 'Jakarta Timur',
                'emergency_contact_name' => 'Sumiati (Istri)',
                'emergency_contact_phone' => '081234567826',
                'salary' => 4500000,
                'skills' => json_encode(['Professional Driving', 'Route Planning', 'Vehicle Maintenance', 'SIM A & SIM B1']),
                'notes' => 'Driver truk box untuk logistik equipment.',
            ],
            [
                'employee_code' => 'EMP-014',
                'name' => 'Bambang Suryadi',
                'email' => 'bambang.suryadi@sistemdekor.com',
                'phone' => '081234567827',
                'position' => 'driver',
                'department' => 'Logistics',
                'join_date' => '2023-01-10',
                'employment_type' => 'part_time',
                'status' => 'active',
                'address' => 'Jl. Bekasi Raya No. 45, Bekasi',
                'city' => 'Bekasi',
                'emergency_contact_name' => 'Eko Suryadi (Anak)',
                'emergency_contact_phone' => '081234567828',
                'salary' => 3000000,
                'skills' => json_encode(['Driving', 'Loading/Unloading', 'Delivery']),
                'notes' => 'Driver part-time untuk backup.',
            ],

            // Admin
            [
                'employee_code' => 'EMP-015',
                'name' => 'Lisa Andriani',
                'email' => 'lisa.andriani@sistemdekor.com',
                'phone' => '081234567829',
                'position' => 'admin',
                'department' => 'Administration',
                'join_date' => '2022-06-01',
                'employment_type' => 'full_time',
                'status' => 'active',
                'address' => 'Jl. Kebayoran Lama No. 56, Jakarta Selatan',
                'city' => 'Jakarta Selatan',
                'emergency_contact_name' => 'Dian Andriani (Kakak)',
                'emergency_contact_phone' => '081234567830',
                'salary' => 5000000,
                'skills' => json_encode(['Office Management', 'Data Entry', 'Microsoft Office', 'Customer Service', 'Scheduling']),
                'notes' => 'Admin office untuk handling surat-menyurat dan dokumentasi.',
            ],

            // Manager
            [
                'employee_code' => 'EMP-016',
                'name' => 'Hendra Gunawan',
                'email' => 'hendra.gunawan@sistemdekor.com',
                'phone' => '081234567831',
                'position' => 'manager',
                'department' => 'Operations',
                'join_date' => '2021-01-01',
                'employment_type' => 'full_time',
                'status' => 'active',
                'address' => 'Jl. Pejaten Raya No. 12, Jakarta Selatan',
                'city' => 'Jakarta Selatan',
                'emergency_contact_name' => 'Nina Gunawan (Istri)',
                'emergency_contact_phone' => '081234567832',
                'salary' => 12000000,
                'skills' => json_encode(['Leadership', 'Operations Management', 'Strategic Planning', 'Budget Management', 'Team Development', 'Client Relations']),
                'notes' => 'Operations Manager, handle all event operations dan team management.',
            ],

            // Inactive/On Leave
            [
                'employee_code' => 'EMP-017',
                'name' => 'Rina Wulandari',
                'email' => 'rina.wulandari@sistemdekor.com',
                'phone' => '081234567833',
                'position' => 'decorator',
                'department' => 'Decoration',
                'join_date' => '2022-10-01',
                'employment_type' => 'full_time',
                'status' => 'on_leave',
                'address' => 'Jl. Jagakarsa No. 89, Jakarta Selatan',
                'city' => 'Jakarta Selatan',
                'emergency_contact_name' => 'Budi Wulandari (Suami)',
                'emergency_contact_phone' => '081234567834',
                'salary' => 5000000,
                'skills' => json_encode(['Decoration', 'Flower Arrangement']),
                'notes' => 'Cuti melahirkan sampai Februari 2026.',
            ],
        ];

        $employees = [];
        foreach ($employeesData as $data) {
            $employees[] = Employee::create($data);
        }

        return $employees;
    }

    private function createEmployeeSchedules($employees)
    {
        $schedules = [];
        $today = Carbon::today();
        
        // Create schedules for next 30 days
        for ($i = 0; $i < 30; $i++) {
            $date = $today->copy()->addDays($i);
            
            // Skip Sundays (most employees off)
            if ($date->dayOfWeek == Carbon::SUNDAY) {
                continue;
            }
            
            foreach ($employees as $employee) {
                // Skip inactive/on leave employees
                if (in_array($employee->status, ['inactive', 'on_leave', 'terminated'])) {
                    continue;
                }
                
                // Skip freelancers for regular schedules (they work on assignments only)
                if ($employee->employment_type == 'freelance') {
                    continue;
                }
                
                // Different shifts based on position
                $shiftData = $this->getShiftForPosition($employee->position, $date);
                
                if ($shiftData) {
                    $schedules[] = EmployeeSchedule::create([
                        'employee_id' => $employee->id,
                        'date' => $date->format('Y-m-d'),
                        'shift_start' => $shiftData['start'],
                        'shift_end' => $shiftData['end'],
                        'shift_type' => $shiftData['type'],
                        'status' => $i < 7 ? 'completed' : ($i < 14 ? 'confirmed' : 'scheduled'),
                        'location' => 'Head Office',
                        'notes' => null,
                    ]);
                }
            }
        }

        return $schedules;
    }

    private function getShiftForPosition($position, $date)
    {
        // Saturday = half day for office staff
        $isSaturday = $date->dayOfWeek == Carbon::SATURDAY;
        
        switch ($position) {
            case 'manager':
            case 'admin':
                return [
                    'start' => '08:00:00',
                    'end' => $isSaturday ? '13:00:00' : '17:00:00',
                    'type' => $isSaturday ? 'morning' : 'full_day'
                ];
                
            case 'event_coordinator':
                // Coordinators work full day but flexible
                return [
                    'start' => '09:00:00',
                    'end' => $isSaturday ? '14:00:00' : '18:00:00',
                    'type' => $isSaturday ? 'morning' : 'full_day'
                ];
                
            case 'decorator':
            case 'sound_technician':
            case 'lighting_technician':
            case 'driver':
            case 'caterer':
                // Technical team shifts
                return [
                    'start' => '08:00:00',
                    'end' => '16:00:00',
                    'type' => 'full_day'
                ];
                
            default:
                return null;
        }
    }

    private function createEmployeeAssignments($employees)
    {
        $assignments = [];
        
        // Get orders to assign employees
        $orders = Order::where('status', '!=', 'cancelled')
            ->orderBy('event_date', 'desc')
            ->take(15)
            ->get();
        
        if ($orders->isEmpty()) {
            $this->command->warn('No orders found for employee assignments');
            return $assignments;
        }

        // Assignment templates based on order type
        $assignmentTemplates = [
            // Wedding assignments
            'wedding' => [
                ['position' => 'event_coordinator', 'role' => 'Event Coordinator', 'fee' => 1500000, 'tasks' => 'Koordinasi seluruh acara, timeline management, vendor coordination'],
                ['position' => 'decorator', 'role' => 'Lead Decorator', 'fee' => 800000, 'tasks' => 'Setup dekorasi utama, backdrop, stage decoration'],
                ['position' => 'decorator', 'role' => 'Assistant Decorator', 'fee' => 500000, 'tasks' => 'Assist decoration setup, table setting, props placement'],
                ['position' => 'photographer', 'role' => 'Main Photographer', 'fee' => 2000000, 'tasks' => 'Full coverage photography, couple portraits, family photos'],
                ['position' => 'videographer', 'role' => 'Videographer', 'fee' => 2500000, 'tasks' => 'Cinematic video coverage, drone shots, highlight reel'],
                ['position' => 'mc', 'role' => 'Master of Ceremony', 'fee' => 1500000, 'tasks' => 'Event hosting, rundown execution, guest entertainment'],
                ['position' => 'sound_technician', 'role' => 'Sound Engineer', 'fee' => 600000, 'tasks' => 'Sound system setup, audio mixing, microphone management'],
                ['position' => 'lighting_technician', 'role' => 'Lighting Operator', 'fee' => 600000, 'tasks' => 'Lighting setup, mood lighting, follow spot operation'],
            ],
            
            // Corporate event
            'corporate' => [
                ['position' => 'event_coordinator', 'role' => 'Event Manager', 'fee' => 2000000, 'tasks' => 'Overall event management, client liaison, timeline execution'],
                ['position' => 'sound_technician', 'role' => 'Audio Visual Technician', 'fee' => 800000, 'tasks' => 'AV setup, presentation support, sound management'],
                ['position' => 'lighting_technician', 'role' => 'Lighting Technician', 'fee' => 600000, 'tasks' => 'Stage lighting, spotlight control'],
            ],
            
            // Birthday
            'birthday' => [
                ['position' => 'event_coordinator', 'role' => 'Event Coordinator', 'fee' => 800000, 'tasks' => 'Setup coordination, entertainment schedule'],
                ['position' => 'decorator', 'role' => 'Decorator', 'fee' => 500000, 'tasks' => 'Decoration setup, balloon arrangement'],
                ['position' => 'photographer', 'role' => 'Photographer', 'fee' => 1000000, 'tasks' => 'Event photography, candid shots'],
            ],
        ];

        foreach ($orders as $order) {
            // Determine event type (simplified)
            $eventType = 'wedding'; // Default
            if (stripos($order->package->name ?? '', 'corporate') !== false) {
                $eventType = 'corporate';
            } elseif (stripos($order->package->name ?? '', 'birthday') !== false) {
                $eventType = 'birthday';
            }
            
            $template = $assignmentTemplates[$eventType] ?? $assignmentTemplates['wedding'];
            
            // Assign employees based on template
            foreach ($template as $assignment) {
                // Find available employee with this position
                $employee = $employees->where('position', $assignment['position'])
                    ->where('status', 'active')
                    ->random();
                
                if (!$employee) {
                    continue;
                }
                
                // Check if event is past or future
                $eventDate = Carbon::parse($order->event_date);
                $isPast = $eventDate->isPast();
                $status = $isPast ? 'completed' : ($eventDate->diffInDays(Carbon::today()) < 7 ? 'confirmed' : 'assigned');
                
                $assignments[] = EmployeeAssignment::create([
                    'employee_id' => $employee->id,
                    'order_id' => $order->id,
                    'role' => $assignment['role'],
                    'assignment_date' => $order->event_date,
                    'start_time' => '08:00:00',
                    'end_time' => '23:00:00',
                    'status' => $status,
                    'fee' => $assignment['fee'],
                    'tasks' => $assignment['tasks'],
                    'notes' => null,
                ]);
            }
        }

        return $assignments;
    }

    private function createEmployeeAttendance($employees)
    {
        $attendances = [];
        $today = Carbon::today();
        
        // Get admin user for approval
        $admin = User::first();
        
        // Create attendance for last 30 days
        for ($i = 30; $i >= 0; $i--) {
            $date = $today->copy()->subDays($i);
            
            // Skip Sundays
            if ($date->dayOfWeek == Carbon::SUNDAY) {
                continue;
            }
            
            foreach ($employees as $employee) {
                // Skip inactive employees
                if ($employee->status == 'inactive' || $employee->status == 'terminated') {
                    continue;
                }
                
                // Skip freelancers (no regular attendance)
                if ($employee->employment_type == 'freelance') {
                    continue;
                }
                
                // On leave employee
                if ($employee->status == 'on_leave') {
                    $attendances[] = EmployeeAttendance::create([
                        'employee_id' => $employee->id,
                        'date' => $date->format('Y-m-d'),
                        'check_in' => null,
                        'check_out' => null,
                        'status' => 'on_leave',
                        'leave_type' => 'annual',
                        'notes' => 'Cuti tahunan / melahirkan',
                        'location' => null,
                        'approved_by' => $admin->id,
                        'approved_at' => $date->copy()->subDays(5),
                    ]);
                    continue;
                }
                
                // Random attendance patterns (90% present, 5% late, 3% sick, 2% absent)
                $rand = rand(1, 100);
                
                if ($rand <= 90) {
                    // Present or Late
                    $isLate = $rand > 85;
                    $checkInTime = $isLate ? '08:' . rand(16, 45) . ':00' : '07:' . rand(30, 59) . ':00';
                    $checkOutTime = '17:' . rand(0, 30) . ':00';
                    
                    $attendances[] = EmployeeAttendance::create([
                        'employee_id' => $employee->id,
                        'date' => $date->format('Y-m-d'),
                        'check_in' => $checkInTime,
                        'check_out' => $checkOutTime,
                        'status' => $isLate ? 'late' : 'present',
                        'leave_type' => null,
                        'notes' => $isLate ? 'Terlambat karena macet' : null,
                        'location' => 'Head Office',
                        'latitude' => -6.2088 + (rand(-100, 100) / 10000),
                        'longitude' => 106.8456 + (rand(-100, 100) / 10000),
                        'approved_by' => null,
                        'approved_at' => null,
                    ]);
                } elseif ($rand <= 93) {
                    // Sick
                    $attendances[] = EmployeeAttendance::create([
                        'employee_id' => $employee->id,
                        'date' => $date->format('Y-m-d'),
                        'check_in' => null,
                        'check_out' => null,
                        'status' => 'sick',
                        'leave_type' => 'sick',
                        'notes' => 'Sakit demam, ada surat dokter',
                        'location' => null,
                        'approved_by' => $admin->id,
                        'approved_at' => $date,
                    ]);
                } else {
                    // Absent
                    $attendances[] = EmployeeAttendance::create([
                        'employee_id' => $employee->id,
                        'date' => $date->format('Y-m-d'),
                        'check_in' => null,
                        'check_out' => null,
                        'status' => 'absent',
                        'leave_type' => null,
                        'notes' => 'Tidak hadir tanpa keterangan',
                        'location' => null,
                        'approved_by' => null,
                        'approved_at' => null,
                    ]);
                }
            }
        }

        return $attendances;
    }
}
