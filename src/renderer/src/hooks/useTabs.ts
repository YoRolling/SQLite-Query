import { TAB_CHANGED } from '@src/common/const'
import { Tab } from '@src/common/types'
import { useSyncExternalStore } from 'react'
const { ipcRenderer } = window.electron
let tabs: Tab[] = []
export default function useTabs() {
  const tabs = useSyncExternalStore(subscribe, getSnapshot)
  return tabs
}

function subscribe(callback) {
  const off = ipcRenderer.on(TAB_CHANGED, (_event, args) => {
    tabs = args
    console.log(TAB_CHANGED, args)
    callback()
  })
  return () => {
    off()
  }
}
function getSnapshot() {
  return tabs
}