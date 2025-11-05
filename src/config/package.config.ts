/**
 * 配置需要注入的 npm 包的纯数据部分
 * 
 * 这个文件不应该导入任何实际的 npm 包模块，
 * 以确保它可以在没有 DOM 环境（如 Web Worker 的构建过程）中被安全地导入。
 */

export const PACKAGES_CONFIG = {
  // React 必须的包
  React: {
    packageName: 'react',
  },
  ReactDOM: {
    packageName: 'react-dom/client',
  },
  
  // react-intl 国际化库
  ReactIntl: {
    packageName: 'react-intl',
  },
  
  // 🔧 添加新包示例：
  // _: {
  //   packageName: 'lodash',
  // },
} as const;

// ==================== 以下代码无需修改 ====================

// 自动生成 external 列表
export const EXTERNAL_PACKAGES = Object.values(PACKAGES_CONFIG).map(pkg => pkg.packageName);
