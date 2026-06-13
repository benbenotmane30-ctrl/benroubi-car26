import { useState, useRef } from 'react';
import { useCars } from '../contexts/CarsContext';
import type { Car } from '../types';

const BACKUP_VERSION = '1.0';

export function BackupPage() {
  const { cars, replaceAll } = useCars();
  const [mode, setMode] = useState<'replace' | 'merge'>('replace');
  const [pending, setPending] = useState<{ cars: Car[]; fileName: string; size: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ─── Download ──────────────────────────────────
  const handleDownload = () => {
    if (cars.length === 0) { alert('Aucune voiture à sauvegarder.'); return; }
    const backup = {
      version: BACKUP_VERSION,
      app: 'Benroubi Car Admin',
      exportedAt: new Date().toISOString(),
      count: cars.length,
      cars,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const today = new Date().toISOString().split('T')[0];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `benroubi-backup-${today}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    alert(`Backup téléchargé (${Math.round(blob.size / 1024)} Ko).`);
  };

  // ─── Pick file ─────────────────────────────────
  const handleFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.json')) {
      alert('Fichier invalide. Sélectionnez un .json.');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!Array.isArray(data.cars)) throw new Error('Format invalide');
        setPending({ cars: data.cars, fileName: file.name, size: file.size });
      } catch {
        alert('JSON invalide ou corrompu.');
      }
    };
    reader.readAsText(file);
  };

  // ─── Restore ───────────────────────────────────
  const handleRestore = () => {
    if (!pending) return;
    const msg = mode === 'replace'
      ? `⚠️ Vous allez REMPLACER vos ${cars.length} voitures actuelles par les ${pending.cars.length} du backup.\n\nCette action est irréversible. Continuer ?`
      : `Fusionner ${pending.cars.length} voitures avec vos ${cars.length} actuelles ?`;
    if (!confirm(msg)) return;

    if (mode === 'replace') {
      replaceAll(pending.cars);
    } else {
      const merged = [...cars];
      pending.cars.forEach(inc => {
        const idx = merged.findIndex(c => c.id === inc.id);
        if (idx !== -1) merged[idx] = inc;
        else merged.push(inc);
      });
      replaceAll(merged);
    }
    setPending(null);
    if (fileRef.current) fileRef.current.value = '';
    alert(`✅ Restauration réussie.`);
  };

  const sizeStr = (b: number) => b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} Mo` : `${Math.round(b / 1024)} Ko`;

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <h2>Sauvegarde &amp; restauration</h2>
          <p className="subtitle">Téléchargez ou restaurez une sauvegarde complète du catalogue.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.2rem' }}>
        {/* Download */}
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '.9rem', marginBottom: '1rem' }}>
              <div style={{ width: 44, height: 44, background: 'rgba(201,169,110,.13)', color: 'var(--gold-dark)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.1 }}>Télécharger une sauvegarde</h3>
                <p style={{ fontSize: '.78rem', color: 'var(--gris-500)', marginTop: '.15rem' }}>Fichier .json complet (voitures + photos)</p>
              </div>
            </div>
            <div style={{ background: 'var(--gris-50)', borderRadius: 'var(--radius-sm)', padding: '.85rem 1rem', fontSize: '.78rem', color: 'var(--gris-700)', marginBottom: '1.1rem', lineHeight: 1.6 }}>
              <strong>{cars.length}</strong> voiture{cars.length > 1 ? 's' : ''} ·{' '}
              <strong>{cars.reduce((s, c) => s + (c.photos?.length ?? 0), 0)}</strong> photo(s)
            </div>
            <button className="btn btn-gold" onClick={handleDownload} style={{ width: '100%' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              Télécharger la sauvegarde
            </button>
          </div>
        </div>

        {/* Restore */}
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '.9rem', marginBottom: '1rem' }}>
              <div style={{ width: 44, height: 44, background: 'rgba(59,130,246,.12)', color: '#1D4ED8', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.1 }}>Restaurer une sauvegarde</h3>
                <p style={{ fontSize: '.78rem', color: 'var(--gris-500)', marginTop: '.15rem' }}>Importer un fichier .json</p>
              </div>
            </div>

            <label className="photo-upload" style={{ display: 'block', padding: '1.2rem 1rem', marginBottom: '.6rem' }}>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                style={{ display: 'none' }}
                onChange={e => e.target.files && handleFile(e.target.files[0])}
              />
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              <p>{pending ? `✓ ${pending.fileName}` : 'Cliquez pour parcourir'}</p>
              <span className="hint">
                {pending
                  ? `${pending.cars.length} voiture${pending.cars.length > 1 ? 's' : ''} · ${sizeStr(pending.size)}`
                  : 'Aucun fichier sélectionné'}
              </span>
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', marginTop: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '.55rem', fontSize: '.8rem', cursor: 'pointer' }}>
                <input type="radio" checked={mode === 'replace'} onChange={() => setMode('replace')} />
                <span><strong>Remplacer</strong> toutes les voitures par celles du backup</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '.55rem', fontSize: '.8rem', cursor: 'pointer' }}>
                <input type="radio" checked={mode === 'merge'} onChange={() => setMode('merge')} />
                <span><strong>Fusionner</strong> (garde les voitures actuelles + ajoute celles du backup)</span>
              </label>
            </div>

            <button
              className="btn btn-vert"
              disabled={!pending}
              onClick={handleRestore}
              style={{ width: '100%', marginTop: '1.1rem', opacity: pending ? 1 : .5 }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
              Restaurer
            </button>
            <p style={{ fontSize: '.72rem', color: 'var(--rouge-dark)', marginTop: '.7rem', textAlign: 'center', fontStyle: 'italic' }}>
              ⚠️ Le mode "Remplacer" écrase toutes vos voitures actuelles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
