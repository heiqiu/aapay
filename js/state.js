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
    editMemberAmount: '',
    // 教学引导相关状态
    tutorialSteps: [
      {
        elementId: 'activityNameInput',
        title: '第一步：输入活动名称',
        description: '首先输入活动名称，比如"聚餐费用"或"旅游支出"',
        highlight: true,
        position: 'bottom'
      },
      {
        elementId: 'addMemberBtn',
        title: '第二步：添加成员',
        description: '点击此按钮添加参与活动的成员及其支付金额',
        highlight: true,
        position: 'bottom'
      },
      {
        elementId: 'membersList',
        title: '第三步：管理成员',
        description: '在这里可以看到所有成员，可以编辑或删除成员信息',
        highlight: true,
        position: 'top'
      },
      {
        elementId: 'copyBtn',
        title: '第四步：生成方案',
        description: '当所有成员信息录入完成后，点击此按钮生成AA制结算方案',
        highlight: true,
        position: 'bottom'
      },
      {
        elementId: 'copyRecordsSection',
        title: '第五步：查看记录',
        description: '生成的方案会保存在这里，可以随时查看、复制或下载',
        highlight: true,
        position: 'top'
      }
    ],
    currentTutorialStep: 0,
    isTutorialActive: false,
    hasSeenTutorial: false
  };
}