import mitt from 'mitt'
import { CONTEXT_MENU } from '../../common/const'
import { Connection } from '../../common/types'
type EventBus = {
  MENU_CLIKED: { action: CONTEXT_MENU; payload: Connection }
}
export const emitter = mitt<EventBus>()
