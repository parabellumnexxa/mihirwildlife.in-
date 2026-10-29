'use client';

import useContentProtection from '@/hooks/useContentProtection';

export default function ClientProtectionProvider({ children }) {
  useContentProtection();
  return <>{children}</>;
}
