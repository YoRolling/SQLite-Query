import { emitter } from '@renderer/eventbus'
import { MSG_BACKEND } from '@src/common/const'
import { MSG_BACKEND_TYPE } from '@src/common/types'

const { on } = window.electron.ipcRenderer

on(
  MSG_BACKEND,
  (evnet, { type, payload }: { type: MSG_BACKEND_TYPE; payload: unknown }) => {
    emitter.emit(type, payload)
  }
)
