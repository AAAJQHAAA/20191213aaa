//使用vuei18n实现语言切换
import Vue from 'vue'
import VueI18n from 'vue-i18n'
Vue.use(VueI18n) // 通过插件的形式挂载

export default new VueI18n({
  locale: 'zh-CN',    // 语言标识:this.$i18n.locale通过切换locale的值来实现语言切换
  messages: {
    'zh-CN': require('./lang/zh'),   // 中文语言包
    'en-US': require('./lang/en')    // 英文语言包
  },
  silentTranslationWarn: true
})
