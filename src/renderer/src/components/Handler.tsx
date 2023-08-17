import {
  Modal,
  TextInput,
  Space,
  ActionIcon,
  Group,
  Button
} from '@mantine/core'
import { Form, isNotEmpty, useForm } from '@mantine/form'
import { CONTEXT_MENU } from '@src/common/const'
import {
  ConnectionSetup,
  ConnectionSetupType,
  DialogRetureValue
} from '@src/common/types'
import { IconFileImport } from '@tabler/icons-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { v4 as UUIDV4 } from 'uuid'
const { ipcRenderer } = window.electron
import { emitter } from '@renderer/eventbus'
import { invokeIpc } from '@renderer/utils/ipcHelper'
export default function Handler() {
  const [opened, toggle] = useState(false)
  useEffect(() => {
    function handle(event) {
      form.setFieldValue('type', event)
      if (event === ConnectionSetupType.Memory) {
        form.setFieldValue('path', ':memory:')
      }
      toggle(true)
    }
    emitter.on('FIRE_DB_LOCATE', handle)
    return () => {
      emitter.off('FIRE_DB_LOCATE', handle)
    }
  }, [])
  const form = useForm<ConnectionSetup>({
    initialValues: {
      label: '',
      path: '',
      type: ConnectionSetupType.Create,
      uuid: UUIDV4()
    },
    validate: {
      label: isNotEmpty('Enter your connnection label'),
      path: isNotEmpty('Choose Your Databse File')
    }
  })

  const type = useMemo(() => {
    return form.getInputProps('type')
  }, [form])

  useEffect(() => {
    const off = ipcRenderer.on(
      'MENU_CLICKED',
      (_event, { id, payload }: { id: string; payload: unknown }) => {
        switch (id) {
          case CONTEXT_MENU.Create_Query:
            emitter.emit('MENU_CLIKED', payload)
            break
          default:
            break
        }
      }
    )
    return () => {
      off()
    }
  }, [])

  const pickUpFile = async () => {
    try {
      const result = await invokeIpc<DialogRetureValue>('PICK_UP_FILE', {
        type: form.getInputProps('type').value
      })
      const { canceled } = result
      if (canceled) {
        throw new Error('User Canceled')
      }
      const { value } = form.getInputProps('type')
      switch (value) {
        case ConnectionSetupType.Create:
          form.setFieldValue(
            'path',
            (result as Electron.SaveDialogReturnValue).filePath!
          )
          break
        case ConnectionSetupType.Open:
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
        {type.value !== ConnectionSetupType.Memory && (
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
