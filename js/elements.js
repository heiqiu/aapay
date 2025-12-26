/**
 * DOM元素引用模块
 */

/**
 * 获取所有DOM元素引用
 * @returns {Object} DOM元素对象
 */
export function getElements() {
  return {
    activityNameInput: document.getElementById('activityNameInput'),
    membersList: document.getElementById('membersList'),
    addMemberBtn: document.getElementById('addMemberBtn'),
    totalAmount: document.getElementById('totalAmount'),
    averageAmount: document.getElementById('averageAmount'),
    settlementDetails: document.getElementById('settlementDetails'),
    transferDetails: document.getElementById('transferDetails'),
    copyBtn: document.getElementById('copyBtn'),
    copyRecordsSection: document.getElementById('copyRecordsSection'),
    recordsList: document.getElementById('recordsList'),
    recordsContainer: document.getElementById('recordsContainer'),
    toggleRecordsBtn: document.getElementById('toggleRecordsBtn'),
    clearRecordsBtn: document.getElementById('clearRecordsBtn'),
    mergeBtn: document.getElementById('mergeBtn'),
    addModal: document.getElementById('addModal'),
    newMemberName: document.getElementById('newMemberName'),
    newMemberAmount: document.getElementById('newMemberAmount'),
    cancelAddBtn: document.getElementById('cancelAddBtn'),
    confirmAddBtn: document.getElementById('confirmAddBtn'),
    editModal: document.getElementById('editModal'),
    editMemberName: document.getElementById('editMemberName'),
    editMemberAmount: document.getElementById('editMemberAmount'),
    cancelEditBtn: document.getElementById('cancelEditBtn'),
    confirmEditBtn: document.getElementById('confirmEditBtn'),
    toast: document.getElementById('toast'),
  };
}

