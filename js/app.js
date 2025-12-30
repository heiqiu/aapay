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
  
  // 将焦点设置到姓名输入框
  elements.newMemberName.focus();
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

  // 不隐藏弹窗，而是清空输入框，让用户可以继续添加下一个成员
  elements.newMemberName.value = '';
  elements.newMemberAmount.value = '';
  // 将焦点设置到姓名输入框，方便用户继续输入
  elements.newMemberName.focus();
  
  // 更新成员列表和结算信息
  updateSettlement();
  
  // 移除添加成员的提醒消息
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
 * 复制文本到剪贴板
 */
function copySettlementInfo() {
  const { activityName, totalAmount, averageAmount, settlementDetails, transferDetails, members } = state;
  
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
    transferDetailsText += `${item.from} 转 ${item.to}：${item.amount}元\n`;
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
    members: members, // 添加成员列表信息
    activityName: activityName || '未命名',
    totalAmount: totalAmount,
    averageAmount: averageAmount
  };

  state.copyRecords = [newRecord, ...state.copyRecords];
  saveRecordsToStorage(state.copyRecords);
  updateRecordsDisplay(state.copyRecords, elements, recopyRecord, deleteRecord, toggleRecordSelection, downloadRecord);

  // 提醒用户点击最新记录的复制按钮 - 使用按钮闪动而不是文本提醒
  setTimeout(() => {
    animateLatestRecordCopyButton();
  }, 100);
}

/**
 * 为添加成员按钮添加提示动画
 */
function animateAddButton() {
  const button = elements.addMemberBtn;
  
  // 移除可能存在的动画类
  button.classList.remove('pulse-animation');
  
  // 强制重排以确保类被移除
  void button.offsetWidth;
  
  // 添加脉冲动画类
  button.classList.add('pulse-animation');
  
  // 一段时间后移除动画类
  setTimeout(() => {
    button.classList.remove('pulse-animation');
  }, 2000);
}

/**
 * 为复制按钮添加提示动画
 */
function animateCopyButton() {
  const button = elements.copyBtn;
  
  // 移除可能存在的动画类
  button.classList.remove('pulse-animation');
  
  // 强制重排以确保类被移除
  void button.offsetWidth;
  
  // 添加脉冲动画类
  button.classList.add('pulse-animation');
  
  // 一段时间后移除动画类
  setTimeout(() => {
    button.classList.remove('pulse-animation');
  }, 2000);
}

/**
 * 为最新记录的复制按钮添加提示动画
 */
function animateLatestRecordCopyButton() {
  // 由于记录是更新后才渲染的，我们需要确保DOM已经更新
  setTimeout(() => {
    // 获取最新记录的复制按钮（第一个recopy按钮，因为记录是添加到数组开头的）
    const recopyButtons = document.querySelectorAll('.record-btn.recopy');
    if (recopyButtons.length > 0) {
      const latestButton = recopyButtons[0]; // 第一个是最新添加的
      
      // 移除可能存在的动画类
      latestButton.classList.remove('pulse-animation');
      
      // 强制重排以确保类被移除
      void latestButton.offsetWidth;
      
      // 添加脉冲动画类
      latestButton.classList.add('pulse-animation');
      
      // 一段时间后移除动画类
      setTimeout(() => {
        latestButton.classList.remove('pulse-animation');
      }, 2000);
    }
  }, 50); // 短暂延迟确保DOM已更新
}

/**
 * 删除记录
 */
function deleteRecord(id) {
  state.copyRecords = state.copyRecords.filter(record => record.id !== id);
  saveRecordsToStorage(state.copyRecords);
  updateRecordsDisplay(state.copyRecords, elements, recopyRecord, deleteRecord, toggleRecordSelection, downloadRecord);
}

/**
 * 下载记录为图片
 */
