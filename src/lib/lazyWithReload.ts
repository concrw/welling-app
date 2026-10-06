import type { ComponentType } from 'react'

const CHUNK_RELOAD_KEY = 'welling_chunk_reload'

export function lazyWithReload<T extends { default: ComponentType<unknown> }>(importer: () => Promise<T>) {
  return async () => {
    try {
      return await importer()
    } catch (error) {
      if (!sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
        sessionStorage.setItem(CHUNK_RELOAD_KEY, '1')
        window.location.reload()
        return new Promise<T>(() => undefined)
      }
      throw error
    }
  }
}

export function retryChunkLoad() {
  sessionStorage.removeItem(CHUNK_RELOAD_KEY)
  window.location.reload()
}
