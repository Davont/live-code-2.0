/**
 * 配置需要注入的 npm 包
 * 
 * 添加新包只需 2 步：
 * 1. npm install 包名
 * 2. 在下面的 PACKAGES 对象中添加一行
 */

import * as React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import * as ReactIntl from 'react-intl';

// 🔧 添加新包示例：
// import _ from 'lodash';

/**
 * 包配置对象
 * key: 在用户代码中的全局变量名
 * value: { 
 *   packageName: npm 包名（用于 external），
 *   module: 导入的模块对象 
 * }
 */
export const PACKAGES = {
  // React 必须的包
  React: {
    packageName: 'react',
    module: React,
  },
  ReactDOM: {
    packageName: 'react-dom/client',
    module: ReactDOMClient,
  },
  
  // react-intl 国际化库
  ReactIntl: {
    packageName: 'react-intl',
    module: ReactIntl,
  },
  
  // 🔧 添加新包示例：取消下面的注释
  // _: {
  //   packageName: 'lodash',
  //   module: _,
  // },
} as const;

// ==================== 以下代码无需修改 ====================

// 自动生成 external 列表
export const EXTERNAL_PACKAGES = Object.values(PACKAGES).map(pkg => pkg.packageName);

// 自动生成导入声明代码
export function generateImportDeclarations(): string {
  let declarations = '// External dependencies injected via new Function arguments\n';
  const entries = Object.entries(PACKAGES);
  
  entries.forEach(([varName], index) => {
    // shadowRoot 是 arguments[0]，所以包从 index 1 开始
    declarations += `const ${varName} = arguments[${index + 1}];\n`;
  });
  
  return declarations;
}

// 自动获取所有模块对象
export function getAllModules(): unknown[] {
  return Object.values(PACKAGES).map(pkg => pkg.module);
}

// 自动生成 new Function 的参数名列表
export function getFunctionArgNames(): string[] {
  return ['shadowRoot', ...Object.keys(PACKAGES)];
}

