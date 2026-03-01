'use client';

import { DownloadSimple } from '@phosphor-icons/react';
import { triggerBlobDownload } from '@/lib/utils';

export default function DownloadLink({ href, filename }: { href: string; filename: string }) {
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        fetch(href)
          .then(r => {
            if (!r.ok) throw new Error(`Failed to fetch ${filename}`);
            return r.blob();
          })
          .then(blob => triggerBlobDownload(blob, filename))
          .catch(err => {
            console.error('Download failed:', err);
            alert('Download failed. Please try again.');
          });
      }}
    >
      <DownloadSimple size={20} weight="bold" color="#000" />
    </a>
  );
}
