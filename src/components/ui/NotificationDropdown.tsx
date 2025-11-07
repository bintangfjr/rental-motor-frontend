import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react"; // ikon lonceng dari lucide-react
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: number;
  message: string;
  time: string;
}

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Simulasi data notifikasi (bisa diganti fetch API)
  useEffect(() => {
    setNotifications([
      {
        id: 1,
        message: "Penyewa A belum mengembalikan motor Beat.",
        time: "5 menit lalu",
      },
      {
        id: 2,
        message: "Motor NMAX sudah dikembalikan.",
        time: "10 menit lalu",
      },
      { id: 3, message: "Ada penyewaan baru untuk Vario.", time: "1 jam lalu" },
    ]);
  }, []);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Tombol lonceng */}
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-hover transition"
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-72 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-border rounded-lg shadow-lg z-50"
          >
            <div className="p-3 font-semibold border-b dark:border-dark-border">
              Notifikasi
            </div>
            <div className="max-h-60 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-dark-hover border-b dark:border-dark-border transition"
                  >
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {notif.time}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-3 text-sm text-gray-500 dark:text-gray-400">
                  Tidak ada notifikasi baru
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
