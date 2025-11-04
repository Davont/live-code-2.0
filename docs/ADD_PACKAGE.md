# 如何添加 npm 包 📦

## 超简单的 2 步流程 🚀

### 示例：添加 lodash

#### 步骤 1：安装包

```bash
npm install lodash
npm install -D @types/lodash  # 如果有 TypeScript 类型定义
```

#### 步骤 2：在配置文件中添加

打开 `src/config/injectedPackages.ts`，添加 3 行代码：

```typescript
// 1. 在文件顶部导入包
import _ from 'lodash';

// 2. 在 PACKAGES 对象中添加配置
export const PACKAGES = {
  React: { ... },
  ReactDOM: { ... },
  
  // 添加这个：
  _: {
    packageName: 'lodash',
    module: _,
  },
} as const;
```

**完成！** 🎉

---

## 用户如何使用

用户在编辑器中可以直接使用全局变量：

```javascript
// lodash 示例
const { debounce, throttle } = _;

function App() {
  const handleClick = debounce(() => {
    console.log('Clicked!');
  }, 300);
  
  return <button onClick={handleClick}>Click me</button>;
}
```

```javascript
// dayjs 示例（假设你添加了 dayjs）
const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

function App() {
  return <div>当前时间: {now}</div>;
}
```

---

## 更多示例

### 添加 dayjs

```bash
npm install dayjs
```

```typescript
import dayjs from 'dayjs';

export const PACKAGES = {
  // ... 其他包
  dayjs: {
    packageName: 'dayjs',
    module: dayjs,
  },
} as const;
```

### 添加 axios

```bash
npm install axios
```

```typescript
import axios from 'axios';

export const PACKAGES = {
  // ... 其他包
  axios: {
    packageName: 'axios',
    module: axios,
  },
} as const;
```

---

## 配置说明

```typescript
export const PACKAGES = {
  变量名: {                    // ← 用户在代码中使用的全局变量名
    packageName: 'npm包名',    // ← npm 包的完整名称
    module: 导入的对象,         // ← import 导入的实际对象
  },
}
```

### 示例解释

```typescript
_: {
  packageName: 'lodash',  // npm 包名
  module: _,              // import _ from 'lodash' 的 _
}
```

- **packageName**: 告诉 esbuild 不要打包这个包
- **module**: 提供给用户代码的实际对象
- **key (_)**: 用户代码中的全局变量名

---

## 注意事项

1. **变量名要有意义**：
   - ✅ `_` (lodash)
   - ✅ `dayjs` (dayjs)
   - ✅ `axios` (axios)
   - ❌ `pkg1`, `lib1` (不清楚)

2. **避免冲突**：确保变量名不与其他包冲突

3. **TypeScript 支持**：安装对应的 `@types/xxx` 包可以获得更好的类型提示

---

## 自动化的魔法 ✨

配置文件会自动处理：
- ✅ 生成 esbuild 的 external 列表
- ✅ 生成代码注入声明
- ✅ 生成 new Function 的参数
- ✅ 传递模块对象

**你只需要修改 `PACKAGES` 对象，其他一切都自动完成！**

---

## 当前已配置的包

查看 `src/config/injectedPackages.ts` 中的 `PACKAGES` 对象。

默认包含：
- `React` - React 库
- `ReactDOM` - React DOM 渲染
