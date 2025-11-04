// src/components/Preview.tsx

import React, { useRef, useEffect } from 'react';
import * as ReactDOMClient from 'react-dom/client';


interface PreviewProps {
  code: string;
  onError: (error: Error | null) => void;
  isLoading: boolean;
  isEditorVisible: boolean;
  onToggleEditor: () => void;
}

const Preview: React.FC<PreviewProps> = ({ code, onError, isLoading, isEditorVisible, onToggleEditor }) => {
  const shadowHostRef = useRef<HTMLDivElement>(null);
  const shadowRootRef = useRef<ShadowRoot | null>(null);

  useEffect(() => {
    const shadowHost = shadowHostRef.current;
    if (shadowHost && !shadowRootRef.current) {
        shadowRootRef.current = shadowHost.attachShadow({ mode: 'open' });
    }
  }, []);

  useEffect(() => {
    const shadowRoot = shadowRootRef.current;
    if (!shadowRoot) {
      console.log('[Preview] ⚠️ ShadowRoot 未就绪');
      return;
    }
    
    if (isLoading) {
        console.log('[Preview] ⏳ 加载中...');
        shadowRoot.innerHTML = `
            <style>
                :host { display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; }
                .loading-spinner { width: 40px; height: 40px; border: 5px solid rgba(0,0, 0, 0.3); border-radius: 50%; border-top-color: #ffffff; animation: spin 1s ease-in-out infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
            </style>
            <div class="loading-spinner"></div>
        `;
        return;
    }
    
    console.log('[Preview] 🎨 准备渲染，代码长度:', code?.length);
    shadowRoot.innerHTML = `
      <style>
        :host { color: initial; } 
        #root { height: 100%; }
      </style>
      <div id="root"></div>
    `;

    if (code) {
      try {
        console.log('[Preview] 📝 代码内容:\n', code);
        console.log('[Preview] 🔍 React:', React);
        console.log('[Preview] 🔍 ReactDOM:', ReactDOMClient);
        
        // 将 React 和 ReactDOM 作为参数注入到执行环境中
        const execute = new Function('shadowRoot', 'React', 'ReactDOM', code);
        console.log('[Preview] ▶️ 开始执行代码...');
        execute(shadowRoot, React, ReactDOMClient);
        console.log('[Preview] ✅ 代码执行完成');
        onError(null);
      } catch (e) {
        console.error('[Preview] ❌ 执行错误:', e);
        if (e instanceof Error) {
          onError(e);
        }
      }
    } else {
      console.log('[Preview] ⚠️ 没有代码');
    }
  }, [code, isLoading, onError]);

  return (
    <div style={{ position: 'relative', flex: 1, display: 'flex' }}>
        <button 
            onClick={onToggleEditor} 
            style={{
                position: 'absolute', top: '10px', right: '10px', zIndex: 10,
                backgroundColor: '#444c56', color: 'white', border: '1px solid #636e7b',
                borderRadius: '4px', padding: '5px 10px', cursor: 'pointer'
            }}
        >
            {isEditorVisible ? 'Fullscreen' : 'Exit Fullscreen'}
        </button>
        <div 
            ref={shadowHostRef} 
            style={{ flex: 1, width: '100%', height: '100%' }}
        ></div>
    </div>
  );
};

export default Preview;
