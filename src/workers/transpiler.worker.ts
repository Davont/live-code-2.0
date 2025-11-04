// src/workers/transpiler.worker.ts

import * as esbuild from 'esbuild-wasm';

let esbuildInitialized = false;

const transpile = async (rawCode: string): Promise<{ code: string; error: string }> => {
  if (!esbuildInitialized) {
    await esbuild.initialize({
      wasmURL: '/esbuild.wasm',
    });
    esbuildInitialized = true;
  }

  console.log('[Worker] 🔧 开始转译代码...');
  console.log('[Worker] 📝 原始代码:', rawCode);

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
      external: ['react', 'react-dom', 'react-dom/client'],
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
    console.log('[Worker] ✅ 转译成功!');
    console.log('[Worker] 📦 打包后代码长度:', bundledCode.length);
    console.log('[Worker] 📦 打包后代码:', bundledCode);
    
    // 收集所有 React 和 ReactDOM 的导入信息
    const reactImports = {
      defaultName: null as string | null,
      namedImports: new Set<string>(),
    };
    
    const reactDOMImports = {
      defaultName: null as string | null,
      namedImports: new Set<string>(),
    };
    
    // 1. 收集所有 react 相关的 import
    const reactImportRegex = /import\s+(?:(\w+)(?:\s*,\s*)?)?(?:\{([^}]+)\})?\s*(?:\*\s+as\s+(\w+))?\s*from\s+['"]react['"]\s*;?/g;
    let match;
    while ((match = reactImportRegex.exec(bundledCode)) !== null) {
      const [, defaultImport, namedImports, namespaceImport] = match;
      
      const reactVar = defaultImport || namespaceImport;
      if (reactVar && !reactImports.defaultName) {
        reactImports.defaultName = reactVar;
      }
      
      if (namedImports) {
        namedImports.split(',').forEach((name: string) => {
          reactImports.namedImports.add(name.trim());
        });
      }
    }
    
    // 2. 收集所有 react-dom/client 相关的 import
    const reactDOMClientImportRegex = /import\s+(?:(\w+)(?:\s*,\s*)?)?(?:\{([^}]+)\})?\s*(?:\*\s+as\s+(\w+))?\s*from\s+['"]react-dom\/client['"]\s*;?/g;
    while ((match = reactDOMClientImportRegex.exec(bundledCode)) !== null) {
      const [, defaultImport, namedImports, namespaceImport] = match;
      
      const reactDOMVar = defaultImport || namespaceImport;
      if (reactDOMVar && !reactDOMImports.defaultName) {
        reactDOMImports.defaultName = reactDOMVar;
      }
      
      if (namedImports) {
        namedImports.split(',').forEach((name: string) => {
          reactDOMImports.namedImports.add(name.trim());
        });
      }
    }
    
    // 3. 收集所有 react-dom 相关的 import
    const reactDOMImportRegex = /import\s+(?:(\w+)(?:\s*,\s*)?)?(?:\{([^}]+)\})?\s*(?:\*\s+as\s+(\w+))?\s*from\s+['"]react-dom['"]\s*;?/g;
    while ((match = reactDOMImportRegex.exec(bundledCode)) !== null) {
      const [, defaultImport, namedImports, namespaceImport] = match;
      
      const reactDOMVar = defaultImport || namespaceImport;
      if (reactDOMVar && !reactDOMImports.defaultName) {
        reactDOMImports.defaultName = reactDOMVar;
      }
      
      if (namedImports) {
        namedImports.split(',').forEach((name: string) => {
          reactDOMImports.namedImports.add(name.trim());
        });
      }
    }
    
    // 调试输出收集到的导入信息
    console.log('[Worker] 📊 收集到的 React 导入:', {
      defaultName: reactImports.defaultName,
      namedImports: Array.from(reactImports.namedImports),
    });
    console.log('[Worker] 📊 收集到的 ReactDOM 导入:', {
      defaultName: reactDOMImports.defaultName,
      namedImports: Array.from(reactDOMImports.namedImports),
    });
    
    // 生成导入声明代码
    let importsDeclaration = '// External dependencies injected via new Function arguments\n';
    
    // React 声明
    if (reactImports.defaultName) {
      importsDeclaration += `const ${reactImports.defaultName} = arguments[1];\n`;
    }
    if (reactImports.namedImports.size > 0) {
      const namedList = Array.from(reactImports.namedImports).join(', ');
      importsDeclaration += `const { ${namedList} } = arguments[1];\n`;
    }
    
    // ReactDOM 声明
    if (reactDOMImports.defaultName) {
      importsDeclaration += `const ${reactDOMImports.defaultName} = arguments[2];\n`;
    }
    if (reactDOMImports.namedImports.size > 0) {
      const namedList = Array.from(reactDOMImports.namedImports).join(', ');
      importsDeclaration += `const { ${namedList} } = arguments[2];\n`;
    }
    
    console.log('[Worker] 📝 生成的导入声明:\n', importsDeclaration);
    
    // 删除所有 react 相关的 import 语句
    bundledCode = bundledCode.replace(/import\s+[^;]+from\s+['"]react['"]\s*;?\n?/g, '');
    bundledCode = bundledCode.replace(/import\s+[^;]+from\s+['"]react-dom(?:\/client)?['"]\s*;?\n?/g, '');
    
    // 在代码开头插入声明
    bundledCode = importsDeclaration + '\n' + bundledCode;
    
    // IIFE 格式会生成 var __bundle__ = ...，先执行它，然后使用 __bundle__
    bundledCode = `
${bundledCode}

// 自动渲染逻辑
console.log('[AutoRender] 🔍 __bundle__ 类型:', typeof __bundle__);
console.log('[AutoRender] 🔍 __bundle__ 内容:', __bundle__);
console.log('[AutoRender] 🔍 __bundle__ keys:', Object.keys(__bundle__ || {}));

// 尝试多种方式获取 App 组件
let AppComponent = __bundle__;

// 如果是对象，尝试获取 default 导出或直接的 App 属性
if (typeof __bundle__ === 'object') {
  console.log('[AutoRender] 📦 __bundle__ 是对象，尝试查找组件...');
  AppComponent = __bundle__.default || __bundle__.App || __bundle__;
  console.log('[AutoRender] 🔍 找到的组件:', AppComponent);
}

if (AppComponent && typeof AppComponent === 'function') {
  console.log('[AutoRender] 🎯 检测到 App 组件（函数）');
  const container = shadowRoot.getElementById('root');
  if (container) {
    console.log('[AutoRender] ✅ 找到 root 容器');
    const root = ReactDOM.createRoot(container);
    root.render(React.createElement(AppComponent));
    console.log('[AutoRender] 🎉 已渲染 App 组件');
  } else {
    console.error('[AutoRender] ❌ 未找到 root 容器');
  }
} else {
  console.warn('[AutoRender] ⚠️ 未找到有效的 App 组件', AppComponent);
}
`;
    console.log('[Worker] 🔄 最终代码:\n', bundledCode);
    
    return { code: bundledCode, error: '' };
  } catch (err) {
    console.error('[Worker] ❌ 转译失败:', err);
    if (err instanceof Error) {
      return { code: '', error: err.message };
    }
    return { code: '', error: 'An unknown transpilation error occurred.' };
  }
};


self.addEventListener('message', async (event) => {
  console.log('[Worker] 📨 收到主线程消息');
  const { code } = event.data;
  const result = await transpile(code);
  console.log('[Worker] 📤 发送结果回主线程');
  self.postMessage(result);
});
