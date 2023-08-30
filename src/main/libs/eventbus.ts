import mitt from 'mitt'
import { CONTEXT_MENU } from '../../common/const'
import { Connection } from '../../common/types'
type EventBus = {
  MENU_CLIKED: { action: CONTEXT_MENU; payload: Connection }
  BEFORE_QUIT: unknown
}
export const emitter = mitt<EventBus>()
