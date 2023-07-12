import { Tabs, Text } from '@mantine/core'
import { modals } from '@mantine/modals'
import { useTabs } from '@renderer/hooks'
import { Tab } from '@src/common/types'
import { IconSql, IconX } from '@tabler/icons-react'
import { useCallback } from 'react'
import QueryTab from './QueryTab'
import { invokeIpc } from '@renderer/utils/ipcHelper'
import { CLOSE_TAB } from '@src/common/const'

export default function MainTab() {
  // tabs list
  const tabsList = useTabs()
  const closeTab = useCallback((tab: Tab) => {
    console.log('close Tab')
    modals.openConfirmModal({
      title: 'Close Tab?',
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to close this tab ? This action is destructive and you will have to
          contact support to restore your data.
        </Text>
      ),
      labels: { confirm: 'Delete Tab', cancel: "No don't delete it" },
      confirmProps: { color: 'red' },
      onCancel: () => console.log('Cancel'),
      onConfirm: async () => {
        try {
          await invokeIpc<{ flag: boolean }>(CLOSE_TAB, tab)
        } catch (error) {
          //
        } finally {
          //
        }
      }
    })
  }, [])
  if (tabsList.length === 0) {
    return <></>
  }
  return (
    <Tabs sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Tabs.List>
        {tabsList.map((v) => {
          return (
            <Tabs.Tab
              key={v.uuid}
              value={v.uuid}
              icon={<IconSql size="0.8rem" />}
              rightSection={<IconX size="0.8rem" onClick={() => closeTab(v)} />}
            >
              {v.label}
            </Tabs.Tab>
          )
        })}
      </Tabs.List>
      {tabsList.map((v) => {
        return (
          <Tabs.Panel sx={{ flex: 1 }} key={v.uuid} value={v.uuid}>
            <QueryTab tab={v} />
          </Tabs.Panel>
        )
      })}
    </Tabs>
  )
}
