// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  let dbname = event.dbname;
  if(dbname == "userlist"){
    cloud.database().collection(dbname).add({
      data:{
        openid:event.openId,
        userid:event.userId
      }
    });
  }else if(dbname == "memoryArr"){
    cloud.database().collection(dbname).add({
      data:{
        _id:event.userId,
        memarr:event.memoryArr,
        openid:event.openId
      }
    });
  }else if(dbname == "remindList"){
    cloud.database().collection(dbname).add({
      data:{
        _id:event.userId,
        remindArr:event.remindArr,
        openid:event.openId
      }
    });
  }else if(dbname == "tableList"){
    cloud.database().collection(dbname).add({
      data:{
        _id:event.userId,
        items0:event.tableArr.length==0?[]:event.tableArr[0],
        items1:event.tableArr.length==0?[]:event.tableArr[1],
        items2:event.tableArr.length==0?[]:event.tableArr[2],
        items3:event.tableArr.length==0?[]:event.tableArr[3],
        items4:event.tableArr.length==0?[]:event.tableArr[4],
        items5:event.tableArr.length==0?[]:event.tableArr[5],
        items6:event.tableArr.length==0?[]:event.tableArr[6],
        openid:event.openId
      }
    });
  }else if(dbname == "guideInfo"){
    cloud.database().collection(dbname).add({
      data:{
        _id:event.userId,
        guide:event.guideObj,
        openid:event.openId
      }
    });
  }
  
}