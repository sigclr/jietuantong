import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../mocks/store';
import { useRole } from '../hooks/useRole';
import { personaLabel } from '../utils/format';
import type { Persona } from '../types';

const PERSONAS: Persona[] = ['boss', 'op', 'finance'];

export function TopBar() {
  const { search, setProjectDetailTab } = useApp();
  const { persona, setPersona } = useRole();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const results = search(query);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setRoleOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
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

  const switchPersona = (p: Persona) => {
    setPersona(p);
    setRoleOpen(false);
    const home = p === 'boss' ? '/dashboard' : p === 'op' ? '/projects' : '/finance';
    navigate(home);
  };

  return (
    <header className="topbar">
      <div className="topbar-search" ref={ref}>
        <input
          ref={searchInputRef}
          placeholder="搜索团号/合作方… (按 / 聚焦)"
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
      <div className="topbar-right">
        <span className="demo-tag">演示用</span>
        <div className="role-switcher" ref={roleRef}>
          <button type="button" className="role-switcher-btn" onClick={() => setRoleOpen(!roleOpen)}>
            {personaLabel(persona)} ▾
          </button>
          {roleOpen && (
            <div className="role-switcher-menu">
              {PERSONAS.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={p === persona ? 'active' : ''}
                  onClick={() => switchPersona(p)}
                >
                  {personaLabel(p)}
                  <small>{p === 'boss' ? '老板' : p === 'op' ? '计调' : '财务'}</small>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
