// src/workers/transpiler.worker.ts

import * as esbuild from 'esbuild-wasm';
import { EXTERNAL_PACKAGES } from '../config/injectedPackages';
import { workerLogger } from '../utils/logger';
import { autoRenderLoggerCode } from '../utils/autoRenderLogger';

let esbuildInitialized = false;

const transpile = async (rawCode: string): Promise<{ code: string; error: string }> => {
  if (!esbuildInitialized) {
    await esbuild.initialize({
      wasmURL: '/esbuild.wasm',
    });
    esbuildInitialized = true;
  }

  workerLogger.process('开始转译代码');
  workerLogger.data('用户输入的原始代码', { 原始代码: rawCode });

  try {
    const result = await esbuild.build({
      entryPoints: ['index.js'],
      bundle: true,
      write: false,
      format: 'iife', // 改用 IIFE 格式，这样所有代码在一个函数作用域内
      globalName: '__bundle__', // 给一个全局名称
      define: {
        'process.env.NODE_ENV': '"production"',
      },
      external: EXTERNAL_PACKAGES, // 自动从配置文件读取
      plugins: [
        {
          name: 'cdn-resolver',
          setup(build) {
            // Rule 1: Handle the virtual entry point
            build.onResolve({ filter: /^index\.js$/ }, () => ({ path: 'index.js', namespace: 'memory-fs' }));
            
            // Rule 2: Handle remote http/https modules (from CDN)
            build.onResolve({ filter: /^https?:\/\// }, (args) => ({ path: args.path, namespace: 'http-url' }));
            
            // Rule 3: Handle relative paths within remote modules
            build.onResolve({ filter: /.*/, namespace: 'http-url' }, (args) => ({ path: new URL(args.path, args.importer).href, namespace: 'http-url' }));
            
            // Rule 4: Handle all other (bare) module imports by resolving to esm.sh
            // 这会处理所有不在 external 列表中的包
            build.onResolve({ filter: /.*/ }, (args) => {
              console.log('[Worker] 🌐 从 CDN 加载包:', args.path);
              return { path: `https://esm.sh/${args.path}`, namespace: 'http-url' };
            });

            // --- Loaders ---

            // Loader for remote modules from CDN
            build.onLoad({ filter: /.*/, namespace: 'http-url' }, async (args) => {
                const res = await fetch(args.path);
                const text = await res.text();
                const loader = args.path.endsWith('.css') ? 'css' : 'jsx';
                return { contents: text, loader };
            });

            // Loader for the virtual entry point
            build.onLoad({ filter: /.*/, namespace: 'memory-fs' }, () => ({ 
              // 在用户代码末尾导出 App 组件
              contents: rawCode + '\n\n// 导出 App 组件供外部使用\nexport default App;',
              loader: 'jsx'
            }));
          },
        },
      ],
    });
    
    let bundledCode = result.outputFiles[0].text;
    workerLogger.success(`转译成功 (${bundledCode.length} 字符)`);
    
    workerLogger.separator('断点 1: esbuild 打包后的原始代码');
    workerLogger.data('打包后原始代码', { 原始代码: bundledCode });
    
    workerLogger.info('External 包会作为 new Function 的参数名传入，代码中可以直接使用');
    
    // 删除所有 external 包的 import 语句（自动根据配置）
    workerLogger.separator('断点 2: 开始删除 import 语句');
    workerLogger.data('External 包列表', EXTERNAL_PACKAGES);
    
    EXTERNAL_PACKAGES.forEach((packageName, index) => {
      workerLogger.process(`处理第 ${index + 1}/${EXTERNAL_PACKAGES.length} 个包: ${packageName}`);
      
      // 转义特殊字符，如 '/' 和 '@'
      const escapedPackageName = packageName.replace(/[/]/g, '\\/').replace(/[@]/g, '\\@');
      const importRegex = new RegExp(`import\\s+[^;]+from\\s+['"]${escapedPackageName}['"]\\s*;?\\n?`, 'g');
      
      workerLogger.debug(`正则表达式: ${importRegex}`);
      
      // 查找匹配的 import
      const matches = bundledCode.match(importRegex);
      if (matches) {
        workerLogger.debug(`找到 ${matches.length} 个匹配`, matches);
      } else {
        workerLogger.debug('没有找到匹配的 import 语句');
      }
      
      const beforeLength = bundledCode.length;
      bundledCode = bundledCode.replace(importRegex, '');
      const afterLength = bundledCode.length;
      
      if (beforeLength !== afterLength) {
        workerLogger.success(`删除成功 (删除了 ${beforeLength - afterLength} 个字符)`);
      } else {
        workerLogger.debug('没有需要删除的内容');
      }
    });
    
    workerLogger.separator('断点 3: 删除后检查');
    const remainingImports = bundledCode.match(/import\s+[^;]+from\s+['"][^'"]+['"]/g);
    if (remainingImports) {
      workerLogger.warning('发现未删除的 import 语句', remainingImports);
    } else {
      workerLogger.success('所有 import 语句已清理完毕');
    }
    
    workerLogger.data('删除后的完整代码', { 删除后代码: bundledCode });
    
    // 不需要注入声明！new Function 的参数名就是 React, ReactDOM 等
    workerLogger.success('代码准备完毕，将通过 new Function 参数传递依赖');
    
    // IIFE 格式会生成 var __bundle__ = ...，先执行它，然后使用 __bundle__
    bundledCode = `
${bundledCode}

${autoRenderLoggerCode}

// 自动渲染逻辑
autoRenderLogger.log('检查 __bundle__ 类型: ' + typeof __bundle__);
autoRenderLogger.log('__bundle__ keys', Object.keys(__bundle__ || {}));

// 尝试多种方式获取 App 组件
let AppComponent = __bundle__;

// 如果是对象，尝试获取 default 导出或直接的 App 属性
if (typeof __bundle__ === 'object') {
  autoRenderLogger.log('__bundle__ 是对象，尝试查找组件...');
  AppComponent = __bundle__.default || __bundle__.App || __bundle__;
  autoRenderLogger.log('找到的组件', AppComponent);
}

if (AppComponent && typeof AppComponent === 'function') {
  autoRenderLogger.log('检测到 App 组件（函数）');
  const container = shadowRoot.getElementById('root');
  if (container) {
    autoRenderLogger.log('找到 root 容器');
    const root = ReactDOM.createRoot(container);
    root.render(React.createElement(AppComponent));
    autoRenderLogger.success('已渲染 App 组件 🎉');
  } else {
    autoRenderLogger.error('未找到 root 容器');
  }
} else {
  autoRenderLogger.warning('未找到有效的 App 组件', AppComponent);
}
`;
    
    workerLogger.separator('断点 4: 最终输出代码');
    workerLogger.success(`最终代码长度: ${bundledCode.length} 字符`);
    workerLogger.data('最终完整代码', { 最终代码: bundledCode });
    
    // 最后再检查一次是否有 import 语句
    const finalCheck = bundledCode.match(/import\s+[^;]+from\s+['"][^'"]+['"]/g);
    if (finalCheck) {
      workerLogger.error('致命错误！最终代码中仍包含 import 语句', finalCheck);
    }
    
    workerLogger.success('转译流程完成 ✨');
    
    return { code: bundledCode, error: '' };
  } catch (err) {
    workerLogger.error('转译失败', err);
    if (err instanceof Error) {
      return { code: '', error: err.message };
    }
    return { code: '', error: 'An unknown transpilation error occurred.' };
  }
};


self.addEventListener('message', async (event) => {
  workerLogger.info('收到主线程消息');
  const { code } = event.data;
  const result = await transpile(code);
  workerLogger.info('发送结果回主线程');
  self.postMessage(result);
});
