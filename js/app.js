/**
 * 主应用模块
 */

import { showToast, copyToClipboard, confirmDialog } from './utils.js';
import { loadRecordsFromStorage, saveRecordsToStorage } from './storage.js';
import { calculateSettlement, calculateTransferDetails } from './calculator.js';
import { renderMembers, renderSettlementDetails, renderTransferDetails, updateRecordsDisplay } from './renderer.js';
import { createState } from './state.js';
import { getElements } from './elements.js';

// 应用状态
const state = createState();

// DOM元素
const elements = getElements();

// 工具函数包装
const showToastWrapper = (message) => showToast(message, elements.toast);
const copyToClipboardWrapper = (text) => copyToClipboard(text, showToastWrapper);

/**
 * 显示添加成员弹窗
 */
function showAddMemberModal() {
  // 检查活动名称是否已填写
  const activityName = elements.activityNameInput.value.trim();
  if (!activityName) {
    showToastWrapper('请先填写活动名称');
    return;
  }
  
  state.showModal = true;
  state.newMemberName = '';
  state.newMemberAmount = '';
  elements.newMemberName.value = '';
  elements.newMemberAmount.value = '';
  elements.addModal.style.display = 'flex';
}

/**
 * 隐藏添加成员弹窗
 */
function hideAddModal() {
  state.showModal = false;
  elements.addModal.style.display = 'none';
}

/**
 * 添加成员
 */
function addMember() {
  const name = elements.newMemberName.value.trim();
  const amountStr = elements.newMemberAmount.value.trim();

  if (!name || !amountStr) {
    showToastWrapper('请填写完整信息');
    return;
  }

  const amount = Number(parseFloat(amountStr).toFixed(2));
  if (isNaN(amount) || amount < 0) {
    showToastWrapper('请输入有效金额');
    return;
  }

  state.members.push({
    name: name,
    amount: amount
  });

  hideAddModal();
  updateSettlement();
}

/**
 * 删除成员
 */
function deleteMember(index) {
  state.members.splice(index, 1);
  updateSettlement();
}

/**
 * 显示编辑成员弹窗
 */
function showEditModal(index) {
  const member = state.members[index];
  state.showEditModal = true;
  state.editingIndex = index;
  state.editMemberName = member.name;
  state.editMemberAmount = member.amount.toString();
  elements.editMemberName.value = member.name;
  elements.editMemberAmount.value = member.amount.toString();
  elements.editModal.style.display = 'flex';
}

/**
 * 隐藏编辑成员弹窗
 */
function hideEditModal() {
  state.showEditModal = false;
  elements.editModal.style.display = 'none';
}

/**
 * 更新成员
 */
function updateMember() {
  const name = elements.editMemberName.value.trim();
  const amountStr = elements.editMemberAmount.value.trim();

  if (!name || !amountStr) {
    showToastWrapper('请填写完整信息');
    return;
  }

  const amount = Number(parseFloat(amountStr).toFixed(2));
  if (isNaN(amount) || amount < 0) {
    showToastWrapper('请输入有效金额');
    return;
  }

  state.members[state.editingIndex] = {
    name: name,
    amount: amount
  };

  hideEditModal();
  updateSettlement();
}

/**
 * 更新结算信息
 */
function updateSettlement() {
  const result = calculateSettlement(state.members);
  state.totalAmount = result.totalAmount;
  state.averageAmount = result.averageAmount;
  state.settlementDetails = result.settlementDetails;
  state.transferDetails = result.transferDetails;

  // 根据是否有成员来控制金额信息的显示
  if (state.members.length > 0) {
    elements.amountInfo.style.display = 'flex';
  } else {
    elements.amountInfo.style.display = 'none';
  }

  // 更新UI
  elements.totalAmount.textContent = state.totalAmount.toString();
  elements.averageAmount.textContent = state.averageAmount.toString();
  // renderSettlementDetails(state.settlementDetails, elements.settlementDetails);
  // 同时更新成员列表，显示多付少付信息
  renderMembers(state.members, state.settlementDetails, elements.membersList, showEditModal, deleteMember);
}

/**
 * 复制结算信息
 */
