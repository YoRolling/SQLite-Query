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
import { invokeIpc } from '@renderer/utils/ipcHelper'
import { BUILD_CONTEXT_MENU, EXEC_SQL } from '@src/common/const'
import { Connection, MenuType } from '@src/common/types'
import { IconDatabase, IconTable } from '@tabler/icons-react'
import { useStore } from 'jotai'
import { MouseEvent, useEffect, useState } from 'react'

export default function Sidebar() {
  const theme = useMantineTheme()
  const store = useStore()
  const [connectionList, setConnectionList] = useState<Connection[]>([])
  const [activedConn, setActiveConn] = useState<string>('')
  const [tables, updateTables] = useState<unknown[]>([])
  useEffect(() => {
    const unSub = store.sub(dbList, () => {
      const list = store.get(dbList)
      const len = list.length
      if (list[len - 1] !== undefined) {
        setActiveConn(list[len - 1].uuid)
      }
      setConnectionList(list)
    })
    return () => {
      unSub()
    }
  }, [])

  useEffect(() => {
    async function selectTables() {
      try {
        const { data } = await invokeIpc<{ data: unknown[] }>(EXEC_SQL, {
          uuid: activedConn,
          sql: `SELECT * FROM sqlite_master WHERE type='table';`
        })
        updateTables(data)
      } catch (error) {
        Notifications.show({
          message: (error as Error).message
        })
      }
    }
    if (activedConn !== '') {
      selectTables()
    }
  }, [activedConn])

  const onContextMenu = async (event: MouseEvent<HTMLButtonElement>, payload: unknown) => {
    event.preventDefault()
    event.stopPropagation()
    try {
      await invokeIpc(BUILD_CONTEXT_MENU, {
        type: MenuType.CONTEXT_DB,
        payload
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
              onContextMenu={(event) => onContextMenu(event, v)}
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
