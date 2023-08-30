import { ConnectionSetupType, MSG_BACKEND_TYPE } from '@src/common/types'
import mitt from 'mitt'
type EventBus = {
  FIRE_DB_LOCATE: ConnectionSetupType
  MENU_CLICKED: unknown
  LANDING_GUIDE: boolean
} & { [T in MSG_BACKEND_TYPE]: unknown }
export const emitter = mitt<EventBus>()
