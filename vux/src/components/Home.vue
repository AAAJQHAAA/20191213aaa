<template>
  <div id="home">
    <!--头部导航-->
    <x-header :left-options="{showBack: false}">{{$t('home.headerTitle')}}</x-header>
    <group>
      <img src="@/assets/img/home/icon.jpg" style="width: 100%;height: 40vh"/>
      <popup-picker :title="$t('home.popuptitle1')" :data="langs" v-model="langvalue" @on-hide="hide"></popup-picker>
    </group>
    <x-button type="primary" link="/pdf">下一步</x-button>
    <x-button type="primary" @click.native="downloadTarget1">下载CSV文件</x-button>
    <x-button type="primary" @click.native="downloadTarget2">下载pdf文件</x-button>
    <x-button type="primary" @click.native="downloadTarget3">下载图片文件</x-button>
    <div v-model="file_pdf"></div>
  </div>
</template>

<script>
  import { XButton,Actionsheet,XHeader,Group,PopupPicker} from 'vux'
  export default {
    name: "Home",
    components: {
      XButton,
      Actionsheet,
      XHeader,
      Group,
      PopupPicker
    },
    data() {
      return {
        langs:[['中文','English']],
        langvalue:['中文'],
        file_pdf:''
      }
    },
    methods: {
      hide() {
        let lang = this.langvalue[0]
        switch (lang) {
          case '中文':
            this.$i18n.locale = 'zh-CN'
            break
          case 'English':
            this.$i18n.locale = 'en-US'
            break
        }
      },
      //下载设备
      downloadTarget1(){
        let uri = encodeURI("http://alpspower.com.au/wp-content/uploads/2019/12/LVL-15.4-Threshhold-Parameter-20190829.csv");
        let fileURL = cordova.file.externalRootDirectory + 'aaaaa.csv';
        let _this = this;
        let fileTransfer = new FileTransfer();
        fileTransfer.download(uri, fileURL,
          function (entry) {alert('下载成功：' + entry.toURL());},
          function (error) {alert('下载失败：' + JSON.stringify(error));},
          false,
          {headers: {'Authorization': 'Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=='}}
        )
      },
      //下载设备
      downloadTarget2(){
        let uri = encodeURI("http://alpspower.com.au/wp-content/uploads/2019/12/BMU-P2-1.1-B.pdf");
        let fileURL = cordova.file.externalRootDirectory + 'BMU-P2-1.1-B.pdf';
        let _this = this;
        let fileTransfer = new FileTransfer();
        fileTransfer.download(uri, fileURL,
          function (entry) {alert('下载成功：' + entry.toURL());},
          function (error) {alert('下载失败：' + JSON.stringify(error));},
          false,
          {headers: {'Authorization': 'Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=='}}
        )
      },
      //下载设备
      downloadTarget3(){
        let uri = encodeURI("https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1575376466063&di=f4c74cf5ba2e5ed211ffed80f08a0e67&imgtype=0&src=http%3A%2F%2Fb-ssl.duitang.com%2Fuploads%2Fitem%2F201208%2F30%2F20120830173930_PBfJE.jpeg");
        let fileURL = cordova.file.externalRootDirectory + 'aaaaa.jpeg';
        let _this = this;
        let fileTransfer = new FileTransfer();
        fileTransfer.download(uri, fileURL,
          function (entry) {alert('下载成功：' + entry.toURL());},
          function (error) {alert('下载失败：' + JSON.stringify(error));},
          false,
          {headers: {'Authorization': 'Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=='}}
        )
      }
  },
    mounted() {
      document.addEventListener("deviceready", function () {
        console.log('Device is Ready!')
        setTimeout(() => {
          alert('定时1秒后')
        }, 1000)
      }, false)
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
</style>
