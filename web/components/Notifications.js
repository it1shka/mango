import { ref, computed, watch } from 'vue'
import store, {popNotification} from '../store.js'
import { sleep } from '../lib.js'

export default {
  template: `
    <Teleport v-if="active" to="body">
      <div class="notification">
        <img :src="image" />
        <p>{{ current.message }}</p>
      </div>
    </Teleport>
  `,
  setup() {
    const active = ref(false)
    const current = ref(null)
    const notifications = computed(() => store.notifications)
    watch(notifications, async () => {
      if (notifications.value.length <= 0 || active.value) return
      active.value = true
      current.value = notifications.value[0]
      await sleep(1500)
      active.value = false
      popNotification()
    })
    const image = computed(() => {
      return current.value.kind === 'error'
        ? '/images/failure.png'
        : '/images/success.png'
    })
    return { active, current, image }
  },
}
