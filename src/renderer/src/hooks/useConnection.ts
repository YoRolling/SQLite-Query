import { CONNECTION_CHANGED } from '@src/common/const'
import { Connection } from '@src/common/types'
import { useEffect, useState } from 'react'
const { ipcRenderer } = window.electron

export default function useConnection(): [Connection[]] {
  const [list, modifier] = useState<Connection[]>([])
  useEffect(() => {
    const handle = (_event, args: Connection[]) => {
      modifier(() => [...args])
    }
    const unListen = ipcRenderer.on(CONNECTION_CHANGED, handle)
    return () => {
      unListen()
    }
  }, [])
  return [list]
}
