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
    // obj.isTouchMove|itemVal|timeStr
    // obj: {},
    // 存放obj
    items: [],
    isPerpetual: true,
    guideIndex: 0
  },

  onLoad: function (options) {
    let guideindex = wx.getStorageSync('guideInfo').remindGuide;

    var obj = dateTimePicker.dateTimePicker(this.data.startYear, this.data.endYear);
    // let {itemVal} = this.data;
    let dateTime = obj.dateTime;
    let dateTimeArray = obj.dateTimeArray;
    // 精确到分的处理，将数组的秒去掉
    var lastArray = obj.dateTimeArray.pop();
    var lastTime = obj.dateTime.pop();

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
    // let items = wx.getStorageSync('items')||[];
    let items = [];
    let userid = wx.getStorageSync('UserId');
    wx.cloud.callFunction({
      name: 'getDbData',
      data: {
        id: userid,
        dbname: 'remindList',
        action: 'byid'
      }
    }).then(res3 => {
      items = res3.result.data.remindArr;
      let { dateTime } = this.data;
      let { dateTimeArray } = this.data;

      let timeStr = dateTimeArray[0][dateTime[0]] + "-" + dateTimeArray[1][dateTime[1]] + "-" + dateTimeArray[2][dateTime[2]] + " "
        + dateTimeArray[3][dateTime[3]] + ":" + dateTimeArray[4][dateTime[4]];
      // timeStrArr.push(timeStr);
      // wx.setStorageSync('timeStrArr', timeStrArr);

      let obj = {};
      let { isPerpetual } = this.data;
      obj.isTouchMove = false;  // 默认隐藏删除
      obj.isPerpetual = isPerpetual;  // 重复与否
      obj.isOverDate = false;  // 是否过期
      obj.timeStr = timeStr; 
      obj.itemVal = itemVal;
      items.push(obj); 
      wx.setStorageSync('items', items);
      // 无需---开始
      let items2 = util2.sortRemindArr();
      wx.setStorageSync('items', items2);
      // ---结束
      wx.cloud.callFunction({
        name: 'updateDbData',
        data: {
          action: 'updateRemind',
          dbname: 'remindList',
          id: userid,
          remindArr: items2
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

    // this.setData({
    //   items: items
    // })
    // wx.navigateBack({
    //   delta: 1,
    // })
  },
  
  radio_check(e) {
    let { isPerpetual } = this.data;
    isPerpetual = e.detail.value == 0 ? true : false;
    this.setData({ isPerpetual });
  },
  handleKnow() {
    let openId = wx.getStorageSync('OpenId')
    let guideobj = wx.getStorageSync('guideInfo');
    guideobj.remindGuide=1;
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