import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)
export default new Router({
  routes: [
    {
      path: '/',
      component: ()=>import('../components/Home')
    },
    {
      path: '/pdf',
      component: ()=>import('../components/PDFView')
    },
    {
      path: '/updates',
      component: ()=>import('../components/updates/Updates')
    },
    {
      path: '/preset',
      component: ()=>import('../components/preset/Preset')
    },
    {
      path: '/config',
      component: ()=>import('../components/config/Config')
    }
  ]
})
