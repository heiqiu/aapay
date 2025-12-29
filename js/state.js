/**
 * 状态管理模块
 */

/**
 * 创建应用状态
 * @returns {Object} 状态对象
 */
export function createState() {
  return {
    activityName: '',
    members: [],
    showModal: false,
    newMemberName: '',
    newMemberAmount: '',
    totalAmount: 0,
    averageAmount: 0,
    settlementDetails: [],
    transferDetails: [],
    showEditModal: false,
    editMemberName: '',
    editMemberAmount: '',
    editingIndex: -1,
    copyRecords: [],
    showRecords: true,
  };
}

