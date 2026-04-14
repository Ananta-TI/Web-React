import React, { useState, useEffect } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import SectionCard from "../Shared/SectionCard";

export default function BehaviorTab({ id, type, isDarkMode }) {
  const [mitreData, setMitreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

useEffect(() => {
  if (type !== "file" || !id) {
    setLoading(false);
    return;
  }

  const fetchMitre = async () => {
    try {
      setLoading(true);
      setError(false);

      const res = await fetch(`/api/vt/files/${id}/behaviour_mitre_trees`);

      if (!res.ok) {
        throw new Error("Gagal mengambil data MITRE");
      }

      const json = await res.json();
      setMitreData(json.data || null);

    } catch (err) {
      console.error("MITRE ERROR:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  fetchMitre();
}, [id, type]);

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  if (type !== 'file') return <div className="text-center opacity-50 py-10">Analisis Behavior hanya tersedia untuk tipe File.</div>;
  if (error) return <div className="text-red-500 text-center py-10">Gagal memuat data behavior (mungkin limit API habis).</div>;

  return (
    <div className="space-y-6">
      <SectionCard title="MITRE ATT&CK Tactics" icon={ShieldAlert} isDarkMode={isDarkMode}>
        {/* Render data MITRE di sini */}
      {mitreData?.zenbox?.tactics?.length > 0 ? (
  mitreData.zenbox.tactics.map((tactic, i) => (
    <div key={i} className="mb-4 p-4 rounded bg-zinc-800">
      <h4 className="font-bold text-blue-400">
        {tactic.name} ({tactic.id})
      </h4>

      <div className="mt-2 space-y-1">
        {tactic.techniques?.map((tech, j) => (
          <div key={j} className="text-sm opacity-80">
            {tech.id} - {tech.name}
          </div>
        ))}
      </div>
    </div>
  ))
) : (
  <p className="opacity-50 text-sm">
    Tidak ada taktik serangan yang terdeteksi.
  </p>
)}
        
      </SectionCard>
    </div>
  );
}