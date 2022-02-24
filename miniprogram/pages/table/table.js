var util = require("../../utils/util2.js");
Page({
  data: {
    tabs: [
      {
        id: 0,
        value: "周日",
        isActive: true
      },
      {
        id: 1,
        value: "周一",
        isActive: false
      },
      {
        id: 2,
        value: "周二",
        isActive: false
      },
      {
        id: 3,
        value: "周三",
        isActive: false
      },
      {
        id: 4,
        value: "周四",
        isActive: false
      },
      {
        id: 5,
        value: "周五",
        isActive: false
      },
      {
        id: 6,
        value: "周六",
        isActive: false
      }
    ],
    itemsArr: [],
    select: false,
    selAll: false,
    selSingle: "",
    selectedIndex: [],
    isfinish: true,
    cid: 0,
    isLogin: true
  },

  onLoad: function (options) {
    let index = options.cid; // string
    let { tabs } = this.data;
    tabs.forEach((v, i) => i == index ? v.isActive = true : v.isActive = false);  // i是number

    this.setData({
      tabs,
      cid: index
    })
  },
  /**
   * ！！！
   * 文本域输入框textarea会有焦点bug
   * 实在不行改成input
   */
  onShow: function (options) {
    let localname = wx.getStorageSync('userInfo').nickName;
    if (localname) {
      let { cid, itemsArr } = this.data;
      let name = "items" + cid;
      itemsArr = wx.getStorageSync(name);

      this.setData({
        cid,
        itemsArr,
        isLogin: true
      })
    } else {
      this.setData({
        itemsArr: [],
        isLogin: false
      })
    }
  },

  // 标题点击事件 从子组件传递来
  handleTabsItemChange(e) {
    // 1、获取被点击标题索引
    const { index } = e.detail;
    // 2、修改原数组
    let { tabs, cid, itemsArr, isfinish } = this.data;
    if (isfinish) {
      cid = index;
      tabs.forEach((v, i) => i === index ? v.isActive = true : v.isActive = false);

      let name = "items" + cid;
      itemsArr = wx.getStorageSync(name);
      this.setData({
        tabs,
        cid,
        itemsArr
      })
    }

  },

  // 新增
  handleNewSchedule() {
    let { isLogin } = this.data;
    if (isLogin) {
      let { cid } = this.data;
      let arrname = "items" + cid;
      let scheduleArr = wx.getStorageSync(arrname) || [];
      let obj = {};
      // obj.itemTime = "";
      // obj.itemVal = "";
      scheduleArr.push(obj);
      wx.setStorageSync(arrname, scheduleArr)
      this.setData({
        selAll: false,
        select: false
      })
      this.onShow();
    } else {
      wx.showToast({
        title: '请先登录',
        icon: 'error',
        duration: 1000
      })
    }
  },
  // 时间失去焦点
  outInputTime(e) {
    let itemindex = e.target.dataset.index;
    let { cid } = this.data;
    let arrname = "items" + cid;
    let scheduleArr = wx.getStorageSync(arrname) || [];
    var reg = /^(?:(?:2[0-3])|(?:[0-1]{0,1}[0-9])):[0-5][0-9]-(?:(?:2[0-3])|(?:[0-1]{0,1}[0-9])):[0-5][0-9]$/;
    let temp = e.detail.value.split("-");
    if (reg.test(e.detail.value) && new Date("2021/7/8 " + temp[0]) < new Date("2021/7/8 " + temp[1])) {
      scheduleArr[itemindex].itemTime = e.detail.value;
    } else {
      wx.showToast({
        title: '错误的时间区间',
        icon: 'error',
        duration: 1500,
      })
      return
    }
    scheduleArr = util.sortWithTableTime(scheduleArr);
    wx.setStorageSync(arrname, scheduleArr)
    this.setData({
      itemsArr: scheduleArr
    })
  },
  // 输入计划内容
  inputItem() {
    let { isfinish } = this.data;
    this.setData({
      isfinish: false
    })
  },
  // 失去内容焦点
  outInputItem(e) {
    let itemindex = e.target.dataset.index;
    let { cid, isfinish } = this.data;
    let arrname = "items" + cid;
    let scheduleArr = wx.getStorageSync(arrname) || [];
    if (e.detail.value != "") {
      scheduleArr[itemindex].itemVal = e.detail.value;
      wx.setStorageSync(arrname, scheduleArr)
      this.setData({
        itemsArr: scheduleArr
      })
    } else {
      // scheduleArr[itemindex].itemVal = "";
      // wx.setStorageSync(arrname, scheduleArr)
      // this.setData({
      //   itemsArr: scheduleArr
      // })
    }
    this.setData({
      isfinish: true
    })
  },
  // 选择
  handleSelect() {
    let { select, selectedIndex, selAll, selSingle } = this.data;
    let sel = !select;
    if (!sel) {
      selAll = false;
      selectedIndex.length = 0;
      selSingle = "";
    }
    this.setData({
      select: sel,
      selAll,
      selectedIndex,
      selSingle
    })
  },
  handleSelChange(e) {
    let { itemsArr } = this.data;
    let indexArr = e.detail.value;
    let selall;
    indexArr.sort();
    if (indexArr.length == itemsArr.length) {
      selall = true;
    }
    this.setData({
      selectedIndex: indexArr,
      selAll: selall
    })
  },
  handleDelete() {
    let { selectedIndex, itemsArr, cid } = this.data;
    var i, j, k = 0;
    if (selectedIndex.length > 0) {
      for (j = 0; j < itemsArr.length; j++) {
        if (selectedIndex.length > 0) {
          for (i = j; i < itemsArr.length; i++) {
            if (i == selectedIndex[0] - k) {
              itemsArr.splice(i, 1);
              selectedIndex.shift();
              j = i - 1;
              i = itemsArr.length - 1;
              k += 1;
            }
          }
        } else {
          break;
        }
      }
    } else {
      wx.showToast({
        title: '请先选择内容',
        icon: 'error',
        duration: 1500,
      })
      return
    }

    let arrname = "items" + cid;
    this.setData({
      itemsArr,
      selectedIndex,
      selAll: false,
      select: false
    })
    wx.setStorageSync(arrname, itemsArr);
  },
  handleSelAll() {
    let { selAll, selectedIndex, itemsArr } = this.data;
    // 全选状态
    let selall = !selAll;
    if (selall) {
      if (itemsArr.length > 0) {
        for (var i = 0; i < itemsArr.length; i++) {
          selectedIndex[i] = i;
        }
      }
    } else {
      selectedIndex.length = 0;
    }
    this.setData({
      selAll: selall,
      selSingle: selall ? "1" : "",
      selectedIndex
    })
  },

  // 上传
  handleUpload() {
    wx.showLoading({
      title: '上传中',
      mask: true
    })
    let tableArr = [];
    let userid = wx.getStorageSync('UserId');
    for (var i = 0; i < 7; i++) {
      let name = "items" + i;
      let arr = wx.getStorageSync(name) || [];
      tableArr.push(arr);
    }

    // 更新云数据
    wx.cloud.callFunction({
      name: 'updateDbData',
      data: {
        action: 'updateTable',
        dbname: 'tableList',
        id: userid,
        tableArr: tableArr
      }
    }).then(res5 => {
      wx.hideLoading()
    }).catch(err5 => {
      console.log(err5);
      wx.hideLoading()
    })
  }
})