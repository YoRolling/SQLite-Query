import { ConnectionActionType } from '@src/common/types'
import { Connection } from '@src/common/types'
import { useEffect, useState } from 'react'
const { ipcRenderer } = window.electron
export default function useConnection(): [
  Connection[],
  (conn: Connection) => void,
  (conn: Connection) => void
] {
  const [list, modifier] = useState<Connection[]>([])
  useEffect(() => {
    const handle = (
      event,
      args: { type: ConnectionActionType; payload: Connection | Connection[] }
    ) => {
      const { type, payload } = args
      switch (type) {
        case ConnectionActionType.Add:
          add(payload as Connection)
          break
        case ConnectionActionType.Initial:
          modifier(payload as Connection[])
          break
        case ConnectionActionType.Remove:
          modifier((value) => {
            return value.filter((v) => v.uuid !== (payload as Connection).uuid)
          })
          break
        case ConnectionActionType.Patch:
          // eslint-disable-next-line no-case-declarations
          const { uuid } = payload as Connection
          modifier((value) => {
            return value.map((v) => {
              return v.uuid === uuid ? (payload as Connection) : v
            })
          })
          break
      }
    }
    const unListen = ipcRenderer.on('CONNECTION_CHANGED', handle)
    return () => {
      unListen()
    }
  }, [])
  const add = (connection: Connection) => {
    modifier((value) => [...value, connection])
  }
  const pacth = (newVal: Connection) => {
    return modifier((value) => {
      return value.map((v) => (v.uuid === newVal.uuid ? newVal : v))
    })
  }
  return [list, add, pacth]
}
