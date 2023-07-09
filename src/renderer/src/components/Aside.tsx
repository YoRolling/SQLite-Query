import {
  Button,
  Group,
  NavLink,
  Navbar,
  ScrollArea,
  Text,
  useMantineTheme,
  rem
} from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { dbList } from '@renderer/store'
import { BUILD_CONTEXT_MENU, EXEC_SQL } from '@src/common/const'
import { Connection, IpcResult, MenuType, Result } from '@src/common/types'
import { IconDatabase, IconTable } from '@tabler/icons-react'
import { useStore } from 'jotai'
import { MouseEvent, useEffect, useState } from 'react'
const { ipcRenderer } = window.electron

export default function Sidebar() {
  const theme = useMantineTheme()
  const store = useStore()
  const [connectionList, setConnectionList] = useState<Connection[]>([])
  const [activedConn, setActiveConn] = useState<string>('')
  const [tables, updateTables] = useState<unknown[]>([])
  useEffect(() => {
    const unSub = store.sub(dbList, () => {
      const list = store.get(dbList)
      setConnectionList(list)
    })
    return () => {
      unSub()
    }
  }, [])

  useEffect(() => {
    async function selectTables() {
      const { error, data = [] }: IpcResult<Result> = await ipcRenderer.invoke(EXEC_SQL, {
        uuid: activedConn,
        sql: `SELECT * FROM sqlite_master WHERE type='table';`
      })
      if (error) {
        Notifications.show({
          message: error.toString()
        })
        return
      }

      updateTables(data)
    }
    if (activedConn !== '') {
      selectTables()
    }
  }, [activedConn])

  const onContextMenu = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    try {
      await window.electron.ipcRenderer.invoke(BUILD_CONTEXT_MENU, {
        type: MenuType.CONTEXT_DB
      })
    } catch (error) {
      console.error('BUILD_CONTEXT_MENU Error:', error)
    }
  }

  return (
    <Navbar width={{ base: 300 }} withBorder>
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
      <Navbar.Section grow component={ScrollArea}>
        {connectionList.map((v) => {
          return (
            <NavLink
              key={v.uuid}
              variant="filled"
              label={v.label}
              active={v.opened}
              icon={<IconDatabase size={16} />}
              onContextMenu={onContextMenu}
              onClick={() => setActiveConn(v.uuid)}
            ></NavLink>
          )
        })}
      </Navbar.Section>
      <Navbar.Section
        grow
        component={ScrollArea}
        sx={{
          paddingTop: theme.spacing.sm,
          borderTop: `${rem(1)} solid ${
            theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
          }`
        }}
      >
        {(tables as [{ name: string }]).map((v, idx) => {
          return (
            <NavLink
              key={idx}
              variant="filled"
              label={v.name}
              icon={<IconTable size={16} />}
            ></NavLink>
          )
        })}
      </Navbar.Section>
    </Navbar>
  )
}