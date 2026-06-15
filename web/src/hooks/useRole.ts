import { useMemo } from 'react';
import { useApp } from '../mocks/store';
import type { Persona } from '../types';

export function useRole() {
  const { currentPersona, setPersona, toast } = useApp();

  return useMemo(() => {
    const isBoss = currentPersona === 'boss';
    const isOp = currentPersona === 'op';
    const isFinance = currentPersona === 'finance';

    const guardWrite = (action: string) => {
      if (isOp) return true;
      toast(`「${action}」需由计调阿财执行（当前为${isBoss ? '老板' : '财务'}只读视图）`);
      return false;
    };

    return {
      persona: currentPersona,
      setPersona,
      isBoss,
      isOp,
      isFinance,
      canCreateProject: isOp,
      canEditFinance: isOp,
      canManagePartners: isOp,
      canManageTeam: isBoss,
      canManageSettings: isBoss,
      canExport: isFinance || isBoss,
      homePath: isBoss ? '/dashboard' : isOp ? '/projects' : '/finance',
      guardWrite,
    };
  }, [currentPersona, setPersona, toast]);
}

export function personaNavFilter(persona: Persona, path: string): boolean {
  const teamSettings = ['/team', '/settings'];
  if (persona === 'op' && teamSettings.includes(path)) return false;
  if (persona === 'finance' && teamSettings.includes(path)) return false;
  if (persona === 'boss' && path === '/finance') return true;
  return true;
}
