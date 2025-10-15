// 医保票据解析助手 - 小程序主逻辑
App({
  // 全局数据
  globalData: {
    userInfo: null,
    systemInfo: null,
    apiBaseUrl: 'https://api.medical-receipt.com',
    ocrProvider: 'tencent' // tencent / baidu
  },

  // 小程序初始化
  onLaunch: function () {
    console.log('App Launch');
    this.initSystemInfo();
    this.checkLoginStatus();
    this.initCloudEnvironment();
  },

  // 小程序显示
  onShow: function (options) {
    console.log('App Show', options);
  },

  // 小程序隐藏
  onHide: function () {
    console.log('App Hide');
  },

  // 错误处理
  onError: function (msg) {
    console.error('App Error', msg);
    this.reportError(msg);
  },

  // 页面不存在
  onPageNotFound: function (res) {
    console.error('Page Not Found', res);
    wx.redirectTo({
      url: '/pages/index/index'
    });
  },

  // 初始化系统信息
  initSystemInfo: function () {
    try {
      const systemInfo = wx.getSystemInfoSync();
      this.globalData.systemInfo = systemInfo;
      console.log('System Info:', systemInfo);
    } catch (e) {
      console.error('Get System Info Failed:', e);
    }
  },

  // 检查登录状态
  checkLoginStatus: function () {
    const token = wx.getStorageSync('auth_token');
    if (token) {
      this.validateToken(token);
    } else {
      this.login();
    }
  },

  // 微信登录
  login: function () {
    wx.login({
      success: (res) => {
        if (res.code) {
          this.sendLoginRequest(res.code);
        } else {
          console.error('Login Failed:', res.errMsg);
        }
      },
      fail: (err) => {
        console.error('Login Error:', err);
      }
    });
  },

  // 发送登录请求
  sendLoginRequest: function (code) {
    wx.request({
      url: `${this.globalData.apiBaseUrl}/api/auth/login`,
      method: 'POST',
      data: {
        code: code,
        provider: 'wechat'
      },
      success: (res) => {
        if (res.data.success) {
          const token = res.data.data.token;
          const userInfo = res.data.data.user;
          
          wx.setStorageSync('auth_token', token);
          this.globalData.userInfo = userInfo;
          
          console.log('Login Success:', userInfo);
        } else {
          console.error('Login Response Error:', res.data.message);
        }
      },
      fail: (err) => {
        console.error('Login Request Error:', err);
      }
    });
  },

  // 验证Token
  validateToken: function (token) {
    wx.request({
      url: `${this.globalData.apiBaseUrl}/api/auth/validate`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.success) {
          this.globalData.userInfo = res.data.data.user;
        } else {
          this.login();
        }
      },
      fail: () => {
        this.login();
      }
    });
  },

  // 初始化云开发环境
  initCloudEnvironment: function () {
    if (!wx.cloud) {
      console.error('Cloud environment not supported');
      return;
    }

    wx.cloud.init({
      env: 'medical-receipt-cloud-env',
      traceUser: true
    });

    console.log('Cloud environment initialized');
  },

  // 获取用户信息
  getUserInfo: function (callback) {
    if (this.globalData.userInfo) {
      callback(this.globalData.userInfo);
      return;
    }

    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: (res) => {
              this.globalData.userInfo = res.userInfo;
              callback(this.globalData.userInfo);
            }
          });
        } else {
          callback(null);
        }
      }
    });
  },

  // 错误上报
  reportError: function (error) {
    const errorInfo = {
      message: error,
      stack: new Error().stack,
      timestamp: new Date().toISOString(),
      userAgent: this.globalData.systemInfo ? this.globalData.systemInfo.model : 'Unknown',
      userId: this.globalData.userInfo ? this.globalData.userInfo.openId : 'Unknown'
    };

    wx.request({
      url: `${this.globalData.apiBaseUrl}/api/error/report`,
      method: 'POST',
      data: errorInfo,
      fail: (err) => {
        console.error('Error Report Failed:', err);
      }
    });
  },

  // 网络请求封装
  request: function (options) {
    const token = wx.getStorageSync('auth_token');
    
    return new Promise((resolve, reject) => {
      wx.request({
        url: options.url,
        method: options.method || 'GET',
        data: options.data || {},
        header: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          ...options.header
        },
        success: (res) => {
          if (res.statusCode === 200) {
            if (res.data.success) {
              resolve(res.data);
            } else {
              reject(new Error(res.data.message || 'Request failed'));
            }
          } else if (res.statusCode === 401) {
            // Token过期，重新登录
            this.login();
            reject(new Error('Authentication failed'));
          } else {
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },

  // 显示加载提示
  showLoading: function (title = '加载中...') {
    wx.showLoading({
      title: title,
      mask: true
    });
  },

  // 隐藏加载提示
  hideLoading: function () {
    wx.hideLoading();
  },

  // 显示成功提示
  showSuccess: function (title) {
    wx.showToast({
      title: title,
      icon: 'success',
      duration: 2000
    });
  },

  // 显示错误提示
  showError: function (title) {
    wx.showToast({
      title: title,
      icon: 'error',
      duration: 3000
    });
  },

  // 显示信息提示
  showInfo: function (title) {
    wx.showToast({
      title: title,
      icon: 'none',
      duration: 2000
    });
  }
});