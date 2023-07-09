import { Tabs } from '@mantine/core'
import { Tab } from '@src/common/types'
import QueryTab from './QueryTab'

export default function MainTab() {
  // tabs list
  const [tabsList] = [
    [{ uuid: 'asds', label: 'queyr', query: 'select * from tablename', relateConn: 'sadbasd' }]
  ] as [Tab[]]
  if (tabsList.length === 0) {
    return <></>
  }

  return (
    <Tabs sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Tabs.List>
        {tabsList.map((v) => {
          return (
            <Tabs.Tab key={v.uuid} value={v.uuid}>
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
