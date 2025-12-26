/**
 * 计算模块
 */

/**
 * 计算转账方案
 * @param {Array} settlementDetails - 结算明细数组
 * @returns {Array} 转账明细数组
 */
export function calculateTransferDetails(settlementDetails) {
  const debtors = settlementDetails
    .filter(item => item.diff < 0)
    .sort((a, b) => a.diff - b.diff);
  
  const creditors = settlementDetails
    .filter(item => item.diff > 0)
    .sort((a, b) => b.diff - a.diff);

  const transferDetails = [];
  
  let debtorIndex = 0;
  let creditorIndex = 0;

  const debtorsCopy = debtors.map(d => ({ ...d }));
  const creditorsCopy = creditors.map(c => ({ ...c }));

  while (debtorIndex < debtorsCopy.length && creditorIndex < creditorsCopy.length) {
    const debtor = debtorsCopy[debtorIndex];
    const creditor = creditorsCopy[creditorIndex];
    
    const transferAmount = Math.min(Math.abs(debtor.diff), creditor.diff);
    
    if (transferAmount > 0) {
      transferDetails.push({
        from: debtor.name,
        to: creditor.name,
        amount: Number(transferAmount.toFixed(2))
      });
    }

    debtor.diff = Number((debtor.diff + transferAmount).toFixed(2));
    creditor.diff = Number((creditor.diff - transferAmount).toFixed(2));

    if (Math.abs(debtor.diff) < 0.01) debtorIndex++;
    if (Math.abs(creditor.diff) < 0.01) creditorIndex++;
  }

  return transferDetails;
}

/**
 * 计算结算信息
 * @param {Array} members - 成员数组
 * @returns {Object} 结算结果
 */
export function calculateSettlement(members) {
  const totalAmount = members.reduce((sum, member) => sum + Number(member.amount), 0);
  const averageAmount = members.length > 0 ? 
    Number((totalAmount / members.length).toFixed(2)) : 0;

  const settlementDetails = members.map(member => {
    const diff = Number((Number(member.amount) - averageAmount).toFixed(2));
    return {
      name: member.name,
      diff: diff
    };
  });

  const transferDetails = calculateTransferDetails(settlementDetails);

  return {
    totalAmount: Number(totalAmount.toFixed(2)),
    averageAmount: Number(averageAmount.toFixed(2)),
    settlementDetails,
    transferDetails
  };
}

