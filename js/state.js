/**
 * 状态管理模块
 */

/**
 * 创建应用状态
 * @returns {Object} 应用状态对象
 */
export function createState() {
  return {
    members: [],
    activityName: '',
    totalAmount: 0,
    averageAmount: 0,
    settlementDetails: [],
    transferDetails: [],
    copyRecords: [],
    currentRecordId: null,
    // 默认展开记录列表
    showRecords: true,
    showModal: false,
    showEditModal: false,
    editingIndex: -1,
    newMemberName: '',
    newMemberAmount: '',
    editMemberName: '',
    editMemberAmount: ''
  };
}