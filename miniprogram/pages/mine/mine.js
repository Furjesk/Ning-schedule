Page({
  data: {
    userInfo: {},
    clearBtn: false,
    clearPart: false,
    guideIndex: 0,
    isAccept: false
  },
/**
 * 清除缓存没必要
 * switch（用云数据？）
 * 已登录却无数据（刷新那里改改）
 * 
 * 扫码进我的有 guide bug √
 * 剩余天数有bug吗 √
 */
  onShow: function () {
    const userInfo = wx.getStorageSync('userInfo');
    this.setData({ userInfo });
  },
  onLoad: function () {
    // 获取 guideobj
    let guideobj = wx.getStorageSync('guideInfo');
    let guideindex = guideobj.mineGuide;
    this.setData({
      guideIndex: guideindex
    })

  },
  // 登录
  handleGetUserProfile(e) {

    wx.getUserProfile({
      desc: '正在获取',
    }).then(result => {
      wx.showLoading({
        title: '登录中',
        mask: true
      })
      // 获取用户信息
      let userInfo = result.userInfo;
      wx.setStorageSync('userInfo', userInfo);
      this.setData({ userInfo })

      let userid = wx.getStorageSync('UserId')
      // 获取纪念日数据
      wx.cloud.callFunction({
        name: 'getDbData',
        data: {
          dbname: 'memoryArr',
          id: userid,
          action: 'byid'
        }
      }).then(resm => {
        let memoryArr = resm.result.data.memarr;
        wx.setStorageSync('memoryArr', memoryArr)
        // wx.hideLoading()
      }).catch(errm => {
        console.log(errm);
        wx.hideLoading()
      })
      // 获取提醒事项数据
      wx.cloud.callFunction({
        name: 'getDbData',
        data: {
          dbname: 'remindList',
          id: userid,
          action: 'byid'
        }
      }).then(resr => {
        let remindArr = resr.result.data.remindArr;
        wx.setStorageSync('items', remindArr)
        // wx.hideLoading()
      }).catch(errr => {
        console.log(errr);
        wx.hideLoading()
      })
      // 获取计划表数据
      wx.cloud.callFunction({
        name: 'getDbData',
        data: {
          dbname: 'tableList',
          id: userid,
          action: 'byid'
        }
      }).then(rest => {
        let tableArr = rest.result.data;
        wx.setStorageSync('items0', tableArr.items0)
        wx.setStorageSync('items1', tableArr.items1)
        wx.setStorageSync('items2', tableArr.items2)
        wx.setStorageSync('items3', tableArr.items3)
        wx.setStorageSync('items4', tableArr.items4)
        wx.setStorageSync('items5', tableArr.items5)
        wx.setStorageSync('items6', tableArr.items6)
        // wx.hideLoading()
      }).catch(errt => {
        console.log(errt);
        wx.hideLoading()
      })
      wx.hideLoading()
    }).catch(error => {
      console.log("deny", error);
      wx.hideLoading()
    })

  },

  handleFeedback() {
    wx.navigateTo({
      url: '/pages/feedback/feedback',
    })
  },

  handleSetMemday() {
    wx.navigateTo({
      url: '/pages/memoryday/memoryday',
    })
  },

  handleSetTable() {
    let date = new Date();
    let week = date.getDay();
    wx.navigateTo({
      url: '/pages/table/table?cid=' + week,
    })
  },

  handleSetRemind() {
    wx.navigateTo({
      url: '/pages/reminds/reminds',
    })
  },

  handleInstrution() {
    wx.navigateTo({
     url: '/pages/instruction/instruction',
   })
 },

  // 退出登录
  handleExit() {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '退出登录后将无法享受服务，确定退出？',
      success(res) {
        if (res.confirm) {
          // 清除用户登录数据，保留（无所谓）其他缓存
          wx.removeStorageSync('userInfo');
          that.setData({
            userInfo: {}
          });
          wx.showToast({
            title: '成功',
            icon: 'success',
            duration: 1500
          })
        } else if (res.cancel) {
          // that.setData({clearBtn:false,clearPart:false});
          return
        }
      }
    })
  },
  // 清除全部缓存
  handleClearAll() {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '该操作将删除全部缓存！',
      success(res) {
        if (res.confirm) {
          let userInfo = wx.getStorageSync('userInfo');
          let openid = wx.getStorageSync('OpenId')
          let userid = wx.getStorageSync('UserId')
          // 清除所有缓存，除登录数据
          wx.clearStorageSync();
          wx.setStorageSync('userInfo', userInfo);
          wx.setStorageSync('OpenId', openid);
          wx.setStorageSync('UserId', userid);
          that.setData({
            clearBtn: false,
            clearPart: false
          });
          wx.showToast({
            title: '成功',
            icon: 'success',
            duration: 1500
          })
        } else if (res.cancel) {
          // that.setData({clearBtn:false,clearPart:false});
          return
        }
      }
    })
  },
  // 清除部分缓存
  handleClearTable() {
    wx.showModal({
      title: '提示',
      content: '将丢失计划表数据，该操作不可恢复！',
      success(res) {
        if (res.confirm) {
          // 清除计划表缓存
          wx.removeStorageSync('items0');
          wx.removeStorageSync('items1');
          wx.removeStorageSync('items2');
          wx.removeStorageSync('items3');
          wx.removeStorageSync('items4');
          wx.removeStorageSync('items5');
          wx.removeStorageSync('items6');
          wx.showToast({
            title: '成功',
            icon: 'success',
            duration: 1500
          })
        } else if (res.cancel) {
          return
        }
      }
    })
  },
  handleClearMemory() {
    wx.showModal({
      title: '提示',
      content: '将丢失纪念日数据，该操作不可恢复！',
      success(res) {
        if (res.confirm) {
          // 清除纪念日缓存
          wx.removeStorageSync('memoryArr');
          wx.showToast({
            title: '成功',
            icon: 'success',
            duration: 1500
          })
        } else if (res.cancel) {
          return
        }
      }
    })
  },
  handleClearRemind() {
    wx.showModal({
      title: '提示',
      content: '将丢失提醒事项数据，该操作不可恢复！',
      success(res) {
        if (res.confirm) {
          // 清除提醒事项缓存
          wx.removeStorageSync('items');
          wx.showToast({
            title: '成功',
            icon: 'success',
            duration: 1500
          })
        } else if (res.cancel) {
          return
        }
      }
    })
  },

  handleclear() {
    let { clearBtn, clearPart } = this.data;
    clearBtn = !clearBtn;
    if (!clearBtn) {
      clearPart = false;
    }
    this.setData({
      clearBtn,
      clearPart
    })
  },
  handleClPart() {
    let { clearPart } = this.data;
    clearPart = !clearPart;
    this.setData({
      clearPart
    })
  },

  handleNext() {
    this.setData({
      guideIndex: 1,
      clearBtn: true,
      clearPart: true
    })
  },
  handleKnow() {
    this.setData({
      guideIndex: 2,
      clearBtn: false,
      clearPart: false
    })
    // let userid = wx.getStorageSync('UserId')
    let openId = wx.getStorageSync('OpenId')
    let guideobj = wx.getStorageSync('guideInfo');
    guideobj.mineGuide = 2;
    wx.setStorageSync('guideInfo', guideobj)
    wx.cloud.callFunction({
      name: 'updateDbData',
      data: {
        action: 'updateGuide',
        dbname: 'guideInfo',
        openid: openId,
        guideObj: guideobj
      }
    }).then(res => {
      // console.log(res);
    }).catch(err => {
      console.log(err);
    })

  },
  switch_change(e) {
    let that = this;
    wx.requestSubscribeMessage({
      tmplIds: [
        '9pWtaYfUvenMmOMiG-KBVWnn9EIQnqGjPXKOX3tzQi8',
        'Dj__a5vk7cdnjfPrB2ptjZemLGwiNQi0hiD_6shT3Cg',
        'RFl3C3fwezJjZJypYG6tT99Ubk7qwPOUpY_SsxwTgAM'
      ],
      success(res) {
        if (res.RFl3C3fwezJjZJypYG6tT99Ubk7qwPOUpY_SsxwTgAM == "accept"||res.Dj__a5vk7cdnjfPrB2ptjZemLGwiNQi0hiD_6shT3Cg == "accept") {
          that.setData({
            isAccept: true
          })
        } else {
          that.setData({
            isAccept: false
          })
        }
       
      },
      fail(res) {
        console.log(res);
      }
    })

  }
})