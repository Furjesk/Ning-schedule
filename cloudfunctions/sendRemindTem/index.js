// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  let remindList = [];
  let remindObj = {};
  let userlist = [];
  let remindArr = [];
  await cloud.database().collection("userlist")
    .get()
    .then(res2 => {
      userlist = res2.data;
    }).catch(err2 => {
      console.log(err2);
    })
  // 获取 remindList
  await cloud.database().collection("remindList")
    .get()
    .then(res => {
      remindList = res.data;
    })
    .catch(err => {
      console.log(err);
    });
  // 找出当天的第一个数据
  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
  let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
  let today = year + "-" + month + "-" + day;

  for (var i = 0; i < userlist.length; i++) {
    remindArr = remindList[i].remindArr;
    for (var j = 0; j < remindArr.length; j++) {
      let temparr = remindArr[j].timeStr.split(" ");
      if (temparr[0] == today || remindArr[j].isPerpetual) { // 判断时间是否是今天，或重复
        remindObj = remindArr[j];
        j = remindArr.length-1;  // 只选第一个
      }
    }

    if (remindObj != {}) {
      try {
        const result = await cloud.openapi.subscribeMessage.send({
          "touser": userlist[i].openid,
          "templateId": 'Dj__a5vk7cdnjfPrB2ptjZemLGwiNQi0hiD_6shT3Cg',
          "page": 'pages/index/index',
          // "miniprogram_state": 'developer',
          "lang": 'zh_CN',
          "data": {
            "thing1": {
              "value": '快来看看还有什么提醒事项'
            },
            "thing2": {
              "value": remindObj.itemVal
            },
            "time3": {
              "value": remindObj.timeStr
            },
            "phrase4": {
              "value": remindObj.isPerpetual ? '每天' : '仅此一次'
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