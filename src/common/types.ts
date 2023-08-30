export type Connection = Omit<ConnectionSetup, 'type'> & {
  opened: boolean
}
export type Tab = {
  active: boolean
  label: string
  subLabel?: string
  uuid: string
  relateConn: string
  query: string
}
export type DialogRetureValue =
  | Electron.OpenDialogReturnValue
  | Electron.SaveDialogReturnValue
export type ConnectionSetup = {
  label: string
  path: string
  type: ConnectionSetupType
  uuid: string
}
export enum ConnectionSetupType {
  Create = 1,
  Open,
  Memory
}

export enum ActionType {
  Add = 0,
  Remove,
  Patch,
  Initial,
  RemoveAll,
  Close
}
export enum MenuType {
  CONTEXT_DB,
  CONTEXT_TABLE,
  CONTEXT_QUERY,
  CONTEXT_TABLE_RESULT,
  GLOBAL
}
export type QueryArgs = {
  uuid: string
  sql: string
  [k: string]: unknown
}
export type Result = {
  data?: unknown[]
  columns?: unknown[]
  info?: {
    changes: number
    lastInsertRowid: number | bigint
  }
}

export type IpcResult<T> =
  | {
      error: Error | string
    }
  | T

export type TableInfo = {
  sql: string
  type: string
  name: string
  tbl_name: string
  rootpage: number
  conn: string
}
// ipc message channel from main to Renderer
export enum MSG_BACKEND_TYPE {
  DATABASE_CHANGED = 'DATABASE_CHANGED',
  MENU_CLICKED = 'MENU_CLICKED',
  CONNECTION_CHANGED = 'CONNECTION_CHANGED',
  TAB_CHANGED = 'TAB_CHANGED'
}
// type for ipc Message Channel which from renderer to main
export type IPCMessage =
  | 'EXEC_SQL'
  | 'CLOSE_TAB'
  | 'BUILD_CONTEXT_MENU'
  | 'PICK_UP_FILE'
  | 'SETUP_SQLITE_CONNNECTION'
  | 'TAB_CHANGED'
  | 'CONN_CLOSE'
  | 'CLOSE_TAB'
  | 'DROP_TABLE'
  | 'RUN_SQL'
  | 'EXPORT_SQL'
  | 'EXEC_SQL'
  | 'RESTART_APP'
  | 'QUIT'
