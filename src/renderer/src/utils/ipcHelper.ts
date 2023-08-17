import { IPCMessage, IpcResult } from '@src/common/types'

const { invoke } = window.electron.ipcRenderer
function unwrap<T extends object>(result: IpcResult<T>) {
  if (!result) {
    return result
  }
  if ('error' in result) {
    throw result.error
  }
  return result
}

export async function invokeIpc<T extends object>(
  channel: IPCMessage,
  args: unknown
) {
  const result: IpcResult<T> = await invoke(channel, args)
  return unwrap(result)
}
