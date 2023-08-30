import {
  app,
  BrowserWindow,
  KeyboardEvent,
  MenuItem,
  MenuItemConstructorOptions
} from 'electron'
import { CONTEXT_MENU } from '../../common/const'
import {
  Connection,
  MenuType,
  MSG_BACKEND_TYPE,
  TableInfo
} from '../../common/types'
import { emitter } from './eventbus'

export const GlobalMenu: MenuItemConstructorOptions[] = [
  {
    label: '文件',
    submenu: [
      {
        label: 'Create Database',
        accelerator: 'CmdOrCtrl+N',
        click: () => {
          // 处理新建菜单项的点击事件
          // window?.webContents.send()
        }
      },
      {
        label: 'Open Database',
        accelerator: 'CmdOrCtrl+O',
        click: () => {
          // 处理打开菜单项的点击事件
        }
      },
      { type: 'separator' },
      { label: 'Preferences', accelerator: 'CmdOrCtrl+,', click: () => {} },
      { type: 'separator' },
      {
        label: '退出',
        accelerator: 'CmdOrCtrl+Q',
        click: () => {
          app.quit()
        }
      }
    ]
  },
  {
    label: '编辑',
    submenu: [
      {
        label: '撤销',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
      },
      {
        label: '重做',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
      },
      { type: 'separator' },
      {
        label: '剪切',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: '复制',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: '粘贴',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: '全选',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectAll'
      }
    ]
  },
  {
    label: 'Query',
    submenu: [
      {
        label: 'New Query',
        id: 'New Query',
        click: () => {}
      }
    ]
  }
  // 添加更多菜单项...
]
const itemClicked = (args: unknown) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (
    item: MenuItem,
    window: BrowserWindow | undefined,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _event: KeyboardEvent
  ) => {
    window?.webContents.send(MSG_BACKEND_TYPE.MENU_CLICKED, {
      id: item.id,
      args
    })
  }
}
export function buildContextMenu(
  args:
    | {
        type: MenuType.CONTEXT_DB
        payload: Connection
      }
    | { type: MenuType.CONTEXT_TABLE; payload: TableInfo }
    | {
        type: Exclude<MenuType, MenuType.CONTEXT_DB | MenuType.CONTEXT_TABLE>
        payload: unknown
      }
): MenuItemConstructorOptions[] {
  const { type, payload } = args
  let result: MenuItemConstructorOptions[] = []
  switch (type) {
    case MenuType.CONTEXT_DB:
      result = buildDatabaseContextMenu(payload)
      break
    case MenuType.CONTEXT_TABLE:
      result = buildTableContextMenu(payload)
      break
    case MenuType.CONTEXT_QUERY:
      break
    case MenuType.CONTEXT_TABLE_RESULT:
      break
  }
  return result
}

function buildDatabaseContextMenu(
  args: Connection
): MenuItemConstructorOptions[] {
  if (args.opened === false) {
    return [
      {
        label: 'Open Database',
        id: CONTEXT_MENU.Open_Database,
        click: () => {
          emitter.emit('MENU_CLICKED', {
            action: CONTEXT_MENU.Open_Database,
            payload: args
          })
        }
      },
      {
        label: 'Delete Connection',
        id: CONTEXT_MENU.Delete_Database,
        click: () => {
          emitter.emit('MENU_CLICKED', {
            action: CONTEXT_MENU.Delete_Database,
            payload: args
          })
        }
      }
    ]
  }
  return [
    {
      label: 'Create Query',
      id: CONTEXT_MENU.Create_Query,
      click: () => {
        emitter.emit('MENU_CLICKED', {
          action: CONTEXT_MENU.Create_Query,
          payload: args
        })
      }
    },
    {
      label: 'Run SQL',
      id: CONTEXT_MENU.Run_SQL,
      click: () => {
        emitter.emit('MENU_CLICKED', {
          action: CONTEXT_MENU.Run_SQL,
          payload: args
        })
      }
    },
    {
      label: 'Export SQL',
      id: CONTEXT_MENU.Export_SQL,
      click: () => {
        emitter.emit('MENU_CLICKED', {
          action: CONTEXT_MENU.Export_SQL,
          payload: args
        })
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Close Database',
      id: CONTEXT_MENU.Close_Conn,
      click: () => {
        emitter.emit('MENU_CLICKED', {
          action: CONTEXT_MENU.Close_Conn,
          payload: args
        })
      }
    },
    {
      label: 'Delete Connection',
      id: CONTEXT_MENU.Delete_Database,
      click: () => {
        emitter.emit('MENU_CLICKED', {
          action: CONTEXT_MENU.Delete_Database,
          payload: args
        })
      }
    }
  ]
}

function buildTableContextMenu(args: TableInfo): MenuItemConstructorOptions[] {
  return [
    {
      label: 'Create Query',
      id: CONTEXT_MENU.Create_Query,
      click: itemClicked(args)
    },
    {
      label: 'Design Table',
      id: CONTEXT_MENU.Design_Table,
      click: itemClicked(args)
    },
    {
      type: 'separator'
    },

    {
      label: 'Drop Table',
      id: CONTEXT_MENU.Drop_Table,
      click: itemClicked(args)
    }
  ]
}
