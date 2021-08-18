import Vue from 'vue'

Vue.directive(`tooltip`, {
  bind: (el, binding, vnode) => {
    let tooltipData = binding.value
    const $store = vnode.context.$store

    el.addEventListener(`mouseenter`, () => {
      $store.commit(`tooltip`, tooltipData)
    })

    el.addEventListener(`mouseleave`, () => {
      $store.commit(`tooltip`)
    })
  },
})
