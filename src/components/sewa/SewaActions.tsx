import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Sewa } from "../../types/sewa";
import { Button } from "../../components/ui/Button";

interface SewaActionsProps {
  sewa: Sewa;
  onSelesai: () => void;
  onHapus: () => void;
  onWhatsAppAction: (action: string) => void;
  isLewatTempo: boolean;
}

const SewaActions: React.FC<SewaActionsProps> = ({
  sewa,
  onSelesai,
  onHapus,
  onWhatsAppAction,
  isLewatTempo,
}) => {
  const [whatsappDropdown, setWhatsappDropdown] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sentAction, setSentAction] = useState<string | null>(null);

  const handleWhatsAppClick = async (action: string) => {
    setIsSending(true);
    setSentAction(action);

    await onWhatsAppAction(action);

    setIsSending(false);
    setSentAction(null);
    setWhatsappDropdown(false);
  };

  const handleSendMessage = () => {
    if (!sewa.penyewa?.no_whatsapp) return;

    // Format nomor WhatsApp (hapus karakter selain angka)
    const phoneNumber = sewa.penyewa.no_whatsapp.replace(/\D/g, "");

    // Buat pesan default
    const defaultMessage = `Halo ${sewa.penyewa.nama}, mengenai sewa motor ${sewa.motor?.merk} ${sewa.motor?.model} (${sewa.motor?.plat_nomor})`;

    // Encode message untuk URL
    const encodedMessage = encodeURIComponent(defaultMessage);

    // Buka WhatsApp
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodedMessage}`,
      "_blank"
    );
    setWhatsappDropdown(false);
  };

  const canSendReminder = sewa.status === "aktif" && sewa.penyewa?.no_whatsapp;
  const canSendAlert = isLewatTempo && sewa.status === "aktif";
  const canSendMessage = sewa.penyewa?.no_whatsapp;

  return (
    <div className="flex flex-wrap gap-2">
      {/* WhatsApp Dropdown */}
      {canSendMessage && (
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setWhatsappDropdown(!whatsappDropdown)}
            className="flex items-center gap-2"
          >
            <span>WhatsApp</span>
            <svg
              className={`w-3 h-3 transition-transform ${
                whatsappDropdown ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </Button>

          {whatsappDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-10 overflow-hidden">
              <div className="p-2 space-y-1">
                {/* Opsi Kirim Pesan Langsung */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSendMessage}
                  className="w-full justify-start text-sm font-normal h-auto py-2 px-3 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.243-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893c0-3.189-1.248-6.189-3.515-8.444" />
                    </svg>
                    <span>Kirim Pesan ke {sewa.penyewa?.nama}</span>
                  </div>
                </Button>

                {/* Opsi Kirim Pengingat */}
                {canSendReminder && (
                  <Button
                    variant="ghost"
                    size="sm"
                    animation={
                      sentAction === "reminder" && isSending ? "send" : "none"
                    }
                    sent={sentAction === "reminder" && isSending}
                    onClick={() => handleWhatsAppClick("reminder")}
                    disabled={isSending}
                    className="w-full justify-start text-sm font-normal h-auto py-2 px-3 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-yellow-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>
                        {isSending && sentAction === "reminder"
                          ? "Mengirim..."
                          : "Kirim Pengingat Otomatis"}
                      </span>
                    </div>
                  </Button>
                )}

                {/* Opsi Kirim Alert Admin */}
                {canSendAlert && (
                  <Button
                    variant="ghost"
                    size="sm"
                    animation={
                      sentAction === "alert" && isSending ? "send" : "none"
                    }
                    sent={sentAction === "alert" && isSending}
                    onClick={() => handleWhatsAppClick("alert")}
                    disabled={isSending}
                    className="w-full justify-start text-sm font-normal h-auto py-2 px-3 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                      <span>
                        {isSending && sentAction === "alert"
                          ? "Mengirim..."
                          : "Kirim Alert Admin"}
                      </span>
                    </div>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Aksi Lainnya */}
      {sewa.status === "aktif" && (
        <Button onClick={onSelesai} variant="success">
          Selesai Sewa
        </Button>
      )}

      <Link to={`/sewas/${sewa.id}/edit`}>
        <Button variant="outline">Edit</Button>
      </Link>

      <Button
        variant="danger"
        onClick={onHapus}
        className="hover:scale-105 active:scale-95"
      >
        Hapus
      </Button>
    </div>
  );
};

export default SewaActions;
