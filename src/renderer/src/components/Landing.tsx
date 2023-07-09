import { Text, Stack, Flex, Button, Space } from '@mantine/core'
import { ConnectionSetupType } from '@src/common/types'
import { IconFilePlus, IconDeviceDesktop, IconDatabaseEdit } from '@tabler/icons-react'
import { emitter } from '@renderer/eventbus'
import { useCallback } from 'react'
const style = {
  width: '100vw',
  height: '100vh'
}

export default function LandingPage() {
  const emit = useCallback((type: ConnectionSetupType) => {
    emitter.emit('FIRE_DB_LOCATE', type)
  }, [])
  return (
    <>
      <Stack justify="center" align="center" sx={style}>
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
      </Stack>
    </>
  )
}
