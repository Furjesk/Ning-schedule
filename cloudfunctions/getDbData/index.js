// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  let dbname = event.dbname;
  if(event.action=="byname"){
    return cloud.database().collection(dbname).get();
  }else if(event.action=="byid"){
    return cloud.database().collection(dbname).doc(event.id).get();
  }else if(event.action=="byseg_openid"){
    return cloud.database().collection(dbname).where({openid:event.openid}).get();
  }
}