import { BrowserWindow, Menu, dialog, ipcMain, shell } from 'electron'
import {
  BUILD_CONTEXT_MENU,
  CLOSE_TAB,
  CONNECTION_CHANGED,
  CONN_CLOSE,
  CONTEXT_MENU,
  EXEC_SQL,
  PICK_UP_FILE,
  SETUP_SQLITE_CONNNECTION,
  TAB_CHANGED
} from '../../common/const'
import { v4 as uuid4 } from 'uuid'
import Database from 'better-sqlite3'
import { Subject } from 'rxjs'
import { filter } from 'rxjs/operators'
import {
  ActionType,
  Connection,
  ConnectionSetup,
  ConnectionSetupType,
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

export function setupIpcHandle(window: BrowserWindow) {
  window.webContents.on('did-finish-load', () => {
    window.webContents.send(CONNECTION_CHANGED, connectionList)
    window.webContents.send(TAB_CHANGED, tabs)
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
      window.webContents.send(TAB_CHANGED, tabs)
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
          }
          break
        case ActionType.Remove:
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
          break
        case ActionType.Initial:
          break
      }

      window.webContents.send(CONNECTION_CHANGED, connectionList)
    })

  restoreStatus()
  handleInnerEmit()
  register(SETUP_SQLITE_CONNNECTION, buildConnect)
  register(CONN_CLOSE, closeConnection)
  register(PICK_UP_FILE, setupFilePicker)
  register(BUILD_CONTEXT_MENU, setupContextMenu)
  register(EXEC_SQL, handleSqlExec)
  register(CLOSE_TAB, closeTab)
  register(TAB_CHANGED, tabsChange)
}
function register<T>(channel, handle: (args: T) => unknown) {
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
    if (connectionMap.has(uuid)) {
      const conn = connectionMap.get(uuid)
      conn?.close()
      connectionSubject.next({
        type: ActionType.Remove,
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

function setupContextMenu(args: { type: MenuType; payload: unknown }) {
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
  const stmt = connection.prepare(sql)
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
  emitter.on('MENU_CLIKED', (args) => {
    const { action, payload } = args
    switch (action) {
      case CONTEXT_MENU.Create_Query:
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
        break
      case CONTEXT_MENU.Close_Conn:
        closeConnection(payload as Connection)
        break
      case CONTEXT_MENU.Run_SQL:
        // eslint-disable-next-line no-case-declarations
        const {
          path,
          args: { uuid }
        } = payload as { path: string[]; args: Connection }
        runSQL(uuid, path[0])
        break
      case CONTEXT_MENU.Export_SQL:
        exportSql(payload as Connection)
    }
  })
}

function closeTab(tab: Tab) {
  tabsSubject.next({
    type: ActionType.Remove,
    payload: tab
  })
}

function tabsChange(value: string) {
  tabs = tabs.map((v) => {
    return { ...v, active: false }
  })
  tabsSubject.next({
    type: ActionType.Patch,
    payload: { active: true, uuid: value } as Tab
  })
}

async function runSQL(uuid: string, filePath: string) {
  const conn = connectionMap.get(uuid)
  if (conn === undefined) {
    dialog.showErrorBox('Run SQL Error', 'Can not Found Opened Connection')
    return
  }

  try {
    const fd = await open(filePath, 'r')
    const rawSQL = await fd.readFile({ encoding: 'utf-8' })
    const transaction = conn.transaction(() => {
      conn.exec(rawSQL)
    })
    transaction()
    fd.close()
  } catch (error) {
    // pass by
    dialog.showErrorBox('Run SQL Error', (error as Error).message)
  }
}

async function exportSql(conn: Connection) {
  console.log('export sql', conn)
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
  console.log(uuid, Array.from(connectionMap.keys()))
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
