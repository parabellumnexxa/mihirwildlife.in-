'use client';

import useContentProtection from '@/hooks/useContentProtection';

export default function ClientProtectionProvider({ children }) {
  // useContentProtection(); // Content protection & PrintScreen blocker disabled
  return <>{children}</>;
}
