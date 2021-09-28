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

Vue.directive(`targetpoint`, {
  bind: (el, binding, vnode) => {
    let targetPointData = binding.value
    const $store = vnode.context.$store

    el.targetPointData = targetPointData

    el.addEventListener(`mouseenter`, () =>
      $store.commit(`targetPoint`, el.targetPointData),
    )

    el.addEventListener(`mouseleave`, () => {
      $store.commit(`targetPoint`)
    })
  },
  componentUpdated: (el, binding, vnode) => {
    let targetPointData = binding.value
    ;(el as any).targetPointData = targetPointData
  },
  unbind: (el, binding, vnode) => {},
})
