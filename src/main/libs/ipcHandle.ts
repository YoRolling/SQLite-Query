import { BrowserWindow, Menu, dialog, ipcMain } from 'electron'
import {
  BUILD_CONTEXT_MENU,
  CONNECTION_CHANGED,
  CONN_CLOSE,
  EXEC_SQL,
  PICK_UP_FILE,
  SETUP_SQLITE_CONNNECTION
} from '../../common/const'

import Database from 'better-sqlite3'
import {
  Connection,
  ConnectionSetup,
  ConnectionSetupType,
  IpcResult,
  MenuType,
  QueryArgs,
  Result
} from '../../common/types'
import { buildContextMenu } from './menu'
/**
 * Connection Map
 */
const connectionMap = new Map<string, Database.Database>()
/**
 * Connection List, use it as Sidebar Menu's data-source,
 * so as to avoid we pass `Database instance` to renderer process
 */
const connectionList: Connection[] = []

const toString = Object.prototype.toString

let mapProxy: typeof connectionMap

export function setupIpcHandle(window: BrowserWindow) {
  window.webContents.on('did-finish-load', () => {
    window.webContents.send(CONNECTION_CHANGED, connectionList)
  })
  restoreStatus()
  setupContextMenu(window)

  setupFilePicker()

  setupConnection()

  closeConnection()

  handleSqlExec()
  mapProxy = new Proxy(connectionMap, {
    get(target, p, receiver) {
      const value = Reflect.get(target, p, receiver)
      if (toString.call(value) === '[object Function]') {
        if (p === 'delete' || p === 'set') {
          window.webContents.send(CONNECTION_CHANGED, connectionList)
        }
        return value.bind(target)
      } else {
        return value
      }
    }
  })
}

function restoreStatus() {
  // restore connection list
  // restore Query tabs
}
function setupConnection() {
  ipcMain.handle(SETUP_SQLITE_CONNNECTION, (_event, args: ConnectionSetup) => {
    return buildConnect(args)
  })
}

function buildConnect(options: ConnectionSetup): Connection {
  const { path, uuid } = options
  const db = new Database(path, {
    timeout: 5e3,
    readonly: false
  })
  const connecton = { ...options, opened: true }
  connectionList.push(connecton)
  mapProxy.set(uuid, db)
  return connecton
}
/**
 * Close the special Database Connection
 * @author YoRolling
 * @since  1.0.0
 */
function closeConnection() {
  ipcMain.handle(CONN_CLOSE, (_event, { uuid }: { uuid: string }) => {
    try {
      if (mapProxy.has(uuid)) {
        const conn = mapProxy.get(uuid)
        const item = connectionList.find((v) => v.uuid === uuid)
        if (item !== undefined) {
          item.opened = false
        }
        conn?.close()
        mapProxy.delete(uuid)
        return true
      } else {
        return false
      }
    } catch (error) {
      if (error instanceof Error) {
        return error
      } else {
        return new Error(error as string)
      }
    }
  })
  // conn
}
/**
 * 利用Electron的API选取数据库文件/新数据库保存的目录
 * @author YoRolling
 *
 */
function setupFilePicker() {
  ipcMain.handle(PICK_UP_FILE, (_event, args: { type: ConnectionSetupType }) => {
    const { type } = args
    const filters = [
      { name: 'SQLite DB', extensions: ['sqlite', 'sqlite3', 'db', 'db3', 's3db', 'sl3'] },
      { name: 'All Files', extensions: ['*'] }
    ]
    if (type === ConnectionSetupType.Create) {
      return dialog.showSaveDialog({
        properties: ['createDirectory'],
        filters
      })
    }
    const options = {
      properties: ['openFile'],
      filters
    }
    return dialog.showOpenDialog(options as Electron.OpenDialogOptions)
  })
}

function setupContextMenu(window: BrowserWindow) {
  ipcMain.handle(BUILD_CONTEXT_MENU, (_event, args: { type: MenuType; payload: unknown }) => {
    const menu = Menu.buildFromTemplate(buildContextMenu(args))
    menu.popup({
      window
    })
  })
}

function handleSqlExec() {
  ipcMain.handle(EXEC_SQL, (_event, payload: QueryArgs): IpcResult<Result> => {
    const { uuid, sql } = payload
    const hasOpend = mapProxy.has(uuid)
    if (hasOpend === false) {
      return { error: new Error('The database is not open, an error may occur ', {}) }
    }
    const connection = mapProxy.get(uuid)
    const stmt = connection?.prepare(sql)
    const info = stmt?.run()
    const data = stmt?.all() ?? []
    const columns = stmt?.columns() ?? []
    return {
      data,
      columns,
      info
    }
  })
}
