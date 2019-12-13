<template>
  <div id="updates">
    <x-header class="header" @on-click-back="backtoHome" :left-options="{backText: '首页',preventGoBack:true}">固件更新</x-header>
    <scroll class="wrapper">
      <!--目标设备选择弹窗-->
      <group title="选择设备并下载Bin文件please make sure the Internet is connected">
        <popup-picker title="目标设备" :data="targets" v-model="target"></popup-picker>
        <x-button type="primary" @click.native="downloadTarget">下载设备</x-button>
        <x-button type="primary" @click.native="parseBinFileToArray">解析文件</x-button>
        <x-button type="primary" @click.native="connect">连接</x-button>
      </group>
      <!--显示信息框-->
      <group title="设备信息如下">
        <cell-form-preview :list="listMessage"></cell-form-preview>
      </group>
      <!--更新按钮-->
      <group title="进行更新操作：please make sure your cell phone is connected to the Battery-Box Premium`s Wifi">
        <x-button type="primary" @click.native="startUpdate" :disabled="data===''">开始更新</x-button>
      </group>
      <group title="日志:">
        <cell-form-preview :list="list"></cell-form-preview>
      </group>
      <!--更新进行中-->
      <div>
        <loading :show="showloading" text="updata"></loading>
      </div>
    </scroll>
  </div>
</template>

