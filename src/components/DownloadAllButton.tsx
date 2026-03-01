'use client';

import { useState } from 'react';
import { DownloadSimple } from '@phosphor-icons/react';
import JSZip from 'jszip';
import { triggerBlobDownload } from '@/lib/utils';

export default function DownloadAllButton({ files }: { files: { url: string; downloadName: string }[] }) {
  const [progress, setProgress] = useState<number | null>(null);

  async function handleDownload() {
    setProgress(0);
    const zip = new JSZip();

    try {
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const res = await fetch(f.url);
        if (!res.ok) throw new Error(`Failed to fetch ${f.downloadName}`);
        const blob = await res.blob();
        zip.file(f.downloadName, blob);
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      triggerBlobDownload(zipBlob, 'firstmover-nyc-rental-listings.zip');
    } catch (err) {
      console.error('Download failed:', err);
      alert('Download failed. Please try again.');
    } finally {
      setProgress(null);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={progress !== null}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        background: '#000', color: '#fff', border: 'none',
        cursor: progress !== null ? 'default' : 'pointer',
        fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '14px',
        padding: '10px 24px', borderRadius: '8px',
        opacity: progress !== null ? 0.6 : 1,
      }}
    >
      <DownloadSimple size={18} weight="bold" />
      {progress !== null ? `Downloading… ${progress}%` : 'Download All (.zip)'}
    </button>
  );
}