function downloadRecord(id) {
  const record = state.copyRecords.find(record => record.id === id);
  if (record) {
    // 创建一个临时的div元素用于生成图片
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = 'fit-content';
    tempDiv.style.maxWidth = '600px';
    tempDiv.style.padding = '20px';
    tempDiv.style.background = '#252525';
    tempDiv.style.borderRadius = '12px';
    tempDiv.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.color = '#ffffff';
    tempDiv.style.boxSizing = 'border-box';
    tempDiv.style.overflow = 'hidden';
    
    // 构建要显示的内容
    let contentHTML = '';
    contentHTML += `<h2 style="text-align: center; color: #07c160; margin: 0 0 15px 0; font-size: 20px;">【${record.activityName}】</h2>`;
    contentHTML += `<div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid rgba(255, 255, 255, 0.2);">`;
    contentHTML += `<div style="font-size: 16px; margin-bottom: 5px;">总金额：<span style="color: #07c160; font-weight: bold;">${record.totalAmount}元</span></div>`;
    contentHTML += `<div style="font-size: 16px;">人均：<span style="color: #07c160; font-weight: bold;">${record.averageAmount}元</span></div>`;
    contentHTML += `</div>`;
    
    contentHTML += `<div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid rgba(255, 255, 255, 0.2);">`;
    contentHTML += `<h3 style="color: #07c160; margin: 0 0 10px 0; font-size: 18px;">结算明细</h3>`;
    record.settlementDetails.forEach(item => {
      if (item.diff !== 0) {
        const type = item.diff > 0 ? '多付' : '少付';
        const color = item.diff > 0 ? '#07c160' : '#f5222d';
        contentHTML += `<div style="display: flex; justify-content: space-between; align-items: center; margin: 6px 0; padding: 14px 12px; border-radius: 8px; background: transparent; border-bottom: 1px solid rgba(255, 255, 255, 0.2); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);">`;
        contentHTML += `<span style="font-weight: 600; flex: 1; padding-right: 12px; font-size: 15px; color: #07c160; letter-spacing: 0.2px;">${item.name}</span>`;
        contentHTML += `<span style="min-width: 90px; text-align: right; font-weight: 600; padding: 4px 10px; border-radius: 6px; color: ${color}; font-weight: 700; border: 1px solid ${color === '#07c160' ? 'rgba(7, 193, 96, 0.3)' : 'rgba(245, 34, 45, 0.3)'}; background: ${color === '#07c160' ? 'rgba(7, 193, 96, 0.1)' : 'rgba(245, 34, 45, 0.1)'};">${type} ${Math.abs(item.diff)}元</span>`;
        contentHTML += `</div>`;
      }
    });
    contentHTML += `</div>`;
    
    // 计算转账详情
    const transferDetails = calculateTransferDetails(record.settlementDetails);
    if (transferDetails.length > 0) {
      contentHTML += `<div style="margin-bottom: 10px;">`;
      contentHTML += `<h3 style="color: #07c160; margin: 0 0 10px 0; font-size: 18px;">转账方案</h3>`;
      transferDetails.forEach(item => {
        contentHTML += `<div style="display: flex; justify-content: space-between; align-items: center; margin: 6px 0; padding: 14px 12px; border-radius: 8px; background: transparent; border-bottom: 1px solid rgba(255, 255, 255, 0.2); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);">`;
        contentHTML += `<span style="color: #ffffff;">${item.from}</span>`;
        contentHTML += `<span style="color: #07c160; margin: 0 12px; font-weight: 700; font-size: 18px; opacity: 0.9; text-shadow: 0 1px 2px rgba(7, 193, 96, 0.2);">转</span>`;
        contentHTML += `<span style="color: #ffffff;">${item.to}</span>`;
        contentHTML += `<span style="color: #ffffff; font-weight: 700; font-size: 16px; margin-left: auto;">${item.amount}元</span>`;
        contentHTML += `</div>`;
      });
      contentHTML += `</div>`;
    }
    
    contentHTML += `<div style="text-align: center; font-size: 14px; color: rgba(255, 255, 255, 0.7); margin-top: 15px; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.2);">生成时间: ${record.time}</div>`;
    
    tempDiv.innerHTML = contentHTML;
    document.body.appendChild(tempDiv);
    
    // 使用html2canvas将div转换为图片
    html2canvas(tempDiv, {
      backgroundColor: '#0b0e14',
      scale: 2, // 提高清晰度
      useCORS: true,
      allowTaint: true,
      width: tempDiv.scrollWidth,
      height: tempDiv.scrollHeight
    }).then(canvas => {
      // 将canvas转换为图片并下载
      const link = document.createElement('a');
      link.download = `${record.activityName}_转账方案_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      document.body.removeChild(tempDiv);
      showToastWrapper('图片已下载');
    }).catch(error => {
      console.error('生成图片失败:', error);
      document.body.removeChild(tempDiv);
      showToastWrapper('生成图片失败');
    });
  }
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
      updateRecordsDisplay(state.copyRecords, elements, recopyRecord, deleteRecord, toggleRecordSelection, downloadRecord);
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
    mergedContent += `${item.from} 转 ${item.to}：${item.amount}元\n`;
  });

  // 合并成员列表 - 取所有记录中的成员，去重
  const allMembers = new Set();
  selectedRecords.forEach(record => {
    if (record.members) {
      record.members.forEach(member => {
        allMembers.add(JSON.stringify(member));
      });
    }
  });
  const mergedMembers = Array.from(allMembers).map(str => JSON.parse(str));

  const newRecord = {
    id: Date.now(),
    time: new Date().toLocaleString(),
    content: mergedContent,
    subContent: '',
    settlementDetails: mergedSettlementDetails,
    members: mergedMembers, // 添加合并的成员列表
    activityName: '[合并]' + mergedActivityName,
    totalAmount: mergedTotalAmount,
    selected: false
  };

  state.copyRecords = [newRecord, ...state.copyRecords];
  saveRecordsToStorage(state.copyRecords);
  updateRecordsDisplay(state.copyRecords, elements, recopyRecord, deleteRecord, toggleRecordSelection, downloadRecord);
  copyToClipboardWrapper(mergedContent);
}

/**
 * 初始化应用
 */
function init() {
  // 从本地存储加载记录
  state.copyRecords = loadRecordsFromStorage();
  updateRecordsDisplay(state.copyRecords, elements, recopyRecord, deleteRecord, toggleRecordSelection, downloadRecord);
  
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

  // 清空活动名称输入框
  elements.activityNameInput.value = '';
  state.activityName = '';

  // 事件绑定
  elements.activityNameInput.addEventListener('input', (e) => {
    state.activityName = e.target.value;
    
    // 当活动名称不为空时，给添加成员按钮添加提示动画
    if (state.activityName.trim()) {
      animateAddButton();
    }
  });
  
  // 添加回车事件监听，当在活动名称输入框按回车时触发添加成员按钮
  elements.activityNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      // 触发添加成员按钮的点击事件
      elements.addMemberBtn.click();
    }
  });

  elements.addMemberBtn.addEventListener('click', showAddMemberModal);
  elements.cancelAddBtn.addEventListener('click', hideAddModal);
  elements.confirmAddBtn.addEventListener('click', addMember);
  elements.copyBtn.addEventListener('click', copySettlementInfo);
  elements.toggleRecordsBtn.addEventListener('click', toggleRecords);
  elements.clearRecordsBtn.addEventListener('click', clearRecords);
  elements.mergeBtn.addEventListener('click', mergeSelectedRecords);
  elements.cancelEditBtn.addEventListener('click', hideEditModal);
  
  // 添加键盘事件监听，实现回车切换焦点
  elements.newMemberName.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      // 按回车时将焦点切换到金额输入框
      elements.newMemberAmount.focus();
    } else if (e.key === 'Escape') {
      // 按ESC时触发取消操作
      hideAddModal();
    }
  });
  
  elements.newMemberAmount.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      // 按回车时触发添加成员
      addMember();
    } else if (e.key === 'Escape') {
      // 按ESC时触发取消操作
      hideAddModal();
    }
  });
  
  elements.confirmEditBtn.addEventListener('click', updateMember);
  
  // 转账记录弹窗事件
  elements.closeTransferModal.addEventListener('click', () => {
    elements.transferModal.style.display = 'none';
  });
  
  elements.cancelTransferBtn.addEventListener('click', () => {
    elements.transferModal.style.display = 'none';
  });
  
  elements.downloadTransferBtn.addEventListener('click', () => {
    const record = state.copyRecords.find(r => r.id === state.currentRecordId);
    if (record) {
      // 创建一个临时的div元素用于生成图片
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = 'fit-content';
      tempDiv.style.maxWidth = '600px';
      tempDiv.style.padding = '20px';
      tempDiv.style.background = '#252525';
      tempDiv.style.borderRadius = '12px';
      tempDiv.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.color = '#ffffff';
      tempDiv.style.boxSizing = 'border-box';
      tempDiv.style.overflow = 'hidden';
      
      // 构建要显示的内容
      let contentHTML = '';
      contentHTML += `<h2 style="text-align: center; color: #07c160; margin: 0 0 15px 0; font-size: 20px;">【${record.activityName}】</h2>`;
      contentHTML += `<div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid rgba(255, 255, 255, 0.2);">`;
      contentHTML += `<div style="font-size: 16px; margin-bottom: 5px;">总金额：<span style="color: #07c160; font-weight: bold;">${record.totalAmount}元</span></div>`;
      contentHTML += `<div style="font-size: 16px;">人均：<span style="color: #07c160; font-weight: bold;">${record.averageAmount}元</span></div>`;
      contentHTML += `</div>`;
      
      // 添加成员列表部分
      if (record.members && record.members.length > 0) {
        contentHTML += `<div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid rgba(255, 255, 255, 0.2);">`;
        contentHTML += `<h3 style="color: #07c160; margin: 0 0 10px 0; font-size: 18px;">成员列表</h3>`;
        record.members.forEach(member => {
          contentHTML += `<div style="display: flex; justify-content: space-between; align-items: center; margin: 6px 0; padding: 14px 12px; border-radius: 8px; background: transparent; border-bottom: 1px solid rgba(255, 255, 255, 0.2); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);">`;
          contentHTML += `<span style="font-weight: 600; flex: 1; padding-right: 12px; font-size: 15px; color: #07c160; letter-spacing: 0.2px;">${member.name}</span>`;
          contentHTML += `<span style="min-width: 90px; text-align: right; font-weight: 600; padding: 4px 10px; border-radius: 6px; color: #07c160; font-weight: 700; border: 1px solid rgba(7, 193, 96, 0.3); background: rgba(7, 193, 96, 0.1);">已付 ${member.amount}元</span>`;
          contentHTML += `</div>`;
        });
        contentHTML += `</div>`;
      }
      
      contentHTML += `<div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid rgba(255, 255, 255, 0.2);">`;
      contentHTML += `<h3 style="color: #07c160; margin: 0 0 10px 0; font-size: 18px;">结算明细</h3>`;
      record.settlementDetails.forEach(item => {
        if (item.diff !== 0) {
          const type = item.diff > 0 ? '多付' : '少付';
          const color = item.diff > 0 ? '#07c160' : '#f5222d';
          contentHTML += `<div style="display: flex; justify-content: space-between; align-items: center; margin: 6px 0; padding: 14px 12px; border-radius: 8px; background: transparent; border-bottom: 1px solid rgba(255, 255, 255, 0.2); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);">`;
          contentHTML += `<span style="font-weight: 600; flex: 1; padding-right: 12px; font-size: 15px; color: #07c160; letter-spacing: 0.2px;">${item.name}</span>`;
          contentHTML += `<span style="min-width: 90px; text-align: right; font-weight: 600; padding: 4px 10px; border-radius: 6px; color: ${color}; font-weight: 700; border: 1px solid ${color === '#07c160' ? 'rgba(7, 193, 96, 0.3)' : 'rgba(245, 34, 45, 0.3)'}; background: ${color === '#07c160' ? 'rgba(7, 193, 96, 0.1)' : 'rgba(245, 34, 45, 0.1)'};">${type} ${Math.abs(item.diff)}元</span>`;
          contentHTML += `</div>`;
        }
      });
      contentHTML += `</div>`;
      
      // 计算转账详情
      const transferDetails = calculateTransferDetails(record.settlementDetails);
      if (transferDetails.length > 0) {
        contentHTML += `<div style="margin-bottom: 10px;">`;
        contentHTML += `<h3 style="color: #07c160; margin: 0 0 10px 0; font-size: 18px;">转账方案</h3>`;
        transferDetails.forEach(item => {
          contentHTML += `<div style="display: flex; justify-content: space-between; align-items: center; margin: 6px 0; padding: 14px 12px; border-radius: 8px; background: transparent; border-bottom: 1px solid rgba(255, 255, 255, 0.2); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);">`;
          contentHTML += `<span style="color: #ffffff;">${item.from}</span>`;
          contentHTML += `<span style="color: #07c160; margin: 0 12px; font-weight: 700; font-size: 18px; opacity: 0.9; text-shadow: 0 1px 2px rgba(7, 193, 96, 0.2);">转</span>`;
          contentHTML += `<span style="color: #ffffff;">${item.to}</span>`;
          contentHTML += `<span style="color: #ffffff; font-weight: 700; font-size: 16px; margin-left: auto;">${item.amount}元</span>`;
          contentHTML += `</div>`;
        });
        contentHTML += `</div>`;
      }
      
      contentHTML += `<div style="text-align: center; font-size: 14px; color: rgba(255, 255, 255, 0.7); margin-top: 15px; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.2);">生成时间: ${record.time}</div>`;
      
      tempDiv.innerHTML = contentHTML;
      document.body.appendChild(tempDiv);
      
      // 使用html2canvas将div转换为图片
      html2canvas(tempDiv, {
        backgroundColor: '#0b0e14',
        scale: 2, // 提高清晰度
        useCORS: true,
        allowTaint: true,
        width: tempDiv.scrollWidth,
        height: tempDiv.scrollHeight
      }).then(canvas => {
        // 将canvas转换为图片并下载
        const link = document.createElement('a');
        link.download = `${record.activityName}_转账方案_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        document.body.removeChild(tempDiv);
        showToastWrapper('图片已下载');
        elements.transferModal.style.display = 'none';
      }).catch(error => {
        console.error('生成图片失败:', error);
        document.body.removeChild(tempDiv);
        showToastWrapper('生成图片失败');
      });
    }
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
  
  // 设置活动名称输入框的焦点
  elements.activityNameInput.focus();
}

// 当DOM加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

