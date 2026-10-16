import { useEffect, useState } from 'react';
import { demoRepository } from '../infrastructure/demo-repository.ts';
interface Resource<T> { data: T | null; loading: boolean; error: string | null; refresh: () => void }
/** Consulta mock reativa; mantém uma fronteira substituível por TanStack Query quando houver API real. */
export function useDemoResource<T>(fetcher: () => Promise<T>): Resource<T> {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<Omit<Resource<T>, 'refresh'>>({ data: null, loading: true, error: null });
  useEffect(() => demoRepository.subscribe(() => setRevision(v => v + 1)), []);
  useEffect(() => {
    let active = true; setState(s => ({ ...s, loading: s.data === null, error: null }));
    void fetcher().then(data => { if (active) setState({ data, loading: false, error: null }); }).catch((err: unknown) => {
      if (active) setState(s => ({ ...s, loading: false, error: err instanceof Error ? err.message : String(err) }));    
});
    return () => { active = false; };
    // Fetcher is a stable module gateway method at call sites; repository changes trigger revision.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revision]);
  return { ...state, refresh: () => setRevision(v => v + 1) };
}
