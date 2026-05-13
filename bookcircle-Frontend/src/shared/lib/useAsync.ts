import { useCallback, useEffect, useRef, useState, Dispatch, SetStateAction } from 'react'

interface AsyncState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
}

export const useAsync = <T>(
  asyncFn: () => Promise<T>,
  deps: unknown[] = [],
): AsyncState<T> & { refetch: (silent?: boolean) => Promise<void>; setData: Dispatch<SetStateAction<T | null>> } => {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: true,
    error: null,
  })

  const mountedRef = useRef(true)
  const asyncFnRef = useRef(asyncFn)

  useEffect(() => {
    asyncFnRef.current = asyncFn
  }, [asyncFn])

  const execute = useCallback(async (silent = false) => {
    if (!silent) {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
    }
    try {
      const result = await asyncFnRef.current()
      if (mountedRef.current) {
        setState({ data: result, isLoading: false, error: null })
      }
    } catch (error) {
      if (mountedRef.current) {
        setState({
          data: null,
          isLoading: false,
          error:
            error instanceof Error ? error.message : 'An unexpected error occurred.',
        })
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  const setData = useCallback((action: SetStateAction<T | null>) => {
      setState(prev => {
          const newData = typeof action === 'function' ? (action as any)(prev.data) : action;
          return { ...prev, data: newData };
      });
  }, []);

  useEffect(() => {
    mountedRef.current = true
    void execute()
    return () => {
      mountedRef.current = false
    }
  }, [execute])

  return { ...state, refetch: execute, setData }
}
