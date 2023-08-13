import { Tabs, TabsValue, Text } from '@mantine/core'
import { modals } from '@mantine/modals'
import { useTabs } from '@renderer/hooks'
import { invokeIpc } from '@renderer/utils/ipcHelper'
import { CLOSE_TAB, TAB_CHANGED } from '@src/common/const'
import { Tab } from '@src/common/types'
import { IconSql, IconX } from '@tabler/icons-react'
import { useCallback, useMemo, useRef } from 'react'
import QueryTab, { QueryTabInstance } from './QueryTab'

export default function MainTab() {
  // tabs list
  const tabsList = useTabs()

  const queryTabRef = useRef<QueryTabInstance | null>(null)
  const closeTab = useCallback((tab: Tab) => {
    modals.openConfirmModal({
      title: 'Close Tab?',
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to close this tab ? This action is destructive
          and you will have to contact support to restore your data.
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
  const activeTab = useMemo(() => {
    const actived = tabsList.find((v) => v.active)
    if (actived) {
      return actived
    } else {
      return tabsList[0]
    }
  }, [tabsList])

  const activeKey = useMemo(() => activeTab?.uuid, [activeTab])

  const onTabChange = async (value: TabsValue) => {
    await queryTabRef.current?.syncEditorState()
    await invokeIpc(TAB_CHANGED, value)
  }
  if (tabsList.length === 0) {
    return <></>
  }

  return (
    <Tabs
      sx={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}
      value={activeKey}
      onTabChange={onTabChange}
    >
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
      <QueryTab tab={activeTab} ref={queryTabRef} />
    </Tabs>
  )
}
