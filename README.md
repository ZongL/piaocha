<<<<<<< HEAD
# 医保票据解析助手 - 微信小程序开发指导

## 项目概述

医保票据解析助手是一个专业的医疗票据管理微信小程序，通过OCR技术智能识别医疗票据，提供详细的费用分析和可视化展示，帮助用户清晰了解医保支付和个人支付情况。

## 功能特色

### 🏥 智能识别
- OCR技术精准识别各类医疗票据
- 支持门诊、住院、药店等多种票据类型
- 自动提取关键信息（费用、医保支付、个人支付等）

### 📊 数据分析
- 饼图展示医保支付vs个人支付比例
- 柱状图显示各项费用明细
- 趋势线图分析费用变化
- 同期对比和智能建议

### 📱 便捷管理
- 完整的历史记录管理
- 智能搜索和多维度筛选
- 数据导出和备份功能
- 云端同步，防止数据丢失

### 🔔 智能提醒
- 费用预算提醒
- 月度分析报告
- 医保政策更新通知

## 技术架构

### 前端技术栈
- **框架**: 微信小程序原生开发
- **UI组件**: 基于WeUI和自定义组件
- **图表库**: ECharts.js
- **动画库**: Anime.js
- **样式**: Tailwind CSS

### 后端服务
- **OCR识别**: 腾讯云OCR API / 百度AI开放平台
- **数据存储**: 微信小程序云开发 / 自建服务器
- **文件存储**: 腾讯云COS / 阿里云OSS

### 数据库设计
```sql
-- 票据信息表
CREATE TABLE receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id VARCHAR(50) NOT NULL,
    hospital_name VARCHAR(200),
    receipt_no VARCHAR(100),
    total_amount DECIMAL(10,2),
    medical_payment DECIMAL(10,2),
    personal_payment DECIMAL(10,2),
    receipt_date DATE,
    receipt_type VARCHAR(20),
    items TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户信息表
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    openid VARCHAR(100) UNIQUE NOT NULL,
    nickname VARCHAR(100),
    avatar_url VARCHAR(500),
    medical_type VARCHAR(50),
    reimbursement_rate DECIMAL(5,2),
    region VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 开发指南

### 环境准备

1. **注册微信小程序账号**
   - 访问[微信公众平台](https://mp.weixin.qq.com/)
   - 注册小程序账号并完成认证
   - 获取AppID

2. **安装开发工具**
   - 下载[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
   - 安装并配置开发环境

3. **配置项目**
   - 创建新项目，填入AppID
   - 设置项目目录结构
   - 配置合法域名

### 核心功能实现

#### 1. 票据拍照识别
```javascript
// 调用相机API
wx.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: function(res) {
        const tempFilePath = res.tempFilePaths[0];
        // 上传到服务器进行OCR识别
        uploadAndRecognize(tempFilePath);
    }
});

// OCR识别函数
function uploadAndRecognize(filePath) {
    wx.uploadFile({
        url: 'https://api.example.com/ocr',
        filePath: filePath,
        name: 'image',
        success: function(res) {
            const data = JSON.parse(res.data);
            // 处理识别结果
            processOCRResult(data);
        }
    });
}
```

#### 2. 数据可视化
```javascript
// 使用ECharts绘制饼图
function initPieChart(data) {
    const chart = echarts.init(canvas, null, {
        width: canvasWidth,
        height: canvasHeight
    });
    
    const option = {
        title: {
            text: '费用构成',
            left: 'center'
        },
        series: [{
            type: 'pie',
            data: [
                {value: data.medical, name: '医保支付'},
                {value: data.personal, name: '个人支付'}
            ],
            radius: ['40%', '70%']
        }]
    };
    
    chart.setOption(option);
    return chart;
}
```

#### 3. 数据存储
```javascript
// 使用微信小程序云开发
const db = wx.cloud.database();

// 保存票据信息
function saveReceipt(data) {
    db.collection('receipts').add({
        data: {
            hospitalName: data.hospitalName,
            totalAmount: data.totalAmount,
            medicalPayment: data.medicalPayment,
            personalPayment: data.personalPayment,
            receiptDate: data.receiptDate,
            items: data.items,
            createTime: new Date()
        },
        success: function(res) {
            console.log('保存成功', res);
        }
    });
}
```

### 页面结构

```
├── pages/
│   ├── index/          # 主页 - 拍照上传
│   ├── analysis/       # 分析页 - 数据可视化
│   ├── history/        # 历史页 - 记录管理
│   └── profile/        # 个人页 - 设置管理
├── components/
│   ├── receipt-card/   # 票据卡片组件
│   ├── chart-container/# 图表容器组件
│   └── search-filter/  # 搜索筛选组件
├── utils/
│   ├── api.js         # API接口封装
│   ├── storage.js     # 本地存储管理
│   └── chart.js       # 图表相关工具
└── app.js             # 小程序主逻辑
```

## 部署指南

### 1. 配置服务器
- 准备域名和SSL证书
- 配置Nginx反向代理
- 设置数据库连接

### 2. 部署后端服务
```bash
# 安装依赖
npm install

# 启动服务
npm start

# 使用PM2守护进程
pm2 start app.js --name medical-receipt-api
```

### 3. 配置小程序
- 设置服务器域名
- 配置OCR服务API密钥
- 设置云开发环境

### 4. 上传代码
- 使用微信开发者工具上传代码
- 提交审核
- 发布上线

## 性能优化

### 1. 图片优化
- 压缩上传图片大小
- 使用WebP格式
- 实现图片懒加载

### 2. 数据优化
- 分页加载历史记录
- 缓存常用数据
- 使用索引优化查询

### 3. 用户体验
- 添加加载动画
- 实现离线功能
- 优化页面切换动画

## 安全考虑

### 1. 数据安全
- 敏感信息加密存储
- API接口权限验证
- 防止SQL注入攻击

### 2. 用户隐私
- 遵守隐私保护法规
- 明确告知数据用途
- 提供数据删除功能

### 3. 系统安全
- 定期更新依赖库
- 监控异常访问
- 备份重要数据

## 维护建议

### 1. 日常维护
- 监控服务器状态
- 定期备份数据
- 更新OCR识别模型

### 2. 功能迭代
- 收集用户反馈
- 优化识别准确率
- 增加新功能特性

### 3. 性能监控
- 监控API响应时间
- 分析用户行为数据
- 优化系统性能

## 联系方式

如有问题或建议，请联系：
- 邮箱：support@medical-receipt.com
- 微信：MedicalReceiptHelper
- 电话：400-123-4567

## 更新日志

### v1.0.0 (2024-01-15)
- 初始版本发布
- 支持医疗票据OCR识别
- 提供费用分析和可视化
- 实现历史记录管理
- 添加个人设置功能

---

**注意**: 这是一个演示版本，实际开发中需要根据具体需求进行调整和完善。
=======
# yibaocha
>>>>>>> 110d22eadcfd7bf2996707687bf8cabf3c29a45b
