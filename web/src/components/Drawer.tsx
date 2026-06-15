import type { ReactNode } from 'react';

interface DrawerProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Drawer({ open, title, onClose, children }: DrawerProps) {
  if (!open) return null;
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <h3>
          {title}
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>
            ×
          </button>
        </h3>
        {children}
      </div>
    </>
  );
}
