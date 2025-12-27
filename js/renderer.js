/**
 * 渲染模块
 */

/**
 * 渲染成员列表
 * @param {Array} members - 成员数组
 * @param {Array} settlementDetails - 结算明细数组
 * @param {HTMLElement} container - 容器元素
 * @param {Function} onEdit - 编辑回调
 * @param {Function} onDelete - 删除回调
 */
export function renderMembers(members, settlementDetails, container, onEdit, onDelete) {
  // 创建结算详情映射，以便快速查找
  const settlementMap = {};
  if (settlementDetails) {
    settlementDetails.forEach(item => {
      settlementMap[item.name] = item;
    });
  }
  
  container.innerHTML = members.map((member, index) => {
    const settlementInfo = settlementMap[member.name];
    const diffDisplay = settlementInfo ? `
        <span class="${settlementInfo.diff > 0 ? 'member-overpaid' : 'member-underpaid'}">
          ${settlementInfo.diff > 0 ? '多付' : '少付'}: ${Math.abs(settlementInfo.diff)}元
        </span>` : '';
    
    return `
    <div class="member-item">
      <div class="member-info">
        <span class="member-name">${member.name}</span>
        <span class="member-amount">已付${member.amount}元</span>
        ${diffDisplay}
      </div>
      <div class="member-actions">
        <button class="edit-btn" data-index="${index}">
          <img src="icons/edit3.svg" alt="修改" class="icon">
        </button>
        <button class="delete-btn" data-index="${index}">
          <img src="icons/del4.svg" alt="删除" class="icon">
        </button>
      </div>
    </div>
  `;
  }).join('');

  // 绑定事件
  container.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.getAttribute('data-index') || '0');
      onEdit(index);
    });
  });

  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.getAttribute('data-index') || '0');
      onDelete(index);
    });
  });
}

/**
 * 渲染结算明细
 * @param {Array} settlementDetails - 结算明细数组
 * @param {HTMLElement} container - 容器元素
 */
export function renderSettlementDetails(settlementDetails, container) {
  container.innerHTML = settlementDetails.map(item => `
    <div class="settlement-item">
      <span>${item.name}</span>
      <span class="${item.diff > 0 ? 'positive' : 'negative'}">
        ${item.diff > 0 ? '多付：' : '少付：'}${Math.abs(item.diff)}元
      </span>
    </div>
  `).join('');
}

/**
 * 渲染转账明细
 * @param {Array} transferDetails - 转账明细数组
 * @param {HTMLElement} container - 容器元素
 */
export function renderTransferDetails(transferDetails, container) {
  container.innerHTML = transferDetails.map(item => `
    <div class="transfer-item">
      <span>${item.from}</span>
      <span class="transfer-arrow">→</span>
      <span>${item.to}</span>
      <span class="transfer-amount">${item.amount}元</span>
    </div>
  `).join('');
}

/**
 * 更新记录显示
 * @param {Array} records - 记录数组
 * @param {Object} elements - DOM元素对象
 * @param {Function} onRecopy - 重新复制回调
 * @param {Function} onDelete - 删除回调
 * @param {Function} onToggleSelection - 切换选择回调
 */
export function updateRecordsDisplay(records, elements, onRecopy, onDelete, onToggleSelection) {
  if (records.length > 0) {
    elements.copyRecordsSection.style.display = 'block';
  } else {
    elements.copyRecordsSection.style.display = 'none';
  }

  elements.recordsContainer.innerHTML = records.map(record => `
    <div class="record-item">
      <label class="checkbox-label">
        <input type="checkbox" class="checkbox" value="${record.id}" ${record.selected ? 'checked' : ''} />
        <div class="record-info">
          <div class="record-title">
            <span class="record-name">${record.activityName}</span>
            <span class="record-amount">${record.totalAmount}元</span>
          </div>
          <span class="record-time">${record.time}</span>
        </div>
      </label>
      <div class="record-actions">
        <button class="record-btn recopy" data-id="${record.id}"><img src="icons/clear.svg" alt="复制" class="icon"></button>
        <button class="record-btn delete" data-id="${record.id}"><img src="icons/remove.svg" alt="删除" class="icon"></button>
      </div>
    </div>
  `).join('');

  // 绑定事件
  elements.recordsContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const id = parseInt(checkbox.value);
      onToggleSelection(id, checkbox.checked);
    });
  });

  elements.recordsContainer.querySelectorAll('.recopy').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.getAttribute('data-id') || '0');
      onRecopy(id);
    });
  });

  elements.recordsContainer.querySelectorAll('.delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.getAttribute('data-id') || '0');
      onDelete(id);
    });
  });
}

