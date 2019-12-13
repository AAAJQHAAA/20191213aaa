<template>
  <div>
    <x-header class="header" @on-click-back="backtoHome" :left-options="{backText: $t('config.backText'),preventGoBack:true}">{{$t('config.headerTitle')}}</x-header>
    <scroll class="wrapper">
      <!--第一步时间选择-->
      <group :title="$t('config.groupTitle1')">
        <datetime title="select time" v-model="time" format="YYYY-MM-DD HH:mm"></datetime>
        <x-button type="primary" @click.native="submitTime">{{$t('config.submitTime')}}</x-button>
      </group>
      <group title="其他配置">
        <!--配置流程-->
        <flow ref="flow">
          <flow-state state="1" :title="$t('config.flowTitle1')" is-done></flow-state>
          <flow-line :is-done="firstline"></flow-line>

          <flow-state state="2" :is-done="secondstate" :title="$t('config.flowTitle2')"></flow-state>
          <flow-line :is-done="secondline"></flow-line>

          <flow-state state="3" :is-done="thirdstate" :title="$t('config.flowTitle3')"></flow-state>
        </flow>
        <!--第二步逆变器设置-->
        <group :title="$t('config.groupTitle2')" v-show="currentstart===1">
          <popup-picker title="Inverter" :data="inverters" v-model="inverter"></popup-picker>
        </group>
        <!--第三步系统配置-->
        <group :title="$t('config.groupTitle3')" v-show="currentstart===2&&inverter[0].substring(inverter[0].length-2)==='HV'">
          <x-input title="Battery Module Quantity" required v-model="modelSerious" text-align="right" placeholder="please input" :is-type="inrange" :max="1"></x-input>
          <popup-picker title="Model" :data="cellTypes" v-model="cellType"></popup-picker>
        </group>
        <group :title="$t('config.groupTitle4')" v-show="currentstart===2&&inverter[0].substring(inverter[0].length-2)==='LV'">
          <x-input title="System Quantity In Parallel" required v-model="parallels" text-align="right" placeholder="please input" :is-type="inrange46" :max="2"></x-input>
          <popup-picker title="Model" :data="bmsTypes" v-model="bmsType" v-if="'SUNTECH LV'===inverter[0]"></popup-picker>
        </group>
        <!--第四步格子设置-->
        <group :title="$t('config.groupTitle5')" v-show="currentstart===3">
          <popup-picker title="Grid" :data="grids" v-model="grid"></popup-picker>
          <popup-picker title="Phase" :data="phases" v-model="phase"></popup-picker>
        </group>
        <!--下一步和上一步按钮-->
        <flexbox>
          <flexbox-item>
            <x-button type="primary" @click.native="back" :disabled="currentstart===1">{{$t('config.back')}}</x-button>
          </flexbox-item>
          <flexbox-item>
            <x-button type="primary" @click.native="next" :disabled="currentstart===3">{{$t('config.next')}}</x-button>
          </flexbox-item>
        </flexbox>
        <!--提交配置-->
        <group :title="$t('config.groupTitle6')">
          <x-button type="primary" @click.native="submitAll" :disabled="grid===''">{{$t('config.groupTitle6')}}</x-button>
        </group>
      </group>
    </scroll>
  </div>
</template>

