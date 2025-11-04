// src/hooks/useTranspiledBundle.ts

import { useState, useEffect, useRef } from 'react';

export function useTranspiledBundle(code: string) {
  const [bundle, setBundle] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL('../workers/transpiler.worker.ts', import.meta.url), {
      type: 'module',
    });

    workerRef.current.onmessage = (event) => {
      const { code: bundledCode, error: transpileError } = event.data;
      
      // Simulate a delay to make the loading spinner visible
      setTimeout(() => {
        
      }, 1000); // 1-second delay
      setIsLoading(false); // Stop loading after the delay

        if (transpileError) {
          setBundle(null);
          setError(new Error(transpileError));
        } else {
          setBundle(bundledCode);
          setError(null);
        }
    };
    
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    // This hook is tied to `submittedCode` in App.tsx.
    // When it changes, we should start loading.
    if (code.trim()) {
      setIsLoading(true); // Start loading on new code
      workerRef.current?.postMessage({ code });
    } else {
      setBundle(null);
      setError(null);
      setIsLoading(false); // if there is no code, we are not loading.
    }
  }, [code]);

  return { bundle, error, isLoading };
}