<script>
  import { XButton,XHeader,Group,PopupPicker,XInput,CellFormPreview,Loading} from 'vux'
  import Scroll from '../common/scroll/Scroll'
  import crc from '../../common/CRC'
  export default {
    name: "Updates",
    components:{
      XButton,XHeader,Scroll,Group,PopupPicker,XInput,CellFormPreview,Loading
    },
    data(){
      return {
        targets:[['BMS','BMU']],
        target:[],
        listMessage:[
          {
            label: '主固件版本',
            value: '--'
          },
          {
            label: '父固件版本',
            value: '--'
          },
          {
            label: '内存模块',
            value: '--'
          }
        ],
        showloading:false,
        list:[{
          label: '下载设备',
          value: '等待下载..'
        }, {
          label: '更新操作',
          value: '等待更新..'
        }],
        data:'',
        times:0,
        socket:''
      }
    },
    methods:{
        //返回首页
      backtoHome(){
        this.$router.push('/')
      },
      //下载设备
      downloadTarget(){
        let uri = "http://alpspower.com.au/wp-content/uploads/2019/12/BMU-P2-1.1-A.pdf";
        let fileURL = cordova.file.externalRootDirectory + 'Download/BMU-P2-1.1-A.bin';
        let _this = this;
        let fileTransfer = new FileTransfer();
        fileTransfer.download(uri, fileURL,
          function (entry) {
            alert('下载成功：' + entry.toURL());
            alert(entry.name)
            _this.setVersion(entry.name);
            _this.list[0].value="成功";
            // _this.parseBinFileToArray()
          },
          function (error) {alert('下载失败：' + JSON.stringify(error));_this.list[0].value="失败"},
          false,
          {headers: {'Authorization': 'Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=='}}
        )
      },
      //获取下载的bin文件，解析成二进制数组
      parseBinFileToArray(){
        alert('parseBinFileToArray')
        let _this=this
        window.requestFileSystem(LocalFileSystem.PERSISTENT,0,
          function (fs) {
          alert(JSON.stringify(fs.root))
          fs.root.getDirectory('Download',{create: false},
            function (dirEntry) {
            dirEntry.getFile('BMU-P2-1.1-A.bin',{create: false,exclusive: false},
              function (fileEntity) {
              fileEntity.file(function (file){
                alert(JSON.stringify(file))
                _this.parseBin(file)
              },function (error){alert('获取bin文件失败111')}
              )},
              function (error){alert('获取bin文件失败222')}
              )
          },function (error){alert('获取文件夹失败')})
        });
      },
      //将文件转化为字符数组
      parseBin(file){
        alert(' parseBin(file)')
        let _this=this
        if (window.FileReader) {
          let reader = new FileReader()
          reader.readAsArrayBuffer(file);//发起异步请求
          reader.onload = function (e) {
            //读取完成后，数据保存在对象的result属性中
            let result = new Uint8Array(e.target.result)
            //将大数组分成若干个128小数组集合
            let arr = [];
            let len = result.length;
            for (let i = 0; i < len; i += 128) {
              arr.push(result.slice(i, i + 128));
            }
            _this.data = arr
            alert(arr)
            alert('data:'+_this.data)
          }
        } else {
          alert('解析文件，不支持')
        }
      },
      //从文件名解析出版本信息
      setVersion(filename){
        //BMU-1.3-A
        let arr=filename.split('-')
        alert(arr)
        this.listMessage[0].value=arr[2].substring(0,1)
        this.listMessage[1].value=arr[2].substring(2)
        this.listMessage[2].value=arr[3].substring(0,1)
      },
      //开始更新
      startUpdate(){
        if(this.socket.state === 2){
          this.connect()
        }
        this.showloading=true
        this.sendArray(0)
      },
      //更新操作之前需要获取TCP连接
      connect() {
        let _this=this
        let socket = new Socket();
        socket.open("192.168.16.254",8080,
          function () {alert('update连接成功');},
          function (errorMessage) {
          // alert('update连接失败')
        })
        socket.onData = (data) => {
          if(_this.data!=''){
            _this.times++
            if(_this.times<_this.data.length){
              _this.sendArray(_this.times);
            }
            if(_this.times===_this.data.length){
              _this.showloading=false
              _this.list[1].value="成功"
            }
          }
        }
        socket.onError = function(errorMessage) {
          alert('update连接期间发生某些错误:'+errorMessage)
          _this.showloading=false
        }
        socket.onClose = function(hasError) {
          _this.showloading=false
          alert('update连接关闭后调用')
        }
        _this.socket = socket
      },
      sendArray(i){
        // alert(i)
        let array=[]
        array.push(0x01)
        array.push(0x10)
        // if(BMU){
        array.push(0x05)
        array.push(0xf7)
        // }else if(BMS){
        //   array.push(0x06)
        //   array.push(0x40)
        // }
        array.push(0x00)
        array.push(0x43)
        array.push(0x86)

        array.push(parseInt((i+1)/256))
        array.push((i+1)%256)
        array.push(0x00)
        array.push(0x00)
        array.push(0x00)
        array.push(0x80)
        //最后一次发送小于128位时，第十四位为数组长度
        if(this.data[i].length!=128){
          array[13]=this.data[i].length
          array[5]= parseInt(array[13]/2)+3
          array[6]= array[13]+6
        }
        //数据
        array.push.apply(array,this.data[i])
        //效验码
        let crcStr=crc.ToCRC16(array)
        array.push(parseInt(crcStr.substring(0,2),16))
        array.push(parseInt(crcStr.substring(2),16))
        //alert(array)
        this.socket.write(array,
          function () {
            // alert('发送成功')
          },
          function (errorMessage) {
            alert('发送失败'+i)
          });
      }
    },
  mounted() {
    let _this=this
    document.addEventListener("deviceready", function () {
      _this.connect()
      _this.myInterval=setInterval(() => {
        if(_this.socket.state === 0){
          // alert('连接不成功，请确保连接了WIFI')
          _this.connect()
        }
      }, 5000)
    }, false)
  },
  destroyed() {
    if(this.socket.state === 2){
      this.socket.close()
    }
    clearInterval(this.myInterval)
  }
  }
</script>

<style scoped>
  .header{
    position: fixed;
    top: 0px;
    width: 100%;
    z-index: 1;
  }
.wrapper{
  margin-top: 50px;
  height: 80vh;
  overflow: hidden;
}
</style>
