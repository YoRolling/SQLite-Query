import { MSG_BACKEND_TYPE } from '@src/common/types'
import { useEffect, useRef } from 'react'
const { on, removeAllListeners: off } = window.electron.ipcRenderer

export default function useIpcMsg(
  type: MSG_BACKEND_TYPE,
  handle: (msg: unknown) => void
) {
  const currentHandle = useRef<(msg: unknown) => void>()

  useEffect(() => {
    currentHandle.current = handle
  }, [handle])

  useEffect(() => {
    function handle(_, msg: unknown) {
      currentHandle.current?.(msg)
    }
    on(type, handle)
    return () => {
      off(type)
    }
  }, [])
}
