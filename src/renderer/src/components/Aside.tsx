import { MouseEvent } from 'react'
import { NavLink, Navbar } from '@mantine/core'
import { IconDatabase } from '@tabler/icons-react'
import { BUILD_CONTEXT_MENU, MenuType } from 'src/common/const'
export default function Sidebar() {
  const noop = async (event: MouseEvent<HTMLButtonElement>) => {
    // event.stop
    event.preventDefault()
    event.stopPropagation()
    try {
      const result = await window.electron.ipcRenderer.invoke(BUILD_CONTEXT_MENU, {
        type: MenuType.CONTEXT
      })
    } catch (error) {
      console.error('BUILD_CONTEXT_MENU Error:', error)
    }
  }
  return (
    <Navbar width={{ base: 300 }}>
      <Navbar.Section grow>
        <NavLink
          variant="filled"
          label="ABC"
          active
          icon={<IconDatabase size={16} />}
          onContextMenu={noop}
        />
        <NavLink variant="filled" label="EFG" icon={<IconDatabase size={16} />} />
      </Navbar.Section>
    </Navbar>
  )
}
