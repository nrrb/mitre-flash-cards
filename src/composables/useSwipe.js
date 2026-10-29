import { ref } from 'vue'

const TAP_PX = 10
const SWIPE_PX = 80

// Pointer handlers for a card: onTap on a tap, onSwipe(true|false) on right|left swipe.
export const useSwipe = ({ onTap, onSwipe }) => {
  const dx = ref(0)
  let start = null

  const down = (e) => {
    start = { x: e.clientX, y: e.clientY }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const move = (e) => {
    if (!start) return
    const x = e.clientX - start.x
    const y = e.clientY - start.y
    dx.value = Math.abs(x) > Math.abs(y) ? x : 0
  }
  const up = (e) => {
    if (!start) return
    const x = e.clientX - start.x
    const y = e.clientY - start.y
    start = null
    dx.value = 0
    if (Math.abs(x) < TAP_PX && Math.abs(y) < TAP_PX) onTap()
    else if (Math.abs(x) >= SWIPE_PX && Math.abs(x) > Math.abs(y)) onSwipe(x > 0)
  }
  const cancel = () => {
    start = null
    dx.value = 0
  }

  return { dx, handlers: { onPointerdown: down, onPointermove: move, onPointerup: up, onPointercancel: cancel } }
}
