var util2 = require('utils/util2.js');
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloud1-0gejdj4677e958b2',
        traceUser: true,
      })
    }

    this.globalData = {}
  },
  onShow() {
    // // 纪念日
    // util2.sortMemoryArr();

    // // 提醒事项
    // util2.sortRemindArr();

  }
 
})
