var util2 = require('../../utils/util2.js');
Page({
  data: {
    items: [],
    // 设置开始的位置
    startX: 0,
    startY: 0,
    isLogin: true
  },

  onLoad: function (options) {

  },

  onShow() {
    let localname = wx.getStorageSync('userInfo').nickName;
    if (localname) {
      let items = util2.sortRemindArr();
      this.setData({
        items,
        isLogin: true
      })
    } else {
      this.setData({
        items: [],
        isLogin: false
      })
    }
  },

  handleNewRemind() {
    let {isLogin} = this.data;
    if (isLogin) {
      wx.navigateTo({
        url: '../newRemind/newRemind',
      })
    } else {
      wx.showToast({
        title: '请先登录',
        icon: 'error',
        duration: 1000
      })
    }
  },

  // 开始滑动
  touchStart(e) {
    // console.log('touchStart=====>', e);
    // let items = [...this.data.items];

    let items = wx.getStorageSync('items');
    items.forEach(item => {
      if (item.isTouchMove) {
        item.isTouchMove = !item.isTouchMove;
      }
    });
    this.setData({
      items: items,
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY
    })
  },

  touchMove(e) {
    let moveX = e.changedTouches[0].clientX;
    let moveY = e.changedTouches[0].clientY;
    let indexs = e.currentTarget.dataset.index;
    // let items = [...this.data.items]
    let items = wx.getStorageSync('items');

    let angle = this.angle({
      X: this.data.startX,
      Y: this.data.startY
    }, {
      X: moveX,
      Y: moveY
    });

    items.forEach((item, index) => {
      item.isTouchMove = false;
      // 如果滑动的角度大于30° 则直接return；
      if (angle > 30) {
        return
      }

      if (indexs === index) {
        if (moveX > this.data.startX) { // 右滑
          item.isTouchMove = false;
        } else { // 左滑
          item.isTouchMove = true;
        }
      }
    })

    this.setData({
      items: items,
    })
  },

  /**
     * 计算滑动角度
     * @param {Object} start 起点坐标
     * @param {Object} end 终点坐标
     */
  angle: function (start, end) {
    var _X = end.X - start.X,
      _Y = end.Y - start.Y
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },

  // 删除
  delItem(e) {
    let id = e.currentTarget.dataset.id;
    let items = [...this.data.items];
    let userid = wx.getStorageSync('UserId')
    items.splice(id, 1);
    wx.cloud.callFunction({
      name: 'updateDbData',
      data: {
        action: 'updateRemind',
        dbname: 'remindList',
        id: userid,
        remindArr: items
      }
    }).catch(err=>{
      console.log(err);
    })
    wx.setStorageSync('items', items)
    this.setData({
      items
    })
  },
  // delItem(e) {
  //   let id = e.currentTarget.dataset.id;
  //   let items = [...this.data.items];
  //   let userid = wx.getStorageSync('UserId')
  //   items.splice(id, 1);

  //   wx.cloud.callFunction({
  //     name: 'updateDbData',
  //     data: {
  //       action: 'updateRemind', 
  //       dbname: 'remindList',
  //       id: userid,
  //       remindArr: items
  //     }
  //   }).catch(err=>{
  //     console.log(err);
  //   })

  //   wx.setStorageSync('items', items)
  //   this.setData({
  //     items
  //   })
  // }
})