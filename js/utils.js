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
    // 获取确认对话框元素
    const modal = document.getElementById('confirmModal');
    const messageElement = document.getElementById('confirmMessage');
    const cancelBtn = document.getElementById('confirmCancelBtn');
    const confirmBtn = document.getElementById('confirmConfirmBtn');
    
    // 设置消息内容
    messageElement.textContent = message;
    
    // 显示对话框
    modal.style.display = 'flex';
    
    // 定义事件处理函数
    const handleConfirm = () => {
      closeModal();
      resolve(true);
    };
    
    const handleCancel = () => {
      closeModal();
      resolve(false);
    };
    
    const closeModal = () => {
      modal.style.display = 'none';
      // 移除事件监听器
      cancelBtn.removeEventListener('click', handleCancel);
      confirmBtn.removeEventListener('click', handleConfirm);
      // 移除ESC键监听
      document.removeEventListener('keydown', handleKeyDown);
    };
    
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleCancel();
      }
    };
    
    // 添加事件监听器
    cancelBtn.addEventListener('click', handleCancel);
    confirmBtn.addEventListener('click', handleConfirm);
    
    // ESC键关闭对话框
    document.addEventListener('keydown', handleKeyDown);
    
    // 点击遮罩层关闭对话框
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        handleCancel();
      }
    });
  });
}

