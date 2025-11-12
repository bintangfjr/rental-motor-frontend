import React, { useState } from "react";
import { Button } from "../ui/Button";
import { Textarea } from "../ui/Textarea";
import { useTheme } from "../../hooks/useTheme";

interface SewaNotesProps {
  sewaId: number;
  currentNote?: string;
  onNoteUpdated: (note: string) => void;
  isCreateMode?: boolean;
}

const SewaNotes: React.FC<SewaNotesProps> = ({
  sewaId,
  currentNote,
  onNoteUpdated,
  isCreateMode = false,
}) => {
  const { isDark } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState(currentNote || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveNote = async () => {
    if (!note.trim()) return;

    if (isCreateMode) {
      onNoteUpdated(note);
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      const { sewaService } = await import("../../services/sewaService");
      await sewaService.updateNotes(sewaId, note);
      onNoteUpdated(note);
      setIsEditing(false);
    } catch (error) {
      console.error("Gagal menyimpan catatan:", error);
      alert(
        "Gagal menyimpan catatan: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setNote(currentNote || "");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              isDark ? "text-white" : "text-gray-700"
            }`}
          >
            Catatan Tambahan
          </label>
          <textarea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Tambahkan catatan tentang sewa ini..."
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              isDark
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            } ${
              !note.trim()
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : ""
            }`}
            disabled={isLoading}
          />
          {!note.trim() && (
            <p className="mt-1 text-sm text-red-600">
              Catatan tidak boleh kosong
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSaveNote}
            isLoading={isLoading}
            disabled={!note.trim()}
          >
            Simpan Catatan
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Batal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <h4
          className={`text-sm font-medium mb-2 ${
            isDark ? "text-white" : "text-gray-700"
          }`}
        >
          Catatan Tambahan
        </h4>
        {currentNote ? (
          <div
            className={`p-3 rounded border ${
              isDark
                ? "bg-gray-700 border-gray-600 text-gray-200"
                : "bg-gray-50 border-gray-200 text-gray-700"
            }`}
          >
            <p className="whitespace-pre-wrap">{currentNote}</p>
          </div>
        ) : (
          <p
            className={`text-sm italic ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Belum ada catatan untuk sewa ini
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
          {currentNote ? "Edit Catatan" : "Tambah Catatan"}
        </Button>

        {currentNote && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setNote("");
              if (isCreateMode) {
                onNoteUpdated("");
              } else {
                handleSaveNote();
              }
            }}
            disabled={isLoading}
          >
            Hapus Catatan
          </Button>
        )}
      </div>
    </div>
  );
};

export default SewaNotes;
