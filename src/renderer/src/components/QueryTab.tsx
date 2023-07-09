import { Divider, SimpleGrid } from '@mantine/core'
import { Tab } from '@src/common/types'
export default function QueryTab(props: { tab: Tab }) {
  return (
    <SimpleGrid cols={1} spacing="sm" verticalSpacing="sm" sx={{ height: '100%' }}>
      <div>1</div>
      <Divider my="sm" />

      <div>2</div>
    </SimpleGrid>
  )
}
