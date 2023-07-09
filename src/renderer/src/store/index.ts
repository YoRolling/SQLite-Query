import { Connection } from '@src/common/types'
import { atom, createStore } from 'jotai'
export const dbList = atom<Connection[]>([])

const store = createStore()
store.set(dbList, [])
export default store
