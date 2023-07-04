export type Connection = {
  label: string
  path: string
  opened: boolean
  uuid: string
}
export type Tab = {
  label: string
  subLabel: string
  uuid: string
  relateConn: string
  query: string
}
export type DialogRetureValue = Electron.OpenDialogReturnValue
export type ConnectionSetup = {
  label: string
  path: string
  type: 1 | 2
}

export enum ConnectionActionType {
  Add = 0,
  Remove,
  Patch,
  Initial
}
export enum MenuType {
  CONTEXT,
  GLOBAL
}
