'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export function NavProgress() {
  const pathname = usePathname();
  const [state, setState] = useState<'idle' | 'running' | 'done'>('idle');
  const pathRef = useRef(pathname);
  const doneTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const a = (e.target as Element).closest('a');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) return;
      clearTimeout(doneTimer.current);
      setState('running');
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    if (pathRef.current !== pathname) {
      pathRef.current = pathname;
      setState('done');
      doneTimer.current = setTimeout(() => setState('idle'), 600);
    }
  }, [pathname]);

  if (state === 'idle') return null;

  return (
    <div className="nav-progress">
      <div className={`nav-progress-bar ${state}`} />
    </div>
  );
}
