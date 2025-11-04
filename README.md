# Live Code 2.0 🚀

一个现代化的在线 React 代码编辑器，支持实时预览和自动渲染。

## ✨ 特性

- 📝 **实时代码编辑** - 使用语法高亮的代码编辑器
- ⚡ **即时预览** - 代码更改即时生效
- 🎯 **自动渲染** - 无需手动调用 ReactDOM.render
- 🔧 **Web Worker 编译** - 使用 esbuild-wasm 在浏览器中编译代码
- 📦 **双模式包管理** - 支持内置包和 CDN 动态加载
- 🎨 **Shadow DOM 隔离** - 预览环境完全隔离
- 🌐 **零配置** - 开箱即用

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 📖 用户使用指南

### 基础用法

用户只需编写 React 组件函数，无需导入和渲染代码：

```javascript
const { useState } = React;

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Hello from Live Code!</h1>
      <button onClick={() => setCount(c => c + 1)}>
        点击次数: {count}
      </button>
    </div>
  );
}
```

### 使用 npm 包

所有配置好的包都可以作为全局变量直接使用：

```javascript
// 使用 React
const { useState, useEffect } = React;

// 使用 lodash（如果已配置）
const { debounce } = _;

function App() {
  const [count, setCount] = useState(0);
  
  const handleClick = debounce(() => {
    setCount(c => c + 1);
  }, 300);
  
  return <button onClick={handleClick}>点击: {count}</button>;
}
```

## 🛠️ 开发者指南

### 添加新的 npm 包（超简单！）

只需 **2 步**：

#### 1. 安装包
```bash
npm install lodash
npm install -D @types/lodash
```

#### 2. 配置包

打开 `src/config/injectedPackages.ts`，添加：

```typescript
import _ from 'lodash';

export const PACKAGES = {
  // ... 现有包
  _: {
    packageName: 'lodash',
    module: _,
  },
}
```

**完成！** 🎉 详细说明见 [如何添加 npm 包](./docs/ADD_PACKAGE.md)

### 项目结构

```
live-code-2.0/
├── src/
│   ├── components/       # React 组件
│   │   ├── CodeEditor.tsx    # 代码编辑器
│   │   ├── Preview.tsx       # 预览组件
│   │   └── ErrorDisplay.tsx  # 错误显示
│   ├── hooks/           # 自定义 Hooks
│   │   └── useTranspiledBundle.ts  # 代码转译 Hook
│   ├── workers/         # Web Workers
│   │   └── transpiler.worker.ts    # esbuild 转译 Worker
│   ├── config/          # 配置文件
│   │   └── injectedPackages.ts     # 内置包配置
│   ├── App.tsx          # 主应用组件
│   └── main.tsx         # 入口文件
├── public/
│   └── esbuild.wasm     # esbuild WebAssembly 文件
├── docs/                # 文档
│   └── ADD_PACKAGE.md   # 添加包的指南
└── package.json
```

### 核心技术

- **React 19** - UI 框架
- **esbuild-wasm** - 浏览器端代码转译和打包
- **Web Workers** - 后台编译，不阻塞主线程
- **Shadow DOM** - 预览环境隔离
- **react-simple-code-editor** - 代码编辑器
- **Prism.js** - 语法高亮
- **Vite** - 开发和构建工具

### 工作原理

1. **用户编辑代码** → CodeEditor 组件
2. **点击 Run** → 代码发送到 Web Worker
3. **Worker 转译** → 使用 esbuild-wasm 打包
   - 配置的包标记为 external（不打包）
   - 从用户代码中删除 import 语句
4. **注入依赖** → 通过 `new Function` 的 arguments 注入所有配置的包
5. **自动渲染** → 在代码末尾自动添加渲染逻辑
6. **Preview 显示** → 在 Shadow DOM 中渲染结果

## 📝 配置

### 添加/修改包

只需编辑 `src/config/injectedPackages.ts`：

```typescript
import _ from 'lodash';

export const PACKAGES = {
  React: {
    packageName: 'react',
    module: React,
  },
  ReactDOM: {
    packageName: 'react-dom/client',
    module: ReactDOMClient,
  },
  _: {
    packageName: 'lodash',
    module: _,
  },
  // 添加更多包...
} as const;
```

**所有其他配置（external、注入等）都会自动生成！**

## 🔍 调试

代码中保留了详细的 console.log，可以在浏览器控制台查看：

- `[Worker] 🔧` - Worker 转译过程
- `[Hook] 📤` - 数据传递
- `[Preview] 🎨` - 预览渲染
- `[AutoRender] 🎯` - 自动渲染逻辑

## 📄 License

MIT

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

---

Made with ❤️ by zhanghanyu