function copySettlementInfo() {
  const { activityName, totalAmount, averageAmount, settlementDetails, transferDetails } = state;
  
  let text = '';
  let subText = '';
  let settlementDetailsText = '';
  let transferDetailsText = '';
  
  if (activityName) {
    text += `【${activityName}】\n`;
  }

  text += `总金额：${totalAmount}元\n`;
  text += `每人应付：${averageAmount}元\n\n`;
  
  settlementDetailsText += `【结算明细】\n`;
  settlementDetails.forEach(item => {
    const type = item.diff > 0 ? '多付' : '少付';
    settlementDetailsText += `${item.name}：${type} ${Math.abs(item.diff)}元\n`;
  });
  
  text += settlementDetailsText;
  subText = text;

  transferDetailsText += `\n【转账方案】\n`;
  transferDetails.forEach(item => {
    transferDetailsText += `${item.from} → ${item.to}：${item.amount}元\n`;
  });

  text += transferDetailsText;

  const now = new Date();
  const timeStr = `${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  const newRecord = {
    id: Date.now(),
    time: timeStr,
    content: text,
    subContent: subText,
    settlementDetails: settlementDetails,
    activityName: activityName || '未命名',
    totalAmount: totalAmount
  };

  state.copyRecords = [newRecord, ...state.copyRecords];
  saveRecordsToStorage(state.copyRecords);
  updateRecordsDisplay(state.copyRecords, elements, recopyRecord, deleteRecord, toggleRecordSelection);

  copyToClipboardWrapper(text);
}

/**
 * 删除记录
 */
function deleteRecord(id) {
  state.copyRecords = state.copyRecords.filter(record => record.id !== id);
  saveRecordsToStorage(state.copyRecords);
  updateRecordsDisplay(state.copyRecords, elements, recopyRecord, deleteRecord, toggleRecordSelection);
}

/**
 * 重新复制记录 - 显示转账记录弹窗
 */
function recopyRecord(id) {
  const record = state.copyRecords.find(record => record.id === id);
  if (record) {
    // 计算并渲染转账详情到弹窗
    const transferDetails = calculateTransferDetails(record.settlementDetails);
    renderTransferDetails(transferDetails, elements.transferDetailsModal);
    
    // 显示转账记录弹窗
    elements.transferModal.style.display = 'flex';
    
    // 存储当前记录ID，用于复制按钮
    state.currentRecordId = id;
  }
}

/**
 * 切换记录选择
 */
function toggleRecordSelection(id, checked) {
  const record = state.copyRecords.find(r => r.id === id);
  if (record) {
    record.selected = checked;
  }
}

/**
 * 切换记录列表显示
 */
function toggleRecords() {
  state.showRecords = !state.showRecords;
  elements.recordsList.style.display = state.showRecords ? 'block' : 'none';
  
  // 更新箭头方向
  const toggleIcon = elements.toggleRecordsBtn.querySelector('.toggle-icon');
  if (toggleIcon) {
    if (state.showRecords) {
      toggleIcon.classList.add('expanded');
    } else {
      toggleIcon.classList.remove('expanded');
    }
  }
}

/**
 * 清空记录
 */
function clearRecords() {
  confirmDialog('是否清空所有记录？').then(confirmed => {
    if (confirmed) {
      state.copyRecords = [];
      saveRecordsToStorage(state.copyRecords);
      updateRecordsDisplay(state.copyRecords, elements, recopyRecord, deleteRecord, toggleRecordSelection);
      showToastWrapper('已清空记录');
    }
  });
}

/**
 * 合并选中的记录
 */
function mergeSelectedRecords() {
  const selectedRecords = state.copyRecords.filter(record => record.selected);
 
  if (selectedRecords.filter(r => r.activityName.indexOf("[合并]") !== -1).length > 0) {
    showToastWrapper('已经合并过的记录无法再次合并');
    return;
  }

  if (selectedRecords.length < 2) {
    showToastWrapper('请选择至少两条记录进行合并');
    return;
  }

  const mergedActivityName = selectedRecords.map(record => record.activityName).join('+');
  let mergedContent = selectedRecords.map(record => record.subContent).join('\n\n');
  const mergedTotalAmount = selectedRecords.reduce((sum, record) => sum + record.totalAmount, 0);

  const detailsMap = new Map();
  selectedRecords.forEach(record => {
    record.settlementDetails.forEach(detail => {
      const existing = detailsMap.get(detail.name) || 0;
      detailsMap.set(detail.name, existing + detail.diff);
    });
  });

  const mergedSettlementDetails = Array.from(detailsMap, ([name, diff]) => ({ name, diff: Number(diff.toFixed(2)) }));
  const mergedTransferDetails = calculateTransferDetails(mergedSettlementDetails);

  mergedContent += `\n【合并结算明细】\n`;
  mergedSettlementDetails.forEach(item => {
    const type = item.diff > 0 ? '多付' : '少付';
    mergedContent += `${item.name}：${type} ${Math.abs(item.diff)}元\n`;
  });

  mergedContent += `\n【合并转账方案】\n`;
  mergedTransferDetails.forEach(item => {
    mergedContent += `${item.from} → ${item.to}：${item.amount}元\n`;
  });

  const newRecord = {
    id: Date.now(),
    time: new Date().toLocaleString(),
    content: mergedContent,
    subContent: '',
    settlementDetails: mergedSettlementDetails,
    activityName: '[合并]' + mergedActivityName,
    totalAmount: mergedTotalAmount,
    selected: false
  };

  state.copyRecords = [newRecord, ...state.copyRecords];
  saveRecordsToStorage(state.copyRecords);
  updateRecordsDisplay(state.copyRecords, elements, recopyRecord, deleteRecord, toggleRecordSelection);
  copyToClipboardWrapper(mergedContent);
}

/**
 * 初始化应用
 */
function init() {
  // 从本地存储加载记录
  state.copyRecords = loadRecordsFromStorage();
  updateRecordsDisplay(state.copyRecords, elements, recopyRecord, deleteRecord, toggleRecordSelection);
  
  // 设置记录列表的初始显示状态
  elements.recordsList.style.display = state.showRecords ? 'block' : 'none';
  
  // 设置初始箭头方向
  const toggleIcon = elements.toggleRecordsBtn.querySelector('.toggle-icon');
  if (toggleIcon) {
    if (state.showRecords) {
      toggleIcon.classList.add('expanded');
    } else {
      toggleIcon.classList.remove('expanded');
    }
  }

  // 事件绑定
  elements.activityNameInput.addEventListener('input', (e) => {
    state.activityName = e.target.value;
  });

  elements.addMemberBtn.addEventListener('click', showAddMemberModal);
  elements.cancelAddBtn.addEventListener('click', hideAddModal);
  elements.confirmAddBtn.addEventListener('click', addMember);
  elements.cancelEditBtn.addEventListener('click', hideEditModal);
  elements.confirmEditBtn.addEventListener('click', updateMember);
  elements.copyBtn.addEventListener('click', copySettlementInfo);
  elements.toggleRecordsBtn.addEventListener('click', toggleRecords);
  elements.clearRecordsBtn.addEventListener('click', clearRecords);
  elements.mergeBtn.addEventListener('click', mergeSelectedRecords);
  
  // 转账记录弹窗事件
  elements.closeTransferModal.addEventListener('click', () => {
    elements.transferModal.style.display = 'none';
  });
  
  elements.cancelTransferBtn.addEventListener('click', () => {
    elements.transferModal.style.display = 'none';
  });
  
  elements.copyTransferBtn.addEventListener('click', () => {
    const record = state.copyRecords.find(r => r.id === state.currentRecordId);
    if (record) {
      copyToClipboardWrapper(record.content);
      elements.transferModal.style.display = 'none';
    }
  });
  
  // 确认对话框事件
  elements.confirmCancelBtn.addEventListener('click', () => {
    elements.confirmModal.style.display = 'none';
  });
  
  elements.confirmConfirmBtn.addEventListener('click', () => {
    elements.confirmModal.style.display = 'none';
  });
  
  // 点击模态框外部关闭
  elements.addModal.addEventListener('click', (e) => {
    if (e.target === elements.addModal) {
      hideAddModal();
    }
  });

  elements.editModal.addEventListener('click', (e) => {
    if (e.target === elements.editModal) {
      hideEditModal();
    }
  });
  
  elements.transferModal.addEventListener('click', (e) => {
    if (e.target === elements.transferModal) {
      elements.transferModal.style.display = 'none';
    }
  });
  
  elements.confirmModal.addEventListener('click', (e) => {
    if (e.target === elements.confirmModal) {
      elements.confirmModal.style.display = 'none';
    }
  });

  // 初始渲染
  updateSettlement();
}

// 当DOM加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

