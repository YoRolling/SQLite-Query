import { ConnectionSetupType } from '@src/common/types'
import mitt from 'mitt'
type EventBus = {
  FIRE_DB_LOCATE: ConnectionSetupType
  MENU_CLIKED: unknown
}
export const emitter = mitt<EventBus>()
