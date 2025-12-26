/**
 * 本地存储模块
 */

const STORAGE_KEY = 'copyRecords';

/**
 * 从本地存储加载记录
 * @returns {Array} 记录数组
 */
export function loadRecordsFromStorage() {
  try {
    const records = localStorage.getItem(STORAGE_KEY);
    if (records) {
      return JSON.parse(records);
    }
  } catch (e) {
    console.error('读取本地存储失败:', e);
  }
  return [];
}

/**
 * 保存记录到本地存储
 * @param {Array} records - 记录数组
 */
export function saveRecordsToStorage(records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('保存到本地存储失败:', e);
  }
}

