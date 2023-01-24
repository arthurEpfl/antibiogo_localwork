import { defineStore } from 'pinia'
import { ref } from 'vue'
import { defaultConfig } from '@/config'
import axios from 'axios'

export const useSettingsStore = defineStore('settings', () => {
  const serverEndpoint = ref<URL>(defaultConfig.serverUrl)

  async function editServerEndpoint (endpoint: string | URL): Promise<boolean> {
    let success
    let url
    try {
      url = typeof endpoint === 'string' ? new URL(endpoint) : endpoint
      success = (await axios.get(url.href)).status === 200
    // eslint-disable-next-line no-empty
    } catch (e) {
      return false
    }

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
