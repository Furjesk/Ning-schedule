// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  let memoryArr = [];
  let userlist = [];
  let memarr = [];
  let memitem = {};
  await cloud.database().collection("userlist")
    .get()
    .then(res2 => {
      userlist = res2.data;
    }).catch(err2 => {
      console.log(err2);
    })
  await cloud.database().collection("memoryArr")
    .get()
    .then(res => {
      memoryArr = res.data;
    })
    .catch(err => {
      console.log(err);
    });
  for (var i = 0; i < userlist.length; i++) {
    // if(userlist[i].userid==memoryArr[i]._id){

    // }

    memarr = memoryArr[i].memarr;
    if (memarr.length == 0) {
      continue
    } else if (memarr[0].surplusday == 7 || memarr[0].surplusday < 4) {
      memitem = memarr[0]
    } else {
      continue
    }
    try {
      const result = await cloud.openapi.subscribeMessage.send({
        "touser": userlist[i].openid,
        // "touser": cloud.getWXContext().OPENID,
        "page": 'pages/index/index',
        "lang": 'zh_CN',
        "data": {
          "thing1": {
            "value": memitem.itemVal
          },
          "time2": {
            "value": memitem.timeStr
          },
          "thing3": {
            "value": memitem.itemVal + '快到啦'
          },
          "thing5": {
            "value": memitem.surplusday == 0 ? '今天' : memitem.surplusday+'天后'
          }
        },
        "templateId": 'RFl3C3fwezJjZJypYG6tT99Ubk7qwPOUpY_SsxwTgAM',
        // "miniprogramState": 'developer'
      })
      return result
    } catch (err) {
      return err
    }
  }

}