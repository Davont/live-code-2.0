// src/hooks/useTranspiledBundle.ts

import { useState, useEffect, useRef } from 'react';

export function useTranspiledBundle(code: string) {
  const [bundle, setBundle] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    console.log('[Hook] 🚀 初始化 Worker');
    workerRef.current = new Worker(new URL('../workers/transpiler.worker.ts', import.meta.url), {
      type: 'module',
    });

    workerRef.current.onmessage = (event) => {
      console.log('[Hook] 📩 收到 Worker 返回的消息');
      const { code: bundledCode, error: transpileError } = event.data;
      
      // Simulate a delay to make the loading spinner visible
      setTimeout(() => {
        
      }, 1000); // 1-second delay
      setIsLoading(false); // Stop loading after the delay

        if (transpileError) {
          console.error('[Hook] ❌ 转译错误:', transpileError);
          setBundle(null);
          setError(new Error(transpileError));
        } else {
          console.log('[Hook] ✅ 设置 bundle，长度:', bundledCode?.length);
          setBundle(bundledCode);
          setError(null);
        }
    };
    
    return () => {
      console.log('[Hook] 🛑 终止 Worker');
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    // This hook is tied to `submittedCode` in App.tsx.
    // When it changes, we should start loading.
    if (code.trim()) {
      console.log('[Hook] 📤 发送代码到 Worker，代码长度:', code.length);
      setIsLoading(true); // Start loading on new code
      workerRef.current?.postMessage({ code });
    } else {
      console.log('[Hook] ⚠️ 代码为空');
      setBundle(null);
      setError(null);
      setIsLoading(false); // if there is no code, we are not loading.
    }
  }, [code]);

  return { bundle, error, isLoading };
}
