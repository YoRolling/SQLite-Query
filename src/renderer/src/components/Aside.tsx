import { MouseEvent } from 'react'
import { NavLink, Navbar, Text, Group, Button } from '@mantine/core'
import { IconDatabase } from '@tabler/icons-react'
import { BUILD_CONTEXT_MENU } from '@src/common/const'
import { MenuType } from '@src/common/types'

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
      <Navbar.Section>
        <Group h={50} position="apart" style={{ padding: '0 12px' }}>
          <Text
            variant="gradient"
            gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
            sx={{ fontFamily: 'Greycliff CF, sans-serif' }}
            ta="center"
            fz="xl"
            fw={700}
          >
            SQLite Query
          </Text>
          <Button
            compact
            variant="gradient"
            gradient={{ from: '#ed6ea0', to: '#ec8c69', deg: 35 }}
            leftIcon={<IconDatabase size="1rem" />}
          >
            New
          </Button>
        </Group>
      </Navbar.Section>
      <Navbar.Section grow>
        {/* <NavLink
          key={v.uuid}
          variant="filled"
          label={v.label}
          active={v.opened}
          icon={<IconDatabase size={16} />}
          onContextMenu={noop}
        /> */}
      </Navbar.Section>
    </Navbar>
  )
}
