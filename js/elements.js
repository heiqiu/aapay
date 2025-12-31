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
    transferModal: document.getElementById('transferModal'),
    transferDetailsModal: document.getElementById('transferDetailsModal'),
    closeTransferModal: document.getElementById('closeTransferModal'),
    cancelTransferBtn: document.getElementById('cancelTransferBtn'),
    downloadTransferBtn: document.getElementById('downloadTransferBtn'),
    copyTransferBtn: document.getElementById('copyTransferBtn'),
    amountInfo: document.getElementById('amountInfo'),
    toast: document.getElementById('toast'),
    confirmModal: document.getElementById('confirmModal'),
    confirmCancelBtn: document.getElementById('confirmCancelBtn'),
    confirmConfirmBtn: document.getElementById('confirmConfirmBtn'),
    // 教学引导相关元素
    tutorialOverlay: document.getElementById('tutorialOverlay'),
    tutorialStep: document.getElementById('tutorialStep'),
    tutorialText: document.getElementById('tutorialText'),
    tutorialSkipBtn: document.getElementById('tutorialSkipBtn'),
    tutorialPrevBtn: document.getElementById('tutorialPrevBtn'),
    tutorialNextBtn: document.getElementById('tutorialNextBtn'),
  };
}