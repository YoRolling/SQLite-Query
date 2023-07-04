import {
  Text,
  Stack,
  Flex,
  Button,
  Space,
  Modal,
  Input,
  TextInput,
  Group,
  ActionIcon,
  FileButton
} from '@mantine/core'
import { Form, useForm, isNotEmpty } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { PICK_UP_FILE, SETUP_SQLITE_CONNNECTION } from '@src/common/const'
import { ConnectionSetup, DialogRetureValue } from '@src/common/types'
import {
  IconFilePlus,
  IconDeviceDesktop,
  IconDatabaseEdit,
  IconAlertTriangle,
  IconAlertSmall,
  IconFileImport
} from '@tabler/icons-react'
import { useState } from 'react'
const { ipcRenderer } = window.electron
const style = {
  width: '100vw',
  height: '100vh'
}

export default function LandingPage() {
  const [opened, toggle] = useState(false)

  const form = useForm<ConnectionSetup>({
    initialValues: {
      label: '',
      path: '',
      type: 1
    },
    validate: {
      label: isNotEmpty('Enter your connnection label'),
      path: isNotEmpty('Choose Your Databse File')
    }
  })

  const pickUpFile = async () => {
    try {
      const result: DialogRetureValue = await ipcRenderer.invoke(PICK_UP_FILE, {
        type: form.getInputProps('type').value
      })
      if (result.canceled) {
        throw new Error('User Canceled')
      }
      form.setFieldValue('path', result.filePaths[0])
      console.log(result.filePaths)
    } catch (error) {
      notifications.show({
        icon: <IconAlertSmall />,
        color: 'red',
        variant: 'danger',
        title: 'Attation',
        message: (error as Error).message
      })
    }
  }
  const setupConnection = () => {
    ipcRenderer.invoke(SETUP_SQLITE_CONNNECTION, form.values)
  }
  const canceled = () => {
    form.reset()
    toggle(false)
  }
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
              toggle(true)
              form.setFieldValue('type', 2)
            }}
          >
            Create Database
          </Button>
          <Button
            color="indigo"
            leftIcon={<IconDeviceDesktop size="1rem" />}
            onClick={() => {
              toggle(true)
              form.setFieldValue('type', 1)
            }}
          >
            Open Local Database
          </Button>
          <Button color="cyan" leftIcon={<IconDatabaseEdit size="1rem" />}>
            Open Memory Database
          </Button>
        </Flex>
      </Stack>
      <Modal
        opened={opened}
        onClose={() => {}}
        centered
        title="SQLite Connection"
        withCloseButton={false}
      >
        <Form form={form} onSubmit={setupConnection}>
          <TextInput
            placeholder="some label"
            label="Connection Label"
            variant="filled"
            required
            {...form.getInputProps('label')}
          />
          <Space h="md" />
          <TextInput
            placeholder=""
            label="Database File Location"
            variant="filled"
            required
            readOnly
            {...form.getInputProps('path')}
            rightSection={
              <ActionIcon color="green" onClick={pickUpFile}>
                <IconFileImport />
              </ActionIcon>
            }
          />

          <Group mt="xl">
            <Button variant="outline" type="submit">
              Connect
            </Button>
            <Button variant="outline" color="red" onClick={canceled}>
              Cancel
            </Button>
          </Group>
        </Form>
      </Modal>
    </>
  )
}
