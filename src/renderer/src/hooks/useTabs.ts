import { MSG_BACKEND_TYPE, Tab } from '@src/common/types'
import { useSyncExternalStore } from 'react'
const { ipcRenderer } = window.electron
let tabs: Tab[] = []
export default function useTabs() {
  const tabs = useSyncExternalStore(subscribe, getSnapshot)
  return tabs
}

function subscribe(callback) {
  const off = ipcRenderer.on(MSG_BACKEND_TYPE.TAB_CHANGED, (_event, args) => {
    tabs = args
    callback()
  })
  return () => {
    off()
  }
}
function getSnapshot() {
  return tabs
}
