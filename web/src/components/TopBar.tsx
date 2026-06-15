import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../mocks/store';

export function TopBar() {
  const { search, setProjectDetailTab } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const results = search(query);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const pick = (type: string, id: string) => {
    setOpen(false);
    setQuery('');
    if (type === 'project') {
      setProjectDetailTab('schedules');
      navigate(`/projects/${id}`);
    } else {
      navigate(`/partners/${id}`);
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-search" ref={ref}>
        <input
          placeholder="搜索团号/合作方…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && results[0]) {
              pick(results[0].type, results[0].id);
            }
          }}
        />
        {open && query && results.length > 0 && (
          <div className="search-dropdown">
            {results.map((r) => (
              <div key={`${r.type}-${r.id}`} className="search-item" onClick={() => pick(r.type, r.id)}>
                {r.label}
                {r.sublabel && <small>{r.sublabel}</small>}
              </div>
            ))}
          </div>
        )}
        {open && query && results.length === 0 && (
          <div className="search-dropdown">
            <div className="search-item text-muted">没有找到「{query}」</div>
          </div>
        )}
      </div>
      <div className="topbar-user">马总 ▾</div>
    </header>
  );
}
