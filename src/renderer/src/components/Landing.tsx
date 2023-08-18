import { Text, Stack, Flex, Button, Space } from '@mantine/core'
import { ConnectionSetupType } from '@src/common/types'
import {
  IconFilePlus,
  IconDeviceDesktop,
  IconDatabaseEdit,
  IconX
} from '@tabler/icons-react'
import { emitter } from '@renderer/eventbus'
import { useCallback, useEffect, useState } from 'react'
import { useConnection } from '@renderer/hooks'

export default function LandingPage() {
  const [visible, toggle] = useState(false)
  const [dismiss, visiblity] = useState(false)
  const emit = useCallback((type: ConnectionSetupType) => {
    emitter.emit('FIRE_DB_LOCATE', type)
  }, [])
  const [connectionList] = useConnection()
  useEffect(() => {
    if (connectionList.length === 0) {
      toggle(true)
    } else {
      toggle(false)
    }
  }, [connectionList.length])

  useEffect(() => {
    visiblity(connectionList.length > 0)
  }, [connectionList.length])
  useEffect(() => {
    function handler(visible: boolean) {
      toggle(visible)
    }
    emitter.on('LANDING_GUIDE', handler)
    return () => {
      emitter.off('LANDING_GUIDE', handler)
    }
  }, [])

  if (visible === false) {
    return null
  }

  return (
    <>
      <Stack
        justify="center"
        align="center"
        sx={(theme) => ({
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 199,
          backgroundColor:
            theme.colorScheme === 'dark'
              ? theme.colors.dark[5]
              : theme.colors.blue[0]
        })}
      >
        <Flex direction="column" align="center">
          <Text
            variant="gradient"
            gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
            sx={{ fontFamily: 'Greycliff CF, sans-serif' }}
            ta="center"
            fz="xl"
            fw={700}
          >
            Welcome to SQLite Query
          </Text>
          <Text
            variant="gradient"
            sx={{ fontFamily: 'Greycliff CF, sans-serif' }}
            ta="center"
            fz="xl"
            fw={700}
            gradient={{ from: '#ed6ea0', to: '#ec8c69', deg: 35 }}
          >
            Query It, That&apos;s it
          </Text>
        </Flex>
        <Space h="lg" />
        <Flex gap="md">
          <Button
            leftIcon={<IconFilePlus size="1rem" />}
            onClick={() => {
              emit(ConnectionSetupType.Create)
            }}
          >
            Create Database
          </Button>
          <Button
            color="indigo"
            leftIcon={<IconDeviceDesktop size="1rem" />}
            onClick={() => {
              emit(ConnectionSetupType.Open)
            }}
          >
            Open Local Database
          </Button>
          <Button
            color="cyan"
            leftIcon={<IconDatabaseEdit size="1rem" />}
            onClick={() => {
              emit(ConnectionSetupType.Memory)
            }}
          >
            Open Memory Database
          </Button>
        </Flex>
        {dismiss && (
          <Button
            variant="light"
            color="red"
            leftIcon={<IconX size={14} />}
            onClick={() => toggle(false)}
          >
            Dismiss
          </Button>
        )}
      </Stack>
    </>
  )
}
