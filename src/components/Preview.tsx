// src/components/Preview.tsx

import React, { useRef, useEffect } from 'react';
import { getAllModules, getFunctionArgNames } from '../config/injectedPackages';
import { previewLogger } from '../utils/logger';


interface PreviewProps {
  code: string;
  onError: (error: Error | null) => void;
  isLoading: boolean;
  isEditorVisible: boolean;
  onToggleEditor: () => void;
}

const Preview: React.FC<PreviewProps> = ({ code, onError, isLoading, isEditorVisible, onToggleEditor }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      console.log('[Preview] ⚠️ Container 未就绪');
      return;
    }
    
    if (isLoading) {
        console.log('[Preview] ⏳ 加载中...');
        container.innerHTML = `
            <style>
                .preview-loading { display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; }
                .loading-spinner { width: 40px; height: 40px; border: 5px solid rgba(0,0, 0, 0.3); border-radius: 50%; border-top-color: #ffffff; animation: spin 1s ease-in-out infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
            </style>
            <div class="preview-loading"><div class="loading-spinner"></div></div>
        `;
        return;
    }
    
    previewLogger.process(`准备渲染 (代码长度: ${code?.length} 字符)`);
    container.innerHTML = `
      <style>
        #root { height: 100%; }
      </style>
      <div id="root"></div>
    `;

    if (code) {
      try {
        previewLogger.data('代码内容', { 代码内容: code });
        
        // 自动从配置文件获取参数名和模块
        const argNames = getFunctionArgNames();
        const modules = getAllModules();
        
        previewLogger.info('注入的包', argNames);
        
        // 将所有配置的包作为参数注入到执行环境中
        const execute = new Function(...argNames, code);
        previewLogger.process('开始执行代码...');
        execute(container, ...modules);
        previewLogger.success('代码执行完成 ✨');
        onError(null);
      } catch (e) {
        previewLogger.error('执行错误', e);
        if (e instanceof Error) {
          onError(e);
        }
      }
    } else {
      previewLogger.warning('没有代码');
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
            ref={containerRef} 
            style={{ flex: 1, width: '100%', height: '100%' }}
        ></div>
    </div>
  );
};

export default Preview;
