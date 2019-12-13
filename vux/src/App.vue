<template>
  <div id="app">
    <router-view/>
    <tabbar style="position: fixed" v-show="tabbarShow" ref="tabbar">
      <tabbar-item link="/config" selected>
        <img slot="icon" src="./assets/img/tabbar/configuration2.png">
        <img slot="icon-active" src="./assets/img/tabbar/configuration1.png">
        <span slot="label">Config</span>
      </tabbar-item>
      <tabbar-item link="/updates">
        <img slot="icon" src="./assets/img/tabbar/firmware2.png">
        <img slot="icon-active" src="./assets/img/tabbar/firmware1.png">
        <span slot="label">Update</span>
      </tabbar-item>
      <tabbar-item link="/preset">
        <img slot="icon" src="./assets/img/tabbar/threshold2.png">
        <img slot="icon-active" src="./assets/img/tabbar/threshold1.png">
        <span slot="label">Preset</span>
      </tabbar-item>
    </tabbar>
  </div>
</template>

<script>

  import { Tabbar, TabbarItem,ViewBox  } from 'vux'
export default {
  name: 'App',
  components:{
    Tabbar,
    TabbarItem,
    ViewBox
  },
  computed:{
    tabbarShow(){
      return this.$route.path==='/'||this.$route.path==='/pdf'?false:true
    }
  }
}
</script>

<style lang="less">
  @import '~vux/src/styles/reset.less';
  body {
    background-color: #fbf9fe;
  }
</style>
