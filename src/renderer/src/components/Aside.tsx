import {
  Group,
  NavLink,
  Navbar,
  ScrollArea,
  Text,
  useMantineTheme,
  rem,
  NavLinkProps,
  Menu,
  ActionIcon
} from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { emitter } from '@renderer/eventbus'
import { useConnection } from '@renderer/hooks'
import useIpcMsg from '@renderer/hooks/useIpcMsg'
import { invokeIpc } from '@renderer/utils/ipcHelper'
import {
  Connection,
  MSG_BACKEND_TYPE,
  MenuType,
  TableInfo
} from '@src/common/types'
import {
  IconAdjustments,
  IconArrowsLeftRight,
  IconDatabase,
  IconPlug,
  IconPlugX,
  IconTable,
  IconTrash
} from '@tabler/icons-react'
import { MouseEvent, useCallback, useEffect, useState } from 'react'

export default function Sidebar() {
  const theme = useMantineTheme()
  const [connectionList] = useConnection()
  const [activedConn, setActiveConn] = useState<string>('')
  const [tables, updateTables] = useState<TableInfo[]>([])
  useEffect(() => {
    const len = connectionList.length
    if (connectionList[len - 1] !== undefined) {
      setActiveConn(connectionList[len - 1].uuid)
    }
    return () => {}
  }, [connectionList.length])

  useIpcMsg(MSG_BACKEND_TYPE.DATABASE_CHANGED, (msg) => {
    const uuid = msg as string
    if (uuid === activedConn) {
      selectTables(uuid)
    }
  })

  const selectTables = useCallback(async (uuid: string) => {
    try {
      const { data } = await invokeIpc<{ data: TableInfo[] }>('EXEC_SQL', {
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

  const onContextMenu = useCallback(
    async (
      event: MouseEvent<HTMLButtonElement>,
      payload: Connection | TableInfo,
      type: MenuType = MenuType.CONTEXT_DB
    ) => {
      event.preventDefault()
      event.stopPropagation()
      try {
        await invokeIpc('BUILD_CONTEXT_MENU', {
          type: type,
          payload
        })
      } catch (error) {
        // pass by
      }
    },
    []
  )

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
          <ActionMenu />
        </Group>
      </Navbar.Section>
      <Navbar.Section grow component={ScrollArea}>
        {connectionList.map((v) => {
          const props: NavLinkProps & {
            onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined
          } = {}
          if (v.opened) {
            props.active = activedConn === v.uuid
            props.onClick = () => {
              setActiveConn(v.uuid)
            }
            props.color = 'blue'
          }
          return (
            <NavLink
              key={v.uuid}
              label={v.label}
              {...props}
              icon={<IconDatabase size={16} />}
              onContextMenu={(event) => onContextMenu(event, v)}
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

function ActionMenu() {
  const fire = useCallback(() => {
    emitter.emit('LANDING_GUIDE', true)
  }, [])
  const restart = useCallback(async () => {
    await invokeIpc('RESTART_APP', { force: true })
  }, [])
  const quit = useCallback(async () => {
    await invokeIpc('QUIT', {})
  }, [])
  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <ActionIcon>
          <IconAdjustments size="14" />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Connection</Menu.Label>
        <Menu.Item icon={<IconDatabase size={14} />} onClick={fire}>
          New Connection
        </Menu.Item>
        {/* <Menu.Item icon={<IconSql size={14} />}>New Query</Menu.Item> */}
        <Menu.Divider />

        <Menu.Label>Application</Menu.Label>
        <Menu.Item icon={<IconArrowsLeftRight size={14} />} onClick={restart}>
          Restart App
        </Menu.Item>
        <Menu.Item color="red" icon={<IconTrash size={14} />} onClick={quit}>
          Quit
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}
