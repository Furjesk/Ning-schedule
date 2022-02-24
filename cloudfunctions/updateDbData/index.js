// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
// 云函数入口函数
exports.main = async (event, context) => {
  let dbname = event.dbname;
  if (event.action == "updateMem") {
    await cloud.database().collection(dbname).doc(event.id).update({
      data: ({
        memarr: event.memoryArr
      })
    }).then(res2=>{
      console.log(res2);
    }).catch(err2=>{
      console.log(err2);
    })
    return
  }else if(event.action == "updateRemind"){
    await cloud.database().collection(dbname).doc(event.id).update({
      data: ({
        remindArr: event.remindArr
      })
    }).then(res=>{
      console.log(res);
    }).catch(err=>{
      console.log(err);
    })
    return
  }else if(event.action == "updateTable"){
    await cloud.database().collection(dbname).doc(event.id).update({
      data: ({
        items0: event.tableArr[0],
        items1: event.tableArr[1],
        items2: event.tableArr[2],
        items3: event.tableArr[3],
        items4: event.tableArr[4],
        items5: event.tableArr[5],
        items6: event.tableArr[6]
      })
    }).then(rest=>{
      console.log(rest);
    }).catch(errt=>{
      console.log(errt);
    })
    return
  }else if(event.action == "updateGuide"){
    await cloud.database().collection(dbname).where({openid:event.openid}).update({
      data: ({
        guide: event.guideObj
      })
    }).then(res_gui=>{
      console.log(res_gui);
    }).catch(err_gui=>{
      console.log(err_gui);
    })
    return
  }else { // 凌晨自动更新纪念日列表
    let memoryArr = []
    await cloud.database().collection("memoryArr")
      .get().then(res => {
        memoryArr = res.data
        // console.log("res.data", memoryArr);
      }).catch(err => {
        console.log(err);
      })
    // console.log("memoryArr", memoryArr);
    for (var j = 0; j < memoryArr.length; j++) {
      let memarr = memoryArr[j].memarr;
      // console.log("memarr1", memarr);
      for (var i = 0; i < memarr.length; i++) {
        var date = new Date();
        let year = date.getFullYear();
        let obj = memarr[i];
        var time = new Date(obj.timeStr.replace(/-/g, "/"));
        let month = time.getMonth();
        month = withData(month + 1);
        let newTimeStr = year + "/" + month + "/" + time.getDate();
        // 日期排序
        let surplus = surplus2(newTimeStr, obj)-1;
        obj.surplusday = surplus;
      }
      sortWithSurplus(memarr);
      // console.log("memarr2", memarr);
      await cloud.database().collection("memoryArr").doc(j + 1 + "")
        .update({
          data: ({
            memarr: memarr
          })
        }).then(res2 => {
          console.log(res2);
        }).catch(err2 => {
          console.log(err2);
        })
    }

  }
}

function surplus2(endTime, obj) {
  /* 剩余天数---开始 */
  var date = new Date();
  // let data2 = new Date();
  // console.log("let Data:",data2);
  let year = date.getFullYear();
  let month = date.getMonth();
  let day = date.getDate();
  month = withData(month + 1);
  let startTime = year + "/" + month + "/" + day;
  // console.log("surplus的今天日期: ",startTime);
  let surday = checkDate(startTime, endTime);
  if (surday >= 0)
    return surday;
  else {
    obj.isOverDate = true;
    var end = new Date(endTime.replace(/-/g, "/"));
    let month = end.getMonth();
    month = withData(month + 1);
    let newEndTime = end.getFullYear() + 1 + "/" + month + "/" + end.getDate();
    let surday = checkDate(startTime, newEndTime);
    return surday;
  }
  /* 剩余天数---结束 */
}
// 冒泡排序
function sortWithSurplus(memoryArr) {
  let arr = memoryArr || [];
  for (var i = 0; i < arr.length - 1; i++) {
    for (var j = 0; j < arr.length - 1 - i; j++) {
      if (arr[j].surplusday > arr[j + 1].surplusday) {
        var temp = arr[j + 1];
        arr[j + 1] = arr[j];
        arr[j] = temp;
      }
    }
  }
}
function checkDate(startTime, endTime) {
  //日期格式化
  var start_date = new Date(startTime.replace(/-/g, "/"));
  var end_date = new Date(endTime.replace(/-/g, "/"));
  //转成毫秒数，两个日期相减
  var ms = end_date.getTime() - start_date.getTime();
  //转换成天数
  var day = parseInt(ms / (1000 * 60 * 60 * 24));
  return day;
}
function withData(param) {
  var reg = /^(?:[0-9]):[0-5][0-9]$/;
  if (reg.test(param)) {
    return '0' + param;
  }
  else {
    return param;
  }
}