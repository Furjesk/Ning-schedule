Page({
  data: {
    tabs: [
      {
        id: 0,
        value: "体验问题",
        isActive: true
      },
      {
        id: 1,
        value: "商品、商家投诉",
        isActive: false
      }
    ],
    // 被选中的图片路径数组
    chooseImgs:[],
    // 文本域内容
    textVal:"",
  },
  // 外网图片路径数组
  UpLoadImgs:[],

  handleSuggestion(){
    let {textVal} = this.data;
    this.setData({
      textVal: textVal==""?"功能建议:\n":textVal+"\n功能建议:\n"
    });
  },
  handleProblem(){
    let {textVal} = this.data;
    this.setData({
      textVal: textVal==""?"n性能问题:\n":textVal+"\n性能问题:\n"
    });
  },
  handleOthers(){
    let {textVal} = this.data;
    this.setData({
      textVal: textVal==""?"n其他:\n":textVal+"\n其他:\n"
    });
  },

  // 点击+ 选择图片
  handleChooseImg(){
    // 2 调用小程序内置的选择图片api
    wx.chooseImage({
      // 同时选中图片的数量
      count: 9,
      // 图片样式 原图/压缩图
      sizeType:['original','compressed'],
      // 图片来源 相册/相机
      sourceType:['album','camera'],
      success:(result)=>{
        this.setData({
          // 图片数组进行 拼接
          chooseImgs:[...this.data.chooseImgs,...result.tempFilePaths]
        })
      }
    })
  },
  // 点击自定义图片组件
  handleRemoveImg(e){
    // 2 获取被点击事件索引
    const {index}=e.currentTarget.dataset;
    // 3 获取data图片数组
    let {chooseImgs}=this.data;
    // 4 删除元素
    chooseImgs.splice(index,1);
    this.setData({
      chooseImgs
    })
  },
  // 文本域输入事件
  handleTextInput(e){
    this.setData({
      textVal:e.detail.value,
    })
  },
  // 提交按钮点击事件
  handleFormSubmit(e){
    // 1 获取文本域内容、图片数组
    const {textVal,chooseImgs}=this.data;
    // 2 合法性验证
    if(!textVal.trim()){
      wx.showToast({
        title: '输入不合法',
        icon:'none',
        mask:true
      });
      return;
    }
    // 3 准备上传图片到专门的图片服务器 api
    // 上传文件的api 不支持 多个文件同时上传（遍历数组挨个上传）
    // 显示正在等待图标
    wx.showLoading({
      title: '正在上传中',
      mask:true
    });
    // 判断有没有需要上传的图片数组
    if(chooseImgs.length!=0){
      chooseImgs.forEach((v,i)=>{
        wx.uploadFile({
          // 被上传文件的路径
          filePath: v,
          // 上传的文件名称 后台来获取文件 file
          name: 'file',
          // 图片要上传到哪里
          // url: 'http://hn216.api.okayapi.com/?s=App.CDN.UploadImg',
          url: 'https://img.coolcr.cn/api/upload',
          // 上传时顺带的文本信息
          formData:{},
          success:(result)=>{
            // console.log(result);
            let url=JSON.parse(result.data).url;
            this.UpLoadImgs.push(url);
            // console.log(this.UpLoadImgs);
            // 所有图片都上传完毕才触发
            if(i===chooseImgs.length-1){
              // 弹窗关闭
              wx.hideLoading();
              console.log("把文本内容和图片数组 提交到后台");
              // 提交都成功了
              // 重置页面
              this.setData({
                textVal:"",
                chooseImgs:[]
              })
              // 返回上一页面
              wx.navigateBack({
                delta: 1
              });
            }
          }
        });
      })
  
    }else{
      console.log("只提交了文本");
      wx.hideLoading();
      wx.navigateBack({
        delta: 1,
      })
    }
   }
})