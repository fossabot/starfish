import Vue from 'vue'

Vue.directive(`tooltip`, {
  bind: (el, binding, vnode) => {
    let tooltipData = binding.value
    const $store = vnode.context.$store

    el.tooltipData = tooltipData

    el.addEventListener(`mouseenter`, () =>
      $store.commit(`tooltip`, el.tooltipData),
    )

    el.addEventListener(`mouseleave`, () => {
      $store.commit(`tooltip`)
    })
  },
  componentUpdated: (el, binding, vnode) => {
    let tooltipData = binding.value
    ;(el as any).tooltipData = tooltipData
  },
  unbind: (el, binding, vnode) => {},
})
