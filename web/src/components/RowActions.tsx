import { useEffect, useRef, useState } from 'react';

interface RowActionsProps {
  items: { label: string; onClick: () => void; danger?: boolean }[];
}

export function RowActions({ items }: RowActionsProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="row-actions" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button type="button" className="btn-icon" onClick={() => setOpen(!open)} aria-label="更多操作">
        ⋯
      </button>
      {open && (
        <div className="row-actions-menu">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              className={item.danger ? 'danger' : ''}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
