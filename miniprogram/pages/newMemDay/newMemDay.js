var dateTimePicker = require('../../utils/dateTimePicker.js');
var util2 = require('../../utils/util2.js');
Page({
  data: {
    // 时间
    dateTime: null,
    dateTimeArray: null,
    startYear: 2000,
    endYear: 2050,
    // 文本框内容
    itemVal: "",
    // obj:{},
    // 存放obj
    memoryArr: [],
    guideIndex: 0
  },

  onLoad: function (options) {
    let guideindex = wx.getStorageSync('guideInfo').memGuide;

    var obj = dateTimePicker.dateTimePicker(this.data.startYear, this.data.endYear);
    let dateTime = obj.dateTime;
    let dateTimeArray = obj.dateTimeArray;
    // 精确到日的处理，将数组的 时分秒 去掉
    obj.dateTimeArray.pop();
    obj.dateTimeArray.pop();
    obj.dateTimeArray.pop();
    obj.dateTime.pop();
    obj.dateTime.pop();
    obj.dateTime.pop();

    this.setData({
      dateTime: dateTime,
      dateTimeArray: dateTimeArray,
      guideIndex: guideindex
    });
  },

  changeDateTime(e) {
    this.setData({ dateTime: e.detail.value });
  },
  changeDateTimeColumn(e) {
    var arr = this.data.dateTime, dateArr = this.data.dateTimeArray;

    arr[e.detail.column] = e.detail.value;
    dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);
    this.setData({
      dateTimeArray: dateArr,
      dateTime: arr
    });
  },

  handleTextInput(e) {
    this.setData({
      itemVal: e.detail.value,
    })
  },

  formSubmit() {
    // 内容空 提交失败
    let { itemVal } = this.data;
    if (itemVal.trim() === "") {
      wx.showToast({
        title: '内容不能为空',
        icon: 'error',
        duration: 1500,
      })
      itemVal = "";
      this.setData({ itemVal })
      return
    }
    wx.showLoading({
      title: '提交中',
      mask: true
    })
    // let memoryArr = wx.getStorageSync('memoryArr')||[];
    let memoryArr = [];
    let userid = wx.getStorageSync('UserId');
    wx.cloud.callFunction({
      name: 'getDbData',
      data: {
        id: userid,
        dbname: 'memoryArr',
        action: 'byid'
      }
    }).then(res3 => {
      memoryArr = res3.result.data.memarr;
      let { dateTime } = this.data;
      let { dateTimeArray } = this.data;
      let timeStr = dateTimeArray[0][dateTime[0]] + "-" + dateTimeArray[1][dateTime[1]] + "-" + dateTimeArray[2][dateTime[2]];

      let obj = {};
      obj.isTouchMove = false;  // 默认隐藏删除
      obj.isOverDate = false; // 默认今年未到
      obj.timeStr = timeStr;
      // 日期排序
      obj.surplusday = 0;  // 默认剩余0天
      obj.itemVal = itemVal;
      memoryArr.push(obj);
      wx.setStorageSync('memoryArr', memoryArr);
      let memArr = util2.sortMemoryArr();
      wx.setStorageSync('memoryArr', memArr);
      wx.cloud.callFunction({
        name: 'updateDbData',
        data: {
          action: 'updateMem',
          dbname: 'memoryArr',
          id: userid,
          memoryArr: memArr
        }
      }).then(res5 => {
        wx.navigateBack({
          delta: 1,
        })
        wx.hideLoading()
      }).catch(err5 => {
        console.log(err5);
        wx.hideLoading()
      })

    }).catch(err3 => {
      console.log(err3);
      wx.hideLoading()
    })

  },
  handleKnow() {
    let openId = wx.getStorageSync('OpenId')
    let guideobj = wx.getStorageSync('guideInfo');
    guideobj.memGuide=1;
    wx.setStorageSync('guideInfo',guideobj)
    this.setData({
      guideIndex: 1
    })
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
  }
})