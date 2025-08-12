import { useCallback, useState } from 'react'

type Toast = { id: number; type: 'success'|'error'|'info'; message: string }

export function useToast(){
  const [toasts, setToasts] = useState<Toast[]>([])
  const push = useCallback((t: Omit<Toast,'id'>) => setToasts(s => [...s, {id: Date.now(), ...t}]), [])
  const remove = useCallback((id: number) => setToasts(s => s.filter(x => x.id !== id)), [])
  return { toasts, push, remove }
}
