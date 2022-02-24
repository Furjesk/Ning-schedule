
function sortWithTableTime(arr){
  for(var i=0;i<arr.length-1;i++) {
    for(var j=0;j<arr.length-1-i;j++) {
      if(arr[j].itemTime && arr[j+1].itemTime){
        let temparr1 = arr[j].itemTime.split("-");
        let temparr2 = arr[j+1].itemTime.split("-");
        if(new Date("2021/7/12 "+temparr1[0])>new Date("2021/7/12 "+temparr2[0])) {
          let temp = arr[j];
          arr[j] = arr[j+1];
          arr[j+1] = temp;
        } else if(withData(temparr1[0])===withData(temparr2[0])) {
          if(new Date("2021/7/12 "+temparr1[1])>new Date("2021/7/12 "+temparr2[1])){
            let temp = arr[j];
            arr[j] = arr[j+1]; 
            arr[j+1] = temp;
          }
        }

      }
    }
  }
  return arr;
}

function withData(param){
  var reg = /^(?:[0-9]):[0-5][0-9]$/;
  if(reg.test(param)) {
    return '0' + param;
  }
  else {
    return param;
  }
}

// 纪念日数组排序
function sortMemoryArr(){
  let memoryArr = wx.getStorageSync('memoryArr');
    for (var i = 0; i < memoryArr.length; i++) {
      // 排序 用今年的年份，防止surplusday计算异常
      var date = new Date();
      let year = date.getFullYear();
      let obj = memoryArr[i];
      var time = new Date(obj.timeStr.replace(/-/g, "/"));
      let month = time.getMonth();
      month = withData(month + 1);
      let newTimeStr = year + "/" + month + "/" + time.getDate();
      // 日期排序
      let surplus = surplus2(newTimeStr, obj);
      obj.surplusday = surplus;
    }
    sortWithSurplus(memoryArr);
    console.log("app.js调用!!!utils的  原  onShow可改为每隔一天自动执行 改为云函数触发器");
    wx.setStorageSync('memoryArr', memoryArr);
    return memoryArr
}
function surplus2(endTime, obj) {
  /* 剩余天数---开始 */
  var date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth();
  let day = date.getDate();
  month = withData(month + 1);
  let startTime = year + "/" + month + "/" + day;
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

// 提醒事项排序
function sortRemindArr(){
  let items = wx.getStorageSync('items');
    for(var i=0;i<items.length;i++){
      if(!items[i].isPerpetual && new Date(items[i].timeStr.replace(/-/g, "/"))<new Date()){
        items[i].isOverDate=true;
      }
    }
    items = sortWithOverDate(items);
    wx.setStorageSync('items', items);
    return items
}
function sortWithOverDate(items){
  let over = [];
  let other = [];
  for(var j=0;j<items.length;j++){
    if(items[j].isOverDate==true){
      over.push(items[j]);
    }else{
      other.push(items[j]);
    }
  }
  sortWithTime(other,true);
  sortWithTime(over,false);
  return items=other.concat(over);
}
 // 冒泡排序
function sortWithTime(items ,asc){
  var date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth()+1;
  let day = date.getDate();
  let newTimeStr1,newTimeStr2;
  // 升序，考虑每天和一次日期（每天换成今天的时间 统一时间）
  if(asc) {
    for(var i=0;i<items.length-1;i++) {
      for(var j=0;j<items.length-1-i;j++) {
        if(items[j].isPerpetual){
          let time = new Date(items[j].timeStr);
          let hour1 = time.getHours();
          let minute1 = time.getMinutes();
          newTimeStr1 = year+"/"+month+"/"+day +" "+ hour1 + ":" + minute1;
        }else {
          newTimeStr1 = items[j].timeStr;
        }
        if(items[j+1].isPerpetual){
          let time2 = new Date(items[j+1].timeStr);
          let hour2 = time2.getHours();
          let minute2 = time2.getMinutes();
          newTimeStr2 = year+"/"+month+"/"+day +" "+ hour2 + ":" + minute2;
        }else {
          newTimeStr2 = items[j+1].timeStr;
        }

        if(new Date(newTimeStr1)>new Date(newTimeStr2)) {
          let temp = items[j+1];
          items[j+1] = items[j];
          items[j] = temp;
        }
      }
    }
  }

  // 降序，只考虑时间降序
  if(!asc) {
    for(var i=0;i<items.length-1;i++) {
      for(var j=0;j<items.length-1-i;j++) {
        newTimeStr1 = items[j].timeStr;
        newTimeStr2 = items[j+1].timeStr;
        if(new Date(newTimeStr1)<new Date(newTimeStr2)) {
          let temp = items[j+1];
          items[j+1] = items[j];
          items[j] = temp;
        }
      }
    }
  }
}

module.exports = {
  sortWithTableTime: sortWithTableTime,
  sortMemoryArr: sortMemoryArr,
  sortRemindArr: sortRemindArr,
  sortWithTime: sortWithTime,
  surplus2: surplus2,
  sortWithSurplus: sortWithSurplus,
  checkDate: checkDate
}