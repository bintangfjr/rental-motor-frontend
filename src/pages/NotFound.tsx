import React, { lazy } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">Halaman Tidak Ditemukan</h2>
          <p className="text-gray-500">
            Maaf, halaman yang Anda cari tidak ditemukan atau tidak tersedia.
          </p>
        </div>
        
        <div className="space-x-4">
          <Link to="/">
            <Button>Kembali ke Beranda</Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline">Ke Dashboard</Button>
          </Link>
        </div>
        
        <div className="mt-8 text-gray-400">
          <p>Jika Anda merasa ini adalah kesalahan, hubungi administrator.</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;