import { BrowserWindow, Menu, MenuItem, dialog, ipcMain } from 'electron'
import {
  BUILD_CONTEXT_MENU,
  MENU_CLICKED,
  MenuType,
  PICK_UP_FILE,
  SETUP_SQLITE_CONNNECTION
} from '../../common/const'
import { ConnectionSetup } from '../../common/types'

export function setupIpcHandle(window: BrowserWindow) {
  setupContextMenu(window)

  setupFilePicker()

  setupConnection()
}
function setupConnection() {
  ipcMain.handle(SETUP_SQLITE_CONNNECTION, (event, args: ConnectionSetup) => {})
}

/**
 * 利用Electron的API选取数据库文件/新数据库保存的目录
 * @author YoRolling
 *
 */
function setupFilePicker() {
  ipcMain.handle(PICK_UP_FILE, (event, args: { type: 1 | 2 }) => {
    console.log(args)
    const { type } = args
    const filters = [
      { name: 'SQLite DB', extensions: ['sqlite', 'sqlite3', 'db', 'db3', 's3db', 'sl3'] },
      { name: 'All Files', extensions: ['*'] }
    ]
    if (type === 2) {
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
  ipcMain.handle(BUILD_CONTEXT_MENU, (event, args: { type: MenuType }) => {
    const menu = Menu.buildFromTemplate([
      new MenuItem({
        type: 'normal',
        click: (menuItem, window, event) => {
          window?.webContents.send(MENU_CLICKED, menuItem.id)
        },
        label: 'Create Connection'
      })
    ])
    menu.popup({
      window
    })
  })
}
