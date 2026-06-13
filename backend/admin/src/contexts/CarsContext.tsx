import { createContext, useContext, type ReactNode } from 'react';
import { useCars as useCarsHook } from '../hooks/useCars';

type CarsCtx = ReturnType<typeof useCarsHook>;

const CarsContext = createContext<CarsCtx | null>(null);

export function CarsProvider({ children }: { children: ReactNode }) {
  const value = useCarsHook();
  return <CarsContext.Provider value={value}>{children}</CarsContext.Provider>;
}

export function useCars(): CarsCtx {
  const ctx = useContext(CarsContext);
  if (!ctx) throw new Error('useCars doit être utilisé dans <CarsProvider>');
  return ctx;
}
