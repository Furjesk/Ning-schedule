var dateTimePicker = require("../../utils/dateTimePicker.js");
var util2 = require('../../utils/util2.js');
Page({
  data: {
    memoryArr: [],
    nowScheduleArr: [],
    remindArr: [],
    monthSurplus: 0,
    yearSurplus: 0,
    memorySurplus: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let openId = "";
    let preUserNum = 0;

    wx.cloud.callFunction({
      name: 'getOpenId'
    }).then(res => {
      openId = res.result.openid
      wx.setStorageSync('OpenId', openId);
      // 通过openid找userID  res2.result.data.length == 0 | 1
      wx.cloud.callFunction({
        name: 'getDbData',
        data: {
          openid: openId,
          dbname: 'userlist',
          action: 'byseg_openid'
        }
      }).then(res2 => {
        // byname获取userlist用户数 res1.result.data.length
        wx.cloud.callFunction({
          name: 'getDbData',
          data: {
            dbname: 'userlist',
            action: 'byname'
          }
        }).then(res1 => {
          preUserNum = res1.result.data.length;
          if (res2.result.data.length == 0) {
            // 没找到 添加user记录到userlist
            wx.cloud.callFunction({
              name: 'addDbData',
              data: {
                dbname: 'userlist',
                openId: openId,
                userId: preUserNum + 1 + ""
              }
            }).catch(err5 => {
              console.log("err5", err5);
            })
            // 增加纪念日记录
            wx.cloud.callFunction({
              name: 'addDbData',
              data: {
                dbname: 'memoryArr',
                userId: preUserNum + 1 + "",
                memoryArr: [],
                openId: openId
              }
            }).catch(err6 => {
              console.log("err6", err6);
            })
            // 增加提醒事项记录
            wx.cloud.callFunction({
              name: 'addDbData',
              data: {
                dbname: 'remindList',
                userId: preUserNum + 1 + "",
                remindArr: [],
                openId: openId
              }
            }).catch(err7 => {
              console.log("err7", err7);
            })
            // 添加引导页数据
            let tempobj = {
              memGuide: 0,
              mineGuide: 0,
              remindGuide: 0,
              tableGuide: 0
            };
            wx.cloud.callFunction({
              name: 'addDbData',
              data: {
                dbname: 'guideInfo',
                userId: preUserNum + 1 + "",
                guideObj: tempobj,
                openId: openId
              }
            }).catch(err_gui => {
              console.log("err_gui", err_gui);
            })
            // 增加计划表记录..
            wx.cloud.callFunction({
              name: 'addDbData',
              data: {
                dbname: 'tableList',
                userId: preUserNum + 1 + "",
                tableArr: [],
                openId: openId
              }
            }).catch(err7 => {
              console.log("err7", err7);
            })

            wx.setStorageSync('guideInfo', tempobj);
            wx.setStorageSync('UserId', preUserNum + 1 + "");
          } else {
            // 找到了 获取guideobj
            wx.cloud.callFunction({
              name: 'getDbData',
              data: {
                openid: openId,
                dbname: 'guideInfo',
                action: 'byseg_openid'
              }
            }).then(resg => {
              // 获取 guideobj
              let guideobj = resg.result.data[0].guide;
              wx.setStorageSync('guideInfo', guideobj);
            })
            wx.setStorageSync('UserId', res2.result.data[0].userid);
          }

        }).catch(err1 => {
          console.log("err1", err1);
        })
      }).catch(err => {
        console.log("err", err);
      })
    })

    /* 剩余天数---开始 */
    var date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth()+1;
    let day = date.getDate();
    
    let now = year+"/"+month+"/"+day; // 现在时间
    let monthadd = "";
    if(month==12){
      monthadd = (year+1)+"/01/01"; // 来年1月1日
    } else {
      monthadd = year+"/"+(month+1)+"/01"; // 下个月1号的时间
    }
    let yearadd = year+"/12/31"; // 今年最后一天时间
    let monthSurplus = util2.checkDate(now,monthadd)-1;
    let yearSurplus = util2.checkDate(now,yearadd);
    this.setData({ monthSurplus, yearSurplus })
    /* 剩余天数---结束 */
  },

  onShow: function () {
    // 判断登录状态
    let localname = wx.getStorageSync('userInfo').nickName;
    if (localname) {
      // 计划 nowScheduleArr
      let nowScheduleArr = [];
      let date = new Date();
      let week = date.getDay();
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      let day = date.getDate();
      let time1, time2, timearr;

      let arrname = "items" + week;
      let tableArr = wx.getStorageSync(arrname);
      for (var i = 0; i < tableArr.length; i++) {
        if (tableArr[i].itemTime !== undefined) {
          timearr = tableArr[i].itemTime.split("-", 2);
          time1 = new Date(year + "/" + month + "/" + day + " " + timearr[0]);
          time2 = new Date(year + "/" + month + "/" + day + " " + timearr[1]);
          if (date > time1 && date < time2) {
            nowScheduleArr.push(tableArr[i]);
          }
        }
      }
      // 纪念日
      let originArr = wx.getStorageSync('memoryArr') || [];
      let memoryArr = [];
      for (var i = 0; i < originArr.length; i++) {
        if (i < 3) {
          if (!originArr[i].isOverDate)
            memoryArr.push(originArr[i]);
        } else {
          break;
        }
      }
      // 提醒事项 展示过期但未完成的
      let arr = wx.getStorageSync('items') || [];
      let remindArr = [];
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].isOverDate) {
          remindArr.push(arr[i]);
        } else if (arr[i].isPerpetual) {
          var date2 = new Date();
          let year = date2.getFullYear();
          let month = date2.getMonth() + 1;
          let day = date2.getDate();
          let time = new Date(arr[i].timeStr);
          let newTimeStr = year + "/" + month + "/" + day + " " + time.getHours() + ":" + time.getMinutes();
          if (new Date(newTimeStr) < date2) {
            remindArr.push(arr[i]);
          }
        }
      }
      util2.sortWithTime(remindArr, true);
      this.setData({
        memoryArr,
        nowScheduleArr,
        remindArr
      })

    } else {
      this.setData({
        memoryArr: [],
        nowScheduleArr: [],
        remindArr: []
      })
    }

  },

  // 点击跳转设置纪念日
  handleSetMemday() {
    wx.navigateTo({
      url: '/pages/memoryday/memoryday',
    })
  },
  // 点击跳转设置计划
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

  surplus(endTime, obj) {
    /* 剩余天数---开始 */
    var date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDate();
    month = dateTimePicker.withData(month + 1);
    let startTime = year + "/" + month + "/" + day;
    let surday = this.checkDate(startTime, endTime);
    if (surday >= 0)
      return surday;
    else {
      obj.isOverDate = true;
      var end = new Date(endTime.replace(/-/g, "/"));
      let month = end.getMonth();
      month = dateTimePicker.withData(month + 1);
      let newEndTime = end.getFullYear() + 1 + "/" + month + "/" + end.getDate();
      let surday = this.checkDate(startTime, newEndTime);
      return surday;
    }
    /* 剩余 天数---结束 */
  },

  onPullDownRefresh() {
    this.onLoad();
    this.onShow();
    wx.stopPullDownRefresh()
  }
})