import mitt from 'mitt'
import { CONTEXT_MENU } from '../../common/const'
type EventBus = {
  MENU_CLIKED: { action: CONTEXT_MENU; payload: unknown }
}
export const emitter = mitt<EventBus>()
