import {
  Button,
  Group,
  NavLink,
  Navbar,
  ScrollArea,
  Text,
  useMantineTheme,
  rem,
  NavLinkProps
} from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import useIpcMsg from '@renderer/hooks/useIpcMsg'
import { dbList } from '@renderer/store'
import { invokeIpc } from '@renderer/utils/ipcHelper'
import { BUILD_CONTEXT_MENU, EXEC_SQL } from '@src/common/const'
import {
  Connection,
  MSG_BACKEND_TYPE,
  MenuType,
  TableInfo
} from '@src/common/types'
import {
  IconDatabase,
  IconPlug,
  IconPlugX,
  IconTable
} from '@tabler/icons-react'
import { useStore } from 'jotai'
import { MouseEvent, useCallback, useEffect, useState } from 'react'

export default function Sidebar() {
  const theme = useMantineTheme()
  const store = useStore()
  const [connectionList, setConnectionList] = useState<Connection[]>([])
  const [activedConn, setActiveConn] = useState<string>('')
  const [tables, updateTables] = useState<TableInfo[]>([])
  useEffect(() => {
    const unSub = store.sub(dbList, () => {
      const list = store.get(dbList)
      const len = list.length
      if (list[len - 1] !== undefined) {
        setActiveConn(list[len - 1].uuid)
      }
      console.log(list)
      setConnectionList(list)
    })
    return () => {
      unSub()
    }
  }, [])

  useIpcMsg(MSG_BACKEND_TYPE.DATABASE_CHANGED, (msg) => {
    const uuid = msg as string
    if (uuid === activedConn) {
      selectTables(uuid)
    }
  })

  const selectTables = useCallback(async (uuid: string) => {
    try {
      const { data } = await invokeIpc<{ data: TableInfo[] }>(EXEC_SQL, {
        uuid,
        sql: `SELECT * FROM sqlite_master WHERE type='table';`
      })
      const tables = data.map((v) => ({ ...v, conn: uuid }))
      updateTables(tables)
    } catch (error) {
      Notifications.show({
        message: (error as Error).message
      })
    }
  }, [])
  useEffect(() => {
    if (activedConn !== '') {
      selectTables(activedConn)
    }
  }, [activedConn])

  const onContextMenu = async (
    event: MouseEvent<HTMLButtonElement>,
    payload: Connection | TableInfo,
    type: MenuType = MenuType.CONTEXT_DB
  ) => {
    event.preventDefault()
    event.stopPropagation()
    try {
      await invokeIpc(BUILD_CONTEXT_MENU, {
        type: type,
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
          const props: NavLinkProps = {}
          if (v.opened) {
            props.active = true
          }
          return (
            <NavLink
              key={v.uuid}
              label={v.label}
              {...props}
              icon={<IconDatabase size={16} />}
              onContextMenu={(event) => onContextMenu(event, v)}
              onClick={() => setActiveConn(v.uuid)}
              rightSection={
                v.opened ? <IconPlug size="1rem" /> : <IconPlugX size="1rem" />
              }
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
            theme.colorScheme === 'dark'
              ? theme.colors.dark[4]
              : theme.colors.gray[2]
          }`
        }}
      >
        {tables.map((v) => {
          return (
            <NavLink
              key={v.tbl_name}
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
