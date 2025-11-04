// src/utils/autoRenderLogger.ts
// 自动渲染逻辑使用的日志函数（会被注入到用户代码中执行）

/**
 * 这些日志函数会被直接注入到用户代码的执行环境中
 * 因此不能依赖外部模块，必须是纯函数
 */
export const autoRenderLoggerCode = `
// AutoRender 日志工具
const autoRenderLogger = {
  log: (msg, data) => {
    const style = 'color: #1890ff; font-weight: bold; padding: 2px 6px; border-radius: 3px; background: #e6f7ff;';
    const msgStyle = 'color: #1890ff; font-weight: 500;';
    if (data !== undefined) {
      console.groupCollapsed('%cℹ️ [AutoRender]%c ' + msg, style, msgStyle);
      console.log(data);
      console.groupEnd();
    } else {
      console.log('%cℹ️ [AutoRender]%c ' + msg, style, msgStyle);
    }
  },
  success: (msg, data) => {
    const style = 'color: #52c41a; font-weight: bold; padding: 2px 6px; border-radius: 3px; background: #f6ffed;';
    const msgStyle = 'color: #52c41a; font-weight: 500;';
    if (data !== undefined) {
      console.groupCollapsed('%c✅ [AutoRender]%c ' + msg, style, msgStyle);
      console.log(data);
      console.groupEnd();
    } else {
      console.log('%c✅ [AutoRender]%c ' + msg, style, msgStyle);
    }
  },
  error: (msg, data) => {
    const style = 'color: #f5222d; font-weight: bold; padding: 2px 6px; border-radius: 3px; background: #fff1f0;';
    const msgStyle = 'color: #f5222d; font-weight: 500;';
    if (data !== undefined) {
      console.groupCollapsed('%c❌ [AutoRender]%c ' + msg, style, msgStyle);
      console.log(data);
      console.groupEnd();
    } else {
      console.log('%c❌ [AutoRender]%c ' + msg, style, msgStyle);
    }
  },
  warning: (msg, data) => {
    const style = 'color: #faad14; font-weight: bold; padding: 2px 6px; border-radius: 3px; background: #fffbe6;';
    const msgStyle = 'color: #faad14; font-weight: 500;';
    if (data !== undefined) {
      console.groupCollapsed('%c⚠️ [AutoRender]%c ' + msg, style, msgStyle);
      console.log(data);
      console.groupEnd();
    } else {
      console.log('%c⚠️ [AutoRender]%c ' + msg, style, msgStyle);
    }
  }
};
`;

