import { BrowserWindow, Menu, dialog, ipcMain, shell } from 'electron'

import { v4 as uuid4 } from 'uuid'
import Database, { Statement } from 'better-sqlite3'
import { Subject } from 'rxjs'
import { filter } from 'rxjs/operators'
import {
  ActionType,
  Connection,
  ConnectionSetup,
  ConnectionSetupType,
  IPCMessage,
  IpcResult,
  MSG_BACKEND_TYPE,
  MenuType,
  QueryArgs,
  Result,
  Tab,
  TableInfo
} from '../../common/types'
import { buildContextMenu } from './menu'
import { emitter } from './eventbus'
import { open } from 'fs/promises'
import { createWriteStream } from 'fs'
import { CONTEXT_MENU } from '../../common/const'
/**
 * Connection Map
 */
const connectionMap = new Map<string, Database.Database>()
/**
 * Connection List, use it as Sidebar Menu's data-source,
 * so as to avoid we pass `Database instance` to renderer process
 */
let connectionList: Connection[] = []

let tabs: Tab[] = []

const tabsSubject: Subject<
  | { type: ActionType; payload: Tab }
  | { type: ActionType.RemoveAll; payload: string }
> = new Subject()
const connectionSubject: Subject<{
  type: ActionType
  payload?: Database.Database
  id: string
  connection?: Connection
}> = new Subject()
let win: BrowserWindow | null = null

function send(
  channel: Extract<IPCMessage, 'CONNECTION_CHANGED' | 'TAB_CHANGED'>,
  payload: unknown
) {
  win!.webContents.send(channel, payload)
}
export function setupIpcHandle(window: BrowserWindow) {
  win = window
  window.webContents.on('did-finish-load', () => {
    send('CONNECTION_CHANGED', connectionList)
    send('TAB_CHANGED', tabs)
  })
  tabsSubject
    .pipe(
      filter((v) => {
        const { type, payload } = v
        if (type === ActionType.RemoveAll) {
          return true
        }
        const { uuid } = payload
        const target = tabs.find((z) => z.uuid === uuid)
        if (type === ActionType.Add) {
          return target === undefined
        } else {
          return target !== undefined
        }
      })
    )
    .subscribe(({ type, payload: tab }) => {
      switch (type) {
        case ActionType.Add:
          tabs.push(tab)
          break
        case ActionType.Remove:
          tabs = tabs.filter((v) => v.uuid !== tab.uuid)
          break
        case ActionType.Initial:
          break
        case ActionType.Patch:
          tabs = tabs.map((v) => {
            if (v.uuid === tab.uuid) {
              return { ...v, ...tab }
            } else {
              return v
            }
          })
          break
        case ActionType.RemoveAll:
          tabs = tabs.filter((v) => v.relateConn !== (tab as string))
          break
      }
      send('TAB_CHANGED', tabs)
    })

  connectionSubject
    .pipe(
      filter((v) => {
        const { id, type } = v
        if (type === ActionType.Add) {
          return !connectionMap.has(id)
        } else {
          return connectionMap.has(id)
        }
      })
    )
    .subscribe(({ type, payload, id, connection }) => {
      switch (type) {
        case ActionType.Add:
          connectionMap.set(id, payload!)
          if (connectionList.find((v) => v.uuid === id) === undefined) {
            connectionList.push(connection!)
          } else {
            connectionList = connectionList.map((v) => {
              if (v.uuid === id) {
                return { ...v, ...connection }
              } else {
                return v
              }
            })
          }
          break
        case ActionType.Close:
          connectionMap.delete(id)
          connectionList = connectionList.map((v) => {
            if (v.uuid === id) {
              return { ...v, opened: false }
            } else {
              return v
            }
          })
          break
        case ActionType.Patch:
          connectionMap.set(id, payload!)
          connectionList = connectionList.map((v) => {
            if (v.uuid === id) {
              return { ...v, ...connection }
            } else {
              return v
            }
          })

          break
        case ActionType.Initial:
          break
        case ActionType.Remove:
          connectionMap.delete(id)
          connectionList = connectionList.filter((v) => {
            return v.uuid !== id
          })
          break
      }
      send('CONNECTION_CHANGED', connectionList)
    })

  restoreStatus()
  handleInnerEmit()
  register('SETUP_SQLITE_CONNNECTION', buildConnect)
  register('CONN_CLOSE', closeConnection)
  register('PICK_UP_FILE', setupFilePicker)
  register('BUILD_CONTEXT_MENU', setupContextMenu)
  register('EXEC_SQL', handleSqlExec)
  register('CLOSE_TAB', closeTab)
  register('TAB_CHANGED', tabsChange)
}
function register<T>(channel: IPCMessage, handle: (args: T) => unknown) {
  ipcMain.handle(channel, (_event, args: T) => {
    return handle(args)
  })
}

