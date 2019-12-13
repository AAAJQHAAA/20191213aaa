<template>
  <div>
    <x-header class="header" @on-click-back="backtoHome" :left-options="{backText: '首页',preventGoBack:true}">预置页面</x-header>
    <scroll class="wrapper">
      <!--预置表弹窗，电压以及表格编号-->
      <group title="设置预置表参数">
        <popup-picker title="电压" :data="voltages" v-model="voltage"></popup-picker>
        <popup-picker title="表格编号" :data="tablenumbers" v-model="tablenumber"></popup-picker>
        <x-button type="primary" @click.native="connect">连接</x-button>
        <x-button type="primary" @click.native="downloadTarget">下载CSV文件</x-button>
        <x-button type="primary" @click.native="parseCSVFileToArray">解析文件</x-button>
        <x-button type="primary" @click.native="startPreset" :disabled="data===''">写设备参数</x-button>
        <x-button type="primary" @click.native="connect">连接</x-button>
      </group>
      <!--更新进行中-->
      <div>
        <loading :show="showloading" text="updata"></loading>
      </div>
    </scroll>
  </div>
</template>

<script>
  import { XButton,XHeader,Group,PopupPicker,Loading} from 'vux'
  import Scroll from '../common/scroll/Scroll'
  import crc from '../../common/CRC'
    export default {
        name: "Preset",
      components:{
        XButton,XHeader,Scroll,Group,PopupPicker,Loading
      },
      data(){
          return {
            voltages:[['HV']],
            voltage:['HV'],
            tablenumbers:[['C178']],
            tablenumber:['C178'],
            data:'',
            times:0,
            socket:'',
            showloading:false,
          }
      },
      methods:{
        backtoHome(){
          this.$router.push('/')
        },
        //下载设备
        downloadTarget(){
          let uri = "http://alpspower.com.au/wp-content/uploads/2019/12/LVL-15.4-Threshhold-Parameter-20190829.csv";
          let fileURL = cordova.file.externalRootDirectory + 'Download/LVL-15.4-Threshhold-Parameter-20190829.csv';
          let _this = this;
          let fileTransfer = new FileTransfer();
          fileTransfer.download(uri, fileURL,
            function (entry) {
              alert('下载成功：' + entry.toURL());
              _this.parseCSVFileToArray()
            },
            function (error) {alert('下载失败：' + JSON.stringify(error));},
            false,
            {headers: {'Authorization': 'Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=='}}
          )
        },
        parseCSVFileToArray(){
          alert("下载成功之后解析文件")
          let _this=this
          window.requestFileSystem(LocalFileSystem.PERSISTENT,0,
            function (fs) {
              fs.root.getDirectory('Download',{create: false},
                function (dirEntry) {
                  dirEntry.getFile('LVL-15.4-Threshhold-Parameter-20190829.csv', {create: false,exclusive: false},
                            function (fileEntity) {
                              fileEntity.file(function (file){
                                alert('文件：'+JSON.stringify(file))
                                _this.parseCsv(file)
                              },function (error){
                                alert('文件错误：'+JSON.stringify(error))
                              });
                            },function (error){
                              alert('获取文件失败：'+JSON.stringify(error))
                            });
                },function (error){})
            });
        },
        parseCsv(file){
          alert("解析文件")
          let _this=this
          if (window.FileReader) {
            let reader = new FileReader()
            reader.readAsText(file);//发起异步请求
            reader.onload = function (e) {
              console.log(e.target.result)
              var data = e.target.result;
              var lineStrArray=data.split("\r\n")
              console.log(lineStrArray);//data为csv转换后的对象
              var linetoArray=[]
              for(let i of lineStrArray){
                linetoArray.push(i.split(','))
              }
              console.log(linetoArray)
              //获取行4,6,8,10,12,14
              var data10=[]
              for(let i of linetoArray){
                if(i[3].trim()===""){
                  break;
                }else{
                  data10.push(parseInt(i[3]))
                  data10.push(parseInt(i[5]))
                  data10.push(parseInt(i[7]))
                  data10.push(parseInt(i[9]))
                  data10.push(parseInt(i[11]))
                  data10.push(parseInt(i[13]))
                }
              }
              console.log(data10)
              //转成两位一个的十六进制
              var dataTwo10=[]
              for(let i of data10){
                if(i<0){
                  dataTwo10.push(parseInt((65535+i)/256))
                  dataTwo10.push((65535+i)%256)
                }else{
                  dataTwo10.push(parseInt(i/256))
                  dataTwo10.push(i%256)
                }
              }
              console.log(dataTwo10)
              //将大数组分成若干个128小数组集合
              let arr = [];
              let len = dataTwo10.length;
              for (let i = 0; i < len; i += 128) {
                arr.push(dataTwo10.slice(i, i + 128));
              }
              _this.data = arr
              alert(_this.data)
            }
          } else {
            alert('解析文件，不支持')
          }
        },
        //开始更新
        startPreset(){
          new Promise((resolve, reject) => {
            this.parseCSVFileToArray()
            resolve('解析文件成功')//成功时调用then
          }).then((data) => { //处理成功
            console.log(data)
            return new Promise((resolve, reject) => {
              if(this.socket.state === 2){
                this.connect()
              }
              resolve('连接没问题') //会调用then()
            })
          }).then((data) => { //处理成功
            console.log(data)
            this.showloading=true
            this.sendArray(0)
          })
        },
        //更新操作之前需要获取TCP连接
        connect() {
          let _this=this
          let socket = new Socket();
          socket.open("192.168.16.254",8080,
            function () {alert('preset连接成功');},
            function (errorMessage) {
            // alert('preset连接失败')
          })
          socket.onData = (data) => {
            if(_this.data!=''){
              _this.times++
              if(_this.times<this.data.length){
                _this.sendArray(this.times);
              }
              if(_this.times===_this.data.length){
                _this.showloading=false
              }
            }
          }
          socket.onError = function(errorMessage) {
            alert('preset连接期间发生错误:'+errorMessage)
            _this.showloading=false
          };
          socket.onClose = function(hasError) {
            _this.showloading=false
            alert('preset连接关闭后调用')
          };
          _this.socket = socket
        },
        sendArray(i){
          alert('发送第'+i+'次')
          let array=[]
          array.push(0x01)
          array.push(0x10)
          array.push(0x04)
          array.push(0x07)
          array.push(0x00)
          array.push(0x43)
          array.push(0x86)
          array.push(0x00)
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
          this.socket.write(array,
            function () {
              alert('发送成功')
            },
            function (errorMessage) {
              alert('发送失败')
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
