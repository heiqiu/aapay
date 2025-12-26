# 本项目由阿里云ESA提供加速、计算和保护 <img src="https://img.alicdn.com/imgextra/i3/O1CN01H1UU3i1Cti9lYtFrs_!!6000000000139-2-tps-7534-844.png">
# AA制费用结算 Web应用


这是一个用于AA制费用结算的Web应用，采用模块化架构设计，便于维护和扩展。

## 项目结构

```
esa/
├── index.html          # HTML结构文件
├── index.css           # 样式文件
├── js/                 # JavaScript模块目录
│   ├── app.js          # 主应用入口，负责初始化和事件绑定
│   ├── utils.js        # 工具函数模块（Toast提示、剪贴板操作等）
│   ├── storage.js      # 本地存储模块（localStorage操作）
│   ├── calculator.js   # 计算模块（结算计算、转账方案计算）
│   ├── renderer.js     # 渲染模块（DOM渲染相关函数）
│   ├── state.js        # 状态管理模块（应用状态定义）
│   └── elements.js     # DOM元素引用模块（获取DOM元素）
└── README.md           # 项目说明文档
```

## 模块说明

### 1. `app.js` - 主应用模块
- 应用入口文件
- 负责初始化应用
- 处理业务逻辑和事件绑定
- 协调各个模块之间的交互

### 2. `utils.js` - 工具函数模块
- `showToast()` - 显示提示消息
- `copyToClipboard()` - 复制文本到剪贴板
- `confirmDialog()` - 确认对话框

### 3. `storage.js` - 本地存储模块
- `loadRecordsFromStorage()` - 从localStorage加载记录
- `saveRecordsToStorage()` - 保存记录到localStorage

### 4. `calculator.js` - 计算模块
- `calculateSettlement()` - 计算结算信息（总金额、人均、差额）
- `calculateTransferDetails()` - 计算转账方案

### 5. `renderer.js` - 渲染模块
- `renderMembers()` - 渲染成员列表
- `renderSettlementDetails()` - 渲染结算明细
- `renderTransferDetails()` - 渲染转账明细
- `updateRecordsDisplay()` - 更新记录显示

### 6. `state.js` - 状态管理模块
- `createState()` - 创建应用状态对象

### 7. `elements.js` - DOM元素引用模块
- `getElements()` - 获取所有DOM元素引用

## 使用方法

1. 直接在浏览器中打开 `index.html` 文件
2. 或者使用本地服务器运行（推荐）：
   ```bash
   # 使用Python
   python -m http.server 8000
   
   # 使用Node.js
   npx http-server
   ```

## 功能特性

- ✅ 添加/编辑/删除成员
- ✅ 自动计算总金额和人均金额
- ✅ 计算结算明细（多付/少付）
- ✅ 计算最优转账方案
- ✅ 复制结算信息到剪贴板
- ✅ 保存和查看历史记录
- ✅ 合并多条记录

## 技术特点

- **模块化设计**：代码按功能拆分为独立模块，便于维护
- **ES6模块**：使用ES6 import/export语法
- **纯JavaScript**：无依赖，原生JavaScript实现
- **响应式设计**：适配不同屏幕尺寸
- **本地存储**：使用localStorage保存数据

## 浏览器兼容性

- Chrome/Edge (推荐)
- Firefox
- Safari
- 需要支持ES6模块的现代浏览器

