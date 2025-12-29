import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  LogIn,
  LogOut,
  MapPin,
  User,
  ChevronLeft,
  ChevronRight,
  FileText,
  ThumbsUp
} from 'lucide-react';
import api from '@/services/api';

interface Employee {
  id: number;
  name: string;
  position: string;
}

interface Attendance {
  id: number;
  employee_id: number;
  employee: Employee;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: 'present' | 'late' | 'absent' | 'on_leave' | 'sick';
  leave_type: string | null;
  notes: string;
  location: string;
  gps_latitude: number | null;
  gps_longitude: number | null;
  approved_by: number | null;
  approved_at: string | null;
  work_hours: number | null;
}

interface Stats {
  total: number;
  present: number;
  late: number;
  on_leave: number;
  absent: number;
}

interface MonthlySummary {
  total_days: number;
  present_days: number;
  late_days: number;
  absent_days: number;
  leave_days: number;
  total_hours: number;
}

const EmployeeAttendancePage: React.FC = () => {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, present: 0, late: 0, on_leave: 0, absent: 0 });
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');

  const [formData, setFormData] = useState({
    employee_id: 0,
    date: new Date().toISOString().split('T')[0],
    check_in: '',
    check_out: '',
    status: 'present' as 'present' | 'late' | 'absent' | 'on_leave' | 'sick',
    leave_type: '',
    notes: '',
    location: '',
    gps_latitude: null as number | null,
    gps_longitude: null as number | null
  });

  const [checkInData, setCheckInData] = useState({
    employee_id: 0,
    location: '',
    notes: ''
  });

  const [checkOutData, setCheckOutData] = useState({
    attendance_id: 0,
    notes: ''
  });

  const [leaveData, setLeaveData] = useState({
    employee_id: 0,
    date: new Date().toISOString().split('T')[0],
    leave_type: 'annual' as 'annual' | 'sick' | 'emergency' | 'unpaid',
    notes: ''
  });

  const statusColors = {
    present: 'bg-green-100 text-green-800',
    late: 'bg-yellow-100 text-yellow-800',
    absent: 'bg-red-100 text-red-800',
    on_leave: 'bg-blue-100 text-blue-800',
    sick: 'bg-purple-100 text-purple-800'
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchAttendances();
    if (selectedEmployee) {
      fetchMonthlySummary();
    }
  }, [currentDate, selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees?status=active');
      setEmployees(response.data.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchAttendances = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const params = new URLSearchParams();
      if (selectedEmployee) params.append('employee_id', selectedEmployee.toString());
      params.append('year', year.toString());
      params.append('month', month.toString());
      
      const response = await api.get(`/employee-attendances?${params.toString()}`);
      setAttendances(response.data.data);
      
      // Calculate stats
      const total = response.data.data.length;
      const present = response.data.data.filter((a: Attendance) => a.status === 'present').length;
      const late = response.data.data.filter((a: Attendance) => a.status === 'late').length;
      const on_leave = response.data.data.filter((a: Attendance) => a.status === 'on_leave' || a.status === 'sick').length;
      const absent = response.data.data.filter((a: Attendance) => a.status === 'absent').length;
      
      setStats({ total, present, late, on_leave, absent });
    } catch (error) {
      console.error('Error fetching attendances:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlySummary = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await api.get(`/employee-attendances/summary/${selectedEmployee}/${year}/${month}`);
      setSummary(response.data.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Get GPS location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const data = {
              ...checkInData,
              gps_latitude: position.coords.latitude,
              gps_longitude: position.coords.longitude
            };
            await api.post('/employee-attendances/check-in', data);
            fetchAttendances();
            closeCheckInModal();
            alert('Check-in berhasil!');
          },
          (error) => {
            console.error('GPS Error:', error);
            alert('Tidak dapat mendapatkan lokasi GPS. Silakan aktifkan GPS Anda.');
          }
        );
      } else {
        await api.post('/employee-attendances/check-in', checkInData);
        fetchAttendances();
        closeCheckInModal();
        alert('Check-in berhasil!');
      }
    } catch (error) {
      console.error('Error checking in:', error);
      alert('Gagal melakukan check-in');
    }
  };

  const handleCheckOut = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/employee-attendances/${checkOutData.attendance_id}/check-out`, {
        notes: checkOutData.notes
      });
      fetchAttendances();
      closeCheckOutModal();
      alert('Check-out berhasil!');
    } catch (error) {
      console.error('Error checking out:', error);
      alert('Gagal melakukan check-out');
    }
  };

  const handleLeaveRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/employee-attendances', {
        ...leaveData,
        status: leaveData.leave_type === 'sick' ? 'sick' : 'on_leave'
      });
      fetchAttendances();
      closeLeaveModal();
      alert('Pengajuan cuti berhasil diajukan!');
    } catch (error) {
      console.error('Error requesting leave:', error);
      alert('Gagal mengajukan cuti');
    }
  };

  const handleApproveLeave = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menyetujui pengajuan cuti ini?')) return;
    
    try {
      await api.post(`/employee-attendances/${id}/approve`);
      fetchAttendances();
      alert('Pengajuan cuti berhasil disetujui!');
    } catch (error) {
      console.error('Error approving leave:', error);
      alert('Gagal menyetujui pengajuan cuti');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAttendance) {
        await api.put(`/employee-attendances/${editingAttendance.id}`, formData);
      } else {
        await api.post('/employee-attendances', formData);
      }
      fetchAttendances();
      closeModal();
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Gagal menyimpan data absensi');
    }
  };

  const openModal = (attendance?: Attendance) => {
    if (attendance) {
      setEditingAttendance(attendance);
      setFormData({
        employee_id: attendance.employee_id,
        date: attendance.date,
        check_in: attendance.check_in || '',
        check_out: attendance.check_out || '',
        status: attendance.status,
        leave_type: attendance.leave_type || '',
        notes: attendance.notes,
        location: attendance.location,
        gps_latitude: attendance.gps_latitude,
        gps_longitude: attendance.gps_longitude
      });
    } else {
      setEditingAttendance(null);
      setFormData({
        employee_id: selectedEmployee || 0,
        date: new Date().toISOString().split('T')[0],
        check_in: '',
        check_out: '',
        status: 'present',
        leave_type: '',
        notes: '',
        location: '',
        gps_latitude: null,
        gps_longitude: null
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAttendance(null);
  };

  const openCheckInModal = () => {
    setCheckInData({
      employee_id: selectedEmployee || 0,
      location: '',
      notes: ''
    });
    setShowCheckInModal(true);
  };

  const closeCheckInModal = () => {
    setShowCheckInModal(false);
  };

  const openCheckOutModal = (attendance: Attendance) => {
    setCheckOutData({
      attendance_id: attendance.id,
      notes: ''
    });
    setShowCheckOutModal(true);
  };

  const closeCheckOutModal = () => {
    setShowCheckOutModal(false);
  };

  const openLeaveModal = () => {
    setLeaveData({
      employee_id: selectedEmployee || 0,
      date: new Date().toISOString().split('T')[0],
      leave_type: 'annual',
      notes: ''
    });
    setShowLeaveModal(true);
  };

  const closeLeaveModal = () => {
    setShowLeaveModal(false);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const formatStatus = (status: string) => {
    const statuses: Record<string, string> = {
      present: 'Hadir',
      late: 'Terlambat',
      absent: 'Tidak Hadir',
      on_leave: 'Cuti',
      sick: 'Sakit'
    };
    return statuses[status] || status;
  };

  const formatLeaveType = (type: string | null) => {
    if (!type) return '-';
    const types: Record<string, string> = {
      annual: 'Cuti Tahunan',
      sick: 'Sakit',
      emergency: 'Darurat',
      unpaid: 'Tidak Dibayar'
    };
    return types[type] || type;
  };

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const getTodayAttendance = () => {
    const today = new Date().toISOString().split('T')[0];
    return attendances.find(a => 
      a.date === today && 
      a.employee_id === selectedEmployee
    );
  };

  const todayAttendance = getTodayAttendance();
  const canCheckIn = selectedEmployee && !todayAttendance;
  const canCheckOut = selectedEmployee && todayAttendance && todayAttendance.check_in && !todayAttendance.check_out;

  return (
    <AdminLayout>
      <Head title="Absensi Karyawan" />
      
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Absensi Karyawan</h1>
          <p className="text-gray-600">Kelola absensi dan kehadiran karyawan</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hadir</p>
                <p className="text-2xl font-bold text-green-600">{stats.present}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Terlambat</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cuti/Sakit</p>
                <p className="text-2xl font-bold text-blue-600">{stats.on_leave}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tidak Hadir</p>
                <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Summary */}
        {summary && selectedEmployee && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow mb-6 p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Ringkasan Bulan Ini</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-sm opacity-90">Total Hari</p>
                <p className="text-2xl font-bold">{summary.total_days}</p>
              </div>
              <div>
                <p className="text-sm opacity-90">Hadir</p>
                <p className="text-2xl font-bold">{summary.present_days}</p>
              </div>
              <div>
                <p className="text-sm opacity-90">Terlambat</p>
                <p className="text-2xl font-bold">{summary.late_days}</p>
              </div>
              <div>
                <p className="text-sm opacity-90">Cuti</p>
                <p className="text-2xl font-bold">{summary.leave_days}</p>
              </div>
              <div>
                <p className="text-sm opacity-90">Total Jam</p>
                <p className="text-2xl font-bold">{summary.total_hours.toFixed(1)}h</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-4 items-center flex-1">
                {/* Employee Filter */}
                <select
                  value={selectedEmployee || ''}
                  onChange={(e) => setSelectedEmployee(e.target.value ? Number(e.target.value) : null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih Karyawan</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} - {emp.position}
                    </option>
                  ))}
                </select>

                {/* Month Navigation */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={previousMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-medium min-w-[120px] text-center">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </span>
                  <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                {canCheckIn && (
                  <button
                    onClick={openCheckInModal}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <LogIn className="w-5 h-5" />
                    Check In
                  </button>
                )}
                {canCheckOut && (
                  <button
                    onClick={() => openCheckOutModal(todayAttendance)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Check Out
                  </button>
                )}
                <button
                  onClick={openLeaveModal}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={!selectedEmployee}
                >
                  <FileText className="w-5 h-5" />
                  Ajukan Cuti
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Memuat data...</p>
              </div>
            </div>
          ) : attendances.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Tidak ada data absensi</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Karyawan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jam Kerja</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lokasi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe Cuti</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendances.map((attendance) => (
                    <tr key={attendance.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-900">
                          <Calendar className="w-4 h-4" />
                          {new Date(attendance.date).toLocaleDateString('id-ID', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{attendance.employee.name}</div>
                            <div className="text-sm text-gray-500">{attendance.employee.position}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-900">
                          <Clock className="w-4 h-4" />
                          {attendance.check_in || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-900">
                          <Clock className="w-4 h-4" />
                          {attendance.check_out || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {attendance.work_hours ? `${attendance.work_hours.toFixed(1)}h` : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-900">
                          <MapPin className="w-4 h-4" />
                          {attendance.location || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[attendance.status]}`}>
                          {formatStatus(attendance.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatLeaveType(attendance.leave_type)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {(attendance.status === 'on_leave' || attendance.status === 'sick') && !attendance.approved_at && (
                            <button
                              onClick={() => handleApproveLeave(attendance.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Setujui"
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </button>
                          )}
                          {attendance.check_in && !attendance.check_out && (
                            <button
                              onClick={() => openCheckOutModal(attendance)}
                              className="text-orange-600 hover:text-orange-900"
                              title="Check Out"
                            >
                              <LogOut className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Check In Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-800">Check In</h2>
            </div>

            <form onSubmit={handleCheckIn} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Karyawan <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={checkInData.employee_id}
                    onChange={(e) => setCheckInData({ ...checkInData, employee_id: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={0}>Pilih Karyawan</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} - {emp.position}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lokasi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={checkInData.location}
                    onChange={(e) => setCheckInData({ ...checkInData, location: e.target.value })}
                    placeholder="e.g. Kantor, Client Site, etc."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan
                  </label>
                  <textarea
                    value={checkInData.notes}
                    onChange={(e) => setCheckInData({ ...checkInData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    GPS akan direkam secara otomatis untuk verifikasi lokasi.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeCheckInModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Check In Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Check Out Modal */}
      {showCheckOutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-800">Check Out</h2>
            </div>

            <form onSubmit={handleCheckOut} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan
                  </label>
                  <textarea
                    value={checkOutData.notes}
                    onChange={(e) => setCheckOutData({ ...checkOutData, notes: e.target.value })}
                    rows={3}
                    placeholder="Tambahkan catatan (opsional)..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm text-orange-800">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Waktu check-out akan dicatat sebagai waktu saat ini.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeCheckOutModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Check Out Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave Request Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-800">Ajukan Cuti</h2>
            </div>

            <form onSubmit={handleLeaveRequest} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Karyawan <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={leaveData.employee_id}
                    onChange={(e) => setLeaveData({ ...leaveData, employee_id: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={0}>Pilih Karyawan</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} - {emp.position}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveData.date}
                    onChange={(e) => setLeaveData({ ...leaveData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipe Cuti <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={leaveData.leave_type}
                    onChange={(e) => setLeaveData({ ...leaveData, leave_type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="annual">Cuti Tahunan</option>
                    <option value="sick">Sakit</option>
                    <option value="emergency">Darurat</option>
                    <option value="unpaid">Tidak Dibayar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alasan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={leaveData.notes}
                    onChange={(e) => setLeaveData({ ...leaveData, notes: e.target.value })}
                    rows={3}
                    placeholder="Jelaskan alasan pengajuan cuti..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    Pengajuan cuti akan menunggu persetujuan dari manager.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeLeaveModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ajukan Cuti
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default EmployeeAttendancePage;
