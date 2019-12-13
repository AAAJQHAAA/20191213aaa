<template>
  <div>
    <x-header class="header" @on-click-back="backtoHome" :left-options="{backText: '首页',preventGoBack:true}">协议</x-header>
    <scroll class="wrapper">
      <div v-html="text">
      </div>
    </scroll>
    <group>
      <x-button type="primary" @click.native="downloadPDF">下载</x-button>
      <x-button type="primary" link="/config">{{$t('home.buttonValue')}}</x-button>
    </group>
  </div>
</template>
<script>
  import Scroll from './common/scroll/Scroll'
  import commonMethods from '../common/common'
  import { XButton,Group,XHeader} from 'vux'
  export default {
    components: {XButton,Group,Scroll,XHeader},
    data(){
      return {
        text:commonMethods.text
      }
    },
    methods:{
      backtoHome(){
        this.$router.push('/')
      },
      downloadPDF(){
        let wwwPathPDF = cordova.file.applicationDirectory+"www/BYD Battery-Box Privacy Policy-20191018-en.pdf";
        let fileURL = cordova.file.externalRootDirectory;
        window.resolveLocalFileSystemURL(wwwPathPDF,
          function(fileEntry) {
          alert(fileEntry.name+fileEntry.toURL())
            alert(fileURL)
            window.requestFileSystem(LocalFileSystem.PERSISTENT,0,
              function (fs) {
                fs.root.getDirectory('Download',{create: true, exclusive: false},
                  function(dir) {
                    fileEntry.copyTo(dir, fileEntry.name,function successCallback(fileEntry) {
                            alert("文件复制成功！新文件路径：" + fileEntry.toURL());
                            alert("文件下载到了文件管理/内部存储/Download下");
                          }, function errorCallback(error) {
                            alert("文件复制失败！"+JSON.stringify(error))
                          });
                  },function (error){})
              });
          },function(error){alert("获取文件失败")});
      }
    },
    mounted() {
      document.addEventListener("deviceready", function () {
        console.log('Device is Ready!')
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
 .wrapper{
   margin-top: 50px;
   height: 70vh;
   overflow: hidden;
 }
</style>