<script>
  import { XButton,XHeader,Flow, FlowState, FlowLine,Group,Flexbox,FlexboxItem,Datetime,PopupPicker,XInput} from 'vux'
  import Scroll from '../common/scroll/Scroll'
  import commonMethods from '../../common/common'
  import crc from '../../common/CRC'
    export default {
        name: "Config",
      components:{
        XButton,XHeader,Scroll,Flow, FlowState, FlowLine,Group,Flexbox,FlexboxItem,Datetime,PopupPicker,XInput
      },
      data(){
          let number46=/^\+?[1-9][0-9]*$/
        return {
          currentstart:1,
          firstline:false,
          secondstate:false,
          secondline:false,
          thirdstate:false,
          thirdline:false,
          fourstate:false,
          time:commonMethods.Format(new Date(),'yyyy-MM-dd hh:mm'),
          inverters:[['FRONIUS HV','GOODWE HV','GOODWE LV','KOSTAL HV','SELECRONIC LV','SMA HV','SMA LV','VICTRON LV','SUNTECH LV']],
          inverter:[],
          modelSerious:'',
          inrange:function (value) {
            return {
               valid: parseInt(value)>=4&&parseInt(value)<=8,
              msg: '4<=must<=8'
            }
          },
          cellTypes: [['HVS','HVM','HVL']],
          cellType: [],
          parallels:'',
          inrange46:function (value) {
            return {
              valid: number46.test(value)&&parseInt(value)<=46,
              msg: '1=<must<=46'
            }
          },
          bmsTypes:[['LVS','LVM','LVL']],
          bmsType:[],
          grids: [['Off grid','On grid','Backup']],
          grid: [],
          phases: [['Single','Three']],
          phase: [],
          socket:'',
          myInterval:''
        }
      },
      methods:{
        backtoHome(){
          this.$router.push('/')
        },
        back(){
          switch (this.currentstart) {
            case 1:
              break;
            case 2:
              this.firstline=false
              this.secondstate=false
              this.currentstart--
              break;
            case 3:
              this.secondline=false
              this.thirdstate=false
              this.currentstart--
              break;
          }
        },
        next(){
          switch (this.currentstart) {
            case 1:
              if(this.inverter!=''){
              this.firstline=true
              this.secondstate=true
              this.currentstart++
              }else{
                alert('请选择')
              }
              break;
            case 2:
              if((this.modelSerious!=''&&this.cellType!='')||(this.parallels!=''&&this.bmsType!='')){
                this.secondline=true
                this.thirdstate=true
                this.currentstart++
              }else{
                alert('请填写完整')
              }
              break;
            case 3:
              break;
          }
        },
        connect(){
          let _this=this
          var socket= new Socket();
          socket.open(
            "192.168.16.254",
            8080,
            function() {
              alert('设备连接成功')
            },
            function(errorMessage) {
              alert('设备连接失败，请连接WIFI')
            })
          socket.onData=(data)=>{
            alert(data)
          }
          socket.onError = function(errorMessage) {
            alert('config连接期间发生错误:'+errorMessage)
          }
          socket.onClose = function(hasError) {
            alert('config连接关闭后调用')
          }
          _this.socket=socket
        },
        submitTime(){
          alert('提交时间')
          var dateStr = this.time.replace(/-/g,'/')
          var date=new Date(dateStr)
          var data =[]
          data.push(0x01)
          data.push(0x10)
          data.push(0x00)
          data.push(0x63)
          data.push(0x00)
          data.push(0x03)
          data.push(0x06)
          //日期（十进制）
          var yearStr=date.getFullYear().toString()
          data.push(parseInt(yearStr.substring(yearStr.length-2)))
          data.push(date.getMonth()+1)
          data.push(date.getDate())
          data.push(date.getHours())
          data.push(date.getMinutes())
          data.push(date.getSeconds())
          //效验码（十进制）
          var crcStr=crc.ToCRC16(data)
          data.push(parseInt(crcStr.substring(0,2),16))
          data.push(parseInt(crcStr.substring(2),16))
          this.socket.write(data,
            function() {
              alert('发送成功')
            },
            function(errorMessage) {
              alert('发送失败')
            });
        },
        submitAll(){
          //01 10 00 10 00 03 06 06 02 01 00 00 00 9F 4F
          var data =[]
          data.push(0x01)
          data.push(0x10)
          data.push(0x00)
          data.push(0x10)
          data.push(0x00)
          data.push(0x03)
          data.push(0x06)
          //配置
          let ab0=commonMethods.getArrayIndex(this.inverters[0],this.inverter[0])
          let a1=parseInt(this.modelSerious)
          let a2=commonMethods.getArrayIndex(this.cellTypes[0],this.cellType[0])
          let b1=parseInt(this.parallels)
          let b2=commonMethods.getArrayIndex(this.bmsTypes[0],this.bmsType[0])
          let ab1=commonMethods.getArrayIndex(this.grids[0],this.grid[0])
          let ab2=commonMethods.getArrayIndex(this.phases[0],this.phase[0])
          data.push(ab0)
          if(this.inverter[0].substring(this.inverter[0].length-2)==='HV'){
            data.push(a1)
            data.push(a2)
          }else{
            data.push(b1)
            data.push(b2)
          }
          data.push(ab1)
          data.push(ab2)
          data.push(0x00)//最后一位默认为0
          //效验码（十进制）
          var crcStr=crc.ToCRC16(data)
          data.push(parseInt(crcStr.substring(0,2),16))
          data.push(parseInt(crcStr.substring(2),16))
          this.socket.write(data,
            function() {
              alert('发送成功')
            },
            function(errorMessage) {
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
              alert('连接不成功，请确保连接了WIFI')
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
