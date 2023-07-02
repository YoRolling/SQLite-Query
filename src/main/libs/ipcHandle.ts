import { BrowserWindow, Menu, MenuItem, ipcMain } from 'electron'
import { BUILD_CONTEXT_MENU, MENU_CLICKED, MenuType } from '../../common/const'

export function setupIpcHandle(window: BrowserWindow) {
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