function restoreStatus() {
  // restore connection list
  // restore Query tabs
}

function buildConnect(options: ConnectionSetup): Connection {
  const { path, uuid } = options
  const db = new Database(path, {
    timeout: 5e3,
    readonly: false
  })
  const connection = { ...options, opened: true }

  connectionSubject.next({
    type: ActionType.Add,
    payload: db,
    id: uuid,
    connection: connection
  })
  return connection
}
/**
 * Close the special Database Connection
 * @author YoRolling
 * @since  1.0.0
 */
function closeConnection({ uuid }: { uuid: string }) {
  try {
    const conn = connectionMap.get(uuid)
    if (conn !== undefined) {
      conn?.close()
      connectionSubject.next({
        type: ActionType.Close,
        payload: conn,
        id: uuid
      })

      tabsSubject.next({
        type: ActionType.RemoveAll,
        payload: uuid
      })

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
  // conn
}
/**
 * 利用Electron的API选取数据库文件/新数据库保存的目录
 * @author YoRolling
 *
 */
function setupFilePicker(args: { type: ConnectionSetupType }) {
  const { type } = args
  const filters = [
    {
      name: 'SQLite DB',
      extensions: ['sqlite', 'sqlite3', 'db', 'db3', 's3db', 'sl3']
    },
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
}

function setupContextMenu(args: { type: MenuType; payload: never }) {
  const menu = Menu.buildFromTemplate(buildContextMenu(args))
  menu.popup()
}

function handleSqlExec(payload: QueryArgs): IpcResult<Result> {
  const { uuid, sql } = payload
  const connection = connectionMap.get(uuid)
  if (connection === undefined) {
    return {
      error: new Error('The database is not open, an error may occur ', {})
    }
  }
  let stmt: Statement
  try {
    stmt = connection.prepare(sql)
  } catch (error) {
    return {
      error: new Error('Something crashed', {})
    }
  }
  try {
    const data = stmt.all()
    const columns = stmt.columns()
    return { data, columns }
  } catch (error) {
    const result = stmt.run()
    return { info: result }
  }
}

function handleInnerEmit() {
  const handler: Record<CONTEXT_MENU, (args: never) => void> = {
    [CONTEXT_MENU.Close_Conn]: closeConnection,
    [CONTEXT_MENU.Create_Query]: createQueryTab,
    [CONTEXT_MENU.Export_SQL]: exportSql,
    [CONTEXT_MENU.Run_SQL]: runSQL,
    [CONTEXT_MENU.Drop_Table]: dropTable,
    [CONTEXT_MENU.Design_Table]: function (): void {
      throw new Error('Function not implemented.')
    },
    [CONTEXT_MENU.Open_Database]: openConnection,
    [CONTEXT_MENU.Delete_Database]: deleteConnection
  }
  emitter.on('MENU_CLIKED', (args) => {
    const { action, payload } = args
    handler[action](payload as never)
  })
}

async function dropTable(args: TableInfo) {
  const { tbl_name } = args
  const buttons = ['Yes,Drop it', 'No, just take me away']
  const controller = new AbortController()
  const signal = controller.signal

  const { response } = await dialog.showMessageBox(win!, {
    message: 'Confirm to Drop Table ' + tbl_name,
    buttons,
    signal
  })
  if (response === 0) {
    // TODO  drop table
  }
  controller.abort()
}

function openConnection(options: Connection): void {
  const { path, uuid } = options
  const db = new Database(path, {
    timeout: 5e3,
    readonly: false
  })
  const connection = { ...options, opened: true }

  connectionSubject.next({
    type: ActionType.Add,
    payload: db,
    id: uuid,
    connection: connection
  })
}

function createQueryTab(payload: unknown) {
  tabs = tabs.map((v) => ({ ...v, active: false }))
  tabsSubject.next({
    type: ActionType.Add,
    payload: {
      label: 'Query',
      uuid: uuid4(),
      subLabel: '',
      relateConn: (payload as Connection).uuid,
      query: '',
      active: true
    }
  })
}

function closeTab(tab: Tab) {
  tabsSubject.next({
    type: ActionType.Remove,
    payload: tab
  })
}

function tabsChange(payload: { uuid: string; query: string }) {
  tabs = tabs.map((v) => {
    return { ...v, active: false }
  })
  tabsSubject.next({
    type: ActionType.Patch,
    payload: { ...payload, active: true } as Tab
  })
}

async function runSQL(payload: Connection) {
  const { uuid } = payload
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: [{ name: 'SQL', extensions: ['sql'] }],
    properties: ['openFile']
  })
  if (canceled === true) {
    return
  }

  const conn = connectionMap.get(uuid)
  if (conn === undefined) {
    dialog.showErrorBox('Run SQL Error', 'Can not Found Opened Connection')
    return
  }

  try {
    const fd = await open(filePaths[0], 'r')
    const rawSQL = await fd.readFile({ encoding: 'utf-8' })
    const transaction = conn.transaction(() => {
      conn.exec(rawSQL)
    })
    transaction()
    fd.close()
    dialog.showMessageBox(win!, {
      message: 'Success',
      detail: 'SQL has been executed successfully'
    })
    win?.webContents.send(MSG_BACKEND_TYPE.DATABASE_CHANGED, uuid)
  } catch (error) {
    // pass by
    dialog.showErrorBox('Run SQL Error', (error as Error).message)
  }
}

async function exportSql(conn: Connection) {
  const win = BrowserWindow.getFocusedWindow()!
  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    filters: [
      {
        extensions: ['sql'],
        name: 'SQL '
      }
    ],
    properties: ['createDirectory']
  })
  if (canceled || filePath === undefined) {
    return
  }
  const { uuid } = conn
  const target = connectionMap.get(uuid)
  if (target === undefined) {
    dialog.showErrorBox('Run SQL Error', 'Can not Found Opened Connection')
    return
  }
  const sqlFileStream = createWriteStream(filePath)
  try {
    const stmt = target.prepare(
      "SELECT * FROM sqlite_master WHERE type='table';"
    )
    const tables = stmt.all() as TableInfo[]

    tables.map((z) => {
      sqlFileStream.write(`-- CREATE TABLE ${z.tbl_name}\n`)
      sqlFileStream.write(`${z.sql};\n`)
      sqlFileStream.write(`-- CREATE TABLE ${z.tbl_name} END\n`)
    })
    sqlFileStream.end()
    sqlFileStream.close()
    const result = await dialog.showMessageBox(win, {
      message: 'Export Done',
      buttons: ['OK', 'Open File']
    })

    win.webContents.send(MSG_BACKEND_TYPE.DATABASE_CHANGED, uuid)
    switch (result.response) {
      case 0:
        break
      case 1:
        shell.openPath(filePath)
        break
    }
  } catch (error) {
    dialog.showErrorBox('Run SQL Error', 'Can not Found Opened Connection')
  }
}

/**
 * Delete the Special Connection
 * @author YoRolling
 * @param {Connection} params
 */
async function deleteConnection(params: Connection) {
  const { uuid } = params
  connectionSubject.next({
    type: ActionType.Remove,
    connection: params,
    id: uuid
  })
}
