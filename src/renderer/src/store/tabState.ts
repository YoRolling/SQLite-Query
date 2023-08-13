import { Result } from '@src/common/types'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'

const tabState = atomFamily((uuid: string) =>
  atom({
    uuid,
    query: '',
    result: {} as Result
  })
)

export { tabState }
