import React, { useState, useEffect, lazy } from 'react';
import { Link } from 'react-router-dom';
import { reportService } from '../services/reportService';
import { motorService } from '../services/motorService';
import { penyewaService } from '../services/penyewaService';
import { sewaService } from '../services/sewaService';
import { Button } from '../components/ui/Button';
import { formatCurrency } from '../utils/formatters';

const Home: React.FC = () => {
  const [stats, setStats] = useState({
    totalMotors: 0,
    totalPenyewas: 0,
    activeRentals: 0,
    availableMotors: 0,
    monthlyRevenue: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const [
        motors,
        penyewas,
        sewas,
        dashboardStats
      ] = await Promise.all([
        motorService.getAll(),
        penyewaService.getAll(),
        sewaService.getAll(),
        reportService.getDashboardStats()
      ]);

      setStats({
        totalMotors: motors.length,
        totalPenyewas: penyewas.length,
        activeRentals: dashboardStats.jumlahSewaAktif,
        availableMotors: dashboardStats.jumlahMotorTersedia,
        monthlyRevenue: dashboardStats.totalPendapatan,
      });

      // Get recent rentals (last 5)
      setRecentActivity(sewas.slice(0, 5));
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Tambah Sewa',
      description: 'Buat transaksi sewa baru',
      icon: '📝',
      link: '/sewas/create',
      color: 'bg-blue-500'
    },
    {
      title: 'Kelola Motor',
      description: 'Lihat dan kelola daftar motor',
      icon: '🏍️',
      link: '/motors',
      color: 'bg-green-500'
    },
    {
      title: 'Data Penyewa',
      description: 'Kelola data penyewa',
      icon: '👥',
      link: '/penyewas',
      color: 'bg-purple-500'
    },
    {
      title: 'Laporan',
      description: 'Lihat laporan dan statistik',
      icon: '📊',
      link: '/reports',
      color: 'bg-orange-500'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Selamat Datang!</h1>
        <p className="text-blue-100">Sistem Manajemen Rental Motor</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl">🏍️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Motor</p>
              <p className="text-2xl font-bold">{stats.totalMotors}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Penyewa</p>
              <p className="text-2xl font-bold">{stats.totalPenyewas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <span className="text-2xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Sewa Aktif</p>
              <p className="text-2xl font-bold">{stats.activeRentals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Motor Tersedia</p>
              <p className="text-2xl font-bold">{stats.availableMotors}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pendapatan Bulan Ini</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action, index) => (
          <Link key={index} to={action.link}>
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center mb-3">
                <span className="text-3xl">{action.icon}</span>
              </div>
              <h3 className="font-semibold text-lg mb-1">{action.title}</h3>
              <p className="text-gray-600 text-sm">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Sewa Terbaru</h2>
          <div className="space-y-3">
            {recentActivity.map((sewa, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium">
                    {sewa.motor.merk} {sewa.motor.model}
                  </p>
                  <p className="text-sm text-gray-600">
                    {sewa.penyewa.nama} • {new Date(sewa.tgl_sewa).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {sewa.durasi_sewa} hari
                </span>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-gray-500 text-center py-4">Belum ada sewa aktif</p>
            )}
          </div>
          <Link to="/sewas">
            <Button variant="outline" className="w-full mt-4">
              Lihat Semua Sewa
            </Button>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Aktivitas Cepat</h2>
          <div className="space-y-3">
            <Link to="/motors/create">
              <Button variant="outline" className="w-full justify-start">
                🏍️ Tambah Motor Baru
              </Button>
            </Link>
            <Link to="/penyewas/create">
              <Button variant="outline" className="w-full justify-start">
                👥 Tambah Penyewa Baru
              </Button>
            </Link>
            <Link to="/reports">
              <Button variant="outline" className="w-full justify-start">
                📊 Lihat Laporan
              </Button>
            </Link>
            <Link to="/histories">
              <Button variant="outline" className="w-full justify-start">
                📋 Riwayat Sewa
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;