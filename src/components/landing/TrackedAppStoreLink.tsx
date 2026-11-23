'use client';

import { AppStoreLogo } from '@phosphor-icons/react';
import { trackEvent } from '@/lib/analytics';

const APP_STORE_URL = 'https://apps.apple.com/app/id6740444528';

type TrackedAppStoreLinkProps = {
  className: string;
  label: string;
  placement: 'navigation' | 'hero' | 'footer';
  iconSize?: number;
};

export function TrackedAppStoreLink({
  className,
  label,
  placement,
  iconSize = 16,
}: TrackedAppStoreLinkProps) {
  return (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => trackEvent('app_store_click', { placement })}
    >
      <AppStoreLogo size={iconSize} weight="regular" aria-hidden="true" />
      {label}
    </a>
  );
}
