import {
  Modal,
  TextInput,
  Space,
  ActionIcon,
  Group,
  Button
} from '@mantine/core'
import { Form, isNotEmpty, useForm } from '@mantine/form'
import {
  Connection,
  ConnectionSetup,
  ConnectionType,
  DialogRetureValue
} from '@src/common/types'
import { IconFileImport } from '@tabler/icons-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { v4 as UUIDV4 } from 'uuid'
import { emitter } from '@renderer/eventbus'
import { invokeIpc } from '@renderer/utils/ipcHelper'
export default function Handler() {
  const [opened, toggle] = useState(false)
  useEffect(() => {
    function handle({
      exist,
      type
    }: {
      exist?: boolean
      type: ConnectionType
    }) {
      form.setFieldValue('type', type)
      form.setFieldValue('exist', exist ?? false)
      if (type === ConnectionType.Memory) {
        form.setFieldValue('path', ':memory:')
      }
      form.setFieldValue('uuid', UUIDV4())
      toggle(true)
    }
    emitter.on('SETUP_CONNECTION_META', handle)
    return () => {
      emitter.off('SETUP_CONNECTION_META', handle)
    }
  }, [])

  useEffect(() => {
    function handle(args: Connection) {
      form.setValues(args)
      toggle(true)
    }
    emitter.on('SETUP_CONNECTION_WITH_META', handle)
    return () => {
      emitter.off('SETUP_CONNECTION_WITH_META', handle)
    }
  }, [])
  const form = useForm<ConnectionSetup>({
    initialValues: {
      label: '',
      path: '',
      type: ConnectionType.Local,
      uuid: UUIDV4(),
      exist: true
    },
    validate: {
      label: isNotEmpty('Enter your connnection label'),
      path: isNotEmpty('Choose Your Databse File')
    }
  })

  const type = useMemo(() => {
    return form.getInputProps('type').value
  }, [form])
  const exist = useMemo(() => {
    return form.getInputProps('exist').value
  }, [form])

  const pickUpFile = async () => {
    try {
      const result = await invokeIpc<DialogRetureValue>('PICK_UP_FILE', {
        exist
      })
      const { canceled } = result
      if (canceled) {
        throw new Error('User Canceled')
      }
      switch (exist) {
        case false:
          form.setFieldValue(
            'path',
            (result as Electron.SaveDialogReturnValue).filePath!
          )
          break
        case true:
          form.setFieldValue(
            'path',
            (result as Electron.OpenDialogReturnValue).filePaths[0]
          )
          break
        default:
          break
      }
    } catch (error) {
      // pass by
    }
  }
  const setupConnection = async () => {
    try {
      await invokeIpc('SETUP_SQLITE_CONNNECTION', form.values)
    } catch (error) {
      // pass by
    } finally {
      canceled()
    }
  }
  const canceled = useCallback(() => {
    emitter.emit('LANDING_GUIDE', false)
    toggle(false)
    form.reset()
  }, [form])

  return (
    <Modal
      closeOnEscape={false}
      closeOnClickOutside={false}
      opened={opened}
      onClose={canceled}
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
        {type === ConnectionType.Local && (
          <TextInput
            placeholder=""
            label="Database File Location"
            variant="filled"
            required
            readOnly
            value={form.getInputProps('path').value}
            rightSection={
              <ActionIcon color="green" onClick={pickUpFile}>
                <IconFileImport />
              </ActionIcon>
            }
          />
        )}

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
  )
}
