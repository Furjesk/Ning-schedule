// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  // let date = new Date();
  // let w_day = date.getDay();

  // let remindList = [];
  let tableList = [];
  // let remindObj = {};
  let taskObj = {};
  let userlist = [];
  // let remindArr = [];
  let itemsArr = [];
  await cloud.database().collection("userlist")
    .get()
    .then(res2 => {
      userlist = res2.data; // 获取userlist
    }).catch(err2 => {
      console.log(err2);
    })
  // 获取 tableList
  await cloud.database().collection("tableList")
    .get()
    .then(res => {
      tableList = res.data;
    })
    .catch(err => {
      console.log(err);
    });
  // 找出当天的第一个数据
  let date = new Date();
  let day = date.getDay(); // 0-6
  let itemsname = "items"+day;
  // let month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
  // let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
  // let today = year + "-" + month + "-" + day;

  for (var i = 0; i < userlist.length; i++) {
    // itemsArr = tableList[i].itemsname;
    switch(day){
      case 0:
        itemsArr = tableList[i].items0;
        break;
      case 1:
        itemsArr = tableList[i].items1;
        break;
      case 2:
        itemsArr = tableList[i].items2;
        break;
      case 3:
        itemsArr = tableList[i].items3;
        break;
      case 4:
        itemsArr = tableList[i].items4;
        break;
      case 5:
        itemsArr = tableList[i].items5;
        break;
      case 6:
        itemsArr = tableList[i].items6;
        break;
    }
    // for (var j = 0; j < itemsArr.length; j++) {
      // let temparr = itemsArr[j].timeStr.split(" ");
      // if (temparr[0] == today || itemsArr[j].isPerpetual) {
      //   remindObj = itemsArr[j];
      //   j = itemsArr.length-1;
      // }
    // }
    taskObj = itemsArr[0]||{};

    if (taskObj != {}) {
      try {
        const result = await cloud.openapi.subscribeMessage.send({
          "touser": userlist[i].openid,
          "templateId": '9pWtaYfUvenMmOMiG-KBVWnn9EIQnqGjPXKOX3tzQi8',
          "page": 'pages/index/index',
          // "miniprogram_state": 'developer',
          "lang": 'zh_CN',
          "data": {
            "thing1": {
              "value": taskObj.itemTime
            },
            "thing4": {
              "value": taskObj.itemVal
            },
            "time2": {
              "value": "2021/11/7"
            },
            "time10": {
              "value": "2021/11/7"
            }
          }
        })
        return result
      } catch (err) {
        return err
      }
    }
  }
}