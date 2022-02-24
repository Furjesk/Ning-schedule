Page({
  data: {
    memoryArr: [],
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
      let memoryArr = wx.getStorageSync('memoryArr');
      this.setData({
        memoryArr,
        isLogin: true
      })
    } else {
      this.setData({
        memoryArr: [],
        isLogin: false
      })
    }
  },

  handleNewRemind(e) {
    let {isLogin} = this.data;
    if (isLogin) {
      wx.navigateTo({
        url: '../newMemDay/newMemDay',
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
    let memoryArr = wx.getStorageSync('memoryArr');
    memoryArr.forEach(item => {
      if (item.isTouchMove) {
        item.isTouchMove = !item.isTouchMove;
      }
    });
    this.setData({
      memoryArr: memoryArr,
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY
    })
  },

  touchMove(e) {
    let moveX = e.changedTouches[0].clientX;
    let moveY = e.changedTouches[0].clientY;
    let indexs = e.currentTarget.dataset.index;
    let memoryArr = wx.getStorageSync('memoryArr');

    let angle = this.angle({
      X: this.data.startX,
      Y: this.data.startY
    }, {
      X: moveX,
      Y: moveY
    });

    memoryArr.forEach((item, index) => {
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
      memoryArr: memoryArr,
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
    let memoryArr = [...this.data.memoryArr];
    let userid = wx.getStorageSync('UserId')
    memoryArr.splice(id, 1);

    wx.cloud.callFunction({
      name: 'updateDbData',
      data: {
        action: 'updateMem',
        dbname: 'memoryArr',
        id: userid,
        memoryArr: memoryArr
      }
    }).catch(err=>{
      console.log(err);
    })
    wx.setStorageSync('memoryArr', memoryArr)
    this.setData({
      memoryArr
    })
  }
})