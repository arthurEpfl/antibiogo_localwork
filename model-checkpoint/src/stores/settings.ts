import { defineStore } from 'pinia'
import { ref } from 'vue'
import { defaultConfig } from '@/config'
import axios from 'axios'

export const useSettingsStore = defineStore('settings', () => {
  const serverEndpoint = ref<URL>(defaultConfig.serverUrl)

  async function editServerEndpoint (url: URL): Promise<boolean> {
    let success = false
    try {
      success = (await axios.get(url.href)).status === 200
    // eslint-disable-next-line no-empty
    } catch (e) {}

    if (success) {
      serverEndpoint.value = url
    }
    return success
  }

  function restoreServerEndpoint () {
    serverEndpoint.value = defaultConfig.serverUrl
  }

  return {
    serverEndpoint,
    editServerEndpoint,
    restoreServerEndpoint
  }
})
