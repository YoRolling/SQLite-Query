import { Connection } from '@src/common/types'
import { useSyncExternalStore } from 'react'
const { ipcRenderer } = window.electron

let connectionList: Connection[] = []
export default function useConnections(): [Connection[]] {
  const tabs = useSyncExternalStore(subscribe, getSnapshot)
  return [tabs]
}

function subscribe(callback) {
  const off = ipcRenderer.on('CONNECTION_CHANGED', (_event, args) => {
    console.log({ args })
    connectionList = args
    callback()
  })
  return () => {
    off()
  }
}
function getSnapshot() {
  return connectionList
}
