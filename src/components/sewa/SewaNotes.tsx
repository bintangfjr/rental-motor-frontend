// components/sewa/SewaNotes.tsx
import React, { useState } from "react";
import { Button } from "../ui/Button";
import { Textarea } from "../ui/Textarea"; // Import yang diperbarui

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
      <div className="space-y-3">
        <Textarea
          label="Catatan Tambahan"
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Tambahkan catatan tentang sewa ini..."
          variant="outline"
          size="md"
          loading={isLoading}
          error={!note.trim() ? "Catatan tidak boleh kosong" : undefined}
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSaveNote}
            isLoading={isLoading}
            disabled={!note.trim()}
          >
            Simpan
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
    <div className="space-y-2">
      {currentNote ? (
        <div>
          <p className="text-sm font-medium text-gray-700">Catatan:</p>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border">
            {currentNote}
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-500">Belum ada catatan</p>
      )}

      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
        {currentNote ? "Edit Catatan" : "Tambah Catatan"}
      </Button>
    </div>
  );
};

export default SewaNotes;
