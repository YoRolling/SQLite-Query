import { Result } from '@src/common/types'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'

const tabState = atomFamily(
  ({ uuid }: { uuid: string; query?: string; result?: Result }) =>
    atom({
      uuid,
      query: '',
      result: {} as Result
    }),
  (a, b) => a.uuid === b.uuid
)

export { tabState }
