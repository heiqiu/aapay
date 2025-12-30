/**
 * 工具函数模块
 */

/**
 * 显示提示消息
 * @param {string} message - 提示消息
 * @param {HTMLElement} toastElement - Toast元素
 */
export function showToast(message, toastElement) {
  toastElement.textContent = message;
  toastElement.classList.add('show');
  
  // 清除可能存在的过渡事件监听器
  toastElement.removeEventListener('transitionend', onToastTransitionEnd);
  
  setTimeout(() => {
    toastElement.classList.remove('show');
  }, 2000);
}

// 过渡结束事件处理函数
function onToastTransitionEnd(event) {
  if (event.propertyName === 'opacity' && event.target.classList.contains('toast') && !event.target.classList.contains('show')) {
    event.target.textContent = '';
  }
}

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 * @param {Function} showToastCallback - 显示Toast的回调函数
 */
export function copyToClipboard(text, showToastCallback) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToastCallback('已复制到剪贴板');
    }).catch(() => {
      // 降级方案
      fallbackCopy(text, showToastCallback);
    });
  } else {
    // 降级方案
    fallbackCopy(text, showToastCallback);
  }
}

/**
 * 降级复制方案
 * @param {string} text - 要复制的文本
 * @param {Function} showToastCallback - 显示Toast的回调函数
 */
function fallbackCopy(text, showToastCallback) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToastCallback('已复制到剪贴板');
  } catch (err) {
    showToastCallback('复制失败');
  }
  document.body.removeChild(textarea);
}

/**
 * 确认对话框
 * @param {string} message - 确认消息
 * @returns {Promise<boolean>} 用户确认结果
 */
export function confirmDialog(message) {
  return new Promise((resolve) => {
    const result = window.confirm(message);
    resolve(result);
  });
}

