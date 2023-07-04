import { app, MenuItemConstructorOptions } from 'electron'

export const GlobalMenu: MenuItemConstructorOptions[] = [
  {
    label: '文件',
    submenu: [
      {
        label: 'Create Database',
        accelerator: 'CmdOrCtrl+N',
        click: (item, window, event) => {
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
