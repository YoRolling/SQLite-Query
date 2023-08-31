import { Connection, ConnectionType } from '@src/common/types'
import mitt from 'mitt'
type EventBus = {
  SETUP_CONNECTION_META: { exist?: boolean; type: ConnectionType }
  MENU_CLICKED: unknown
  LANDING_GUIDE: boolean
  SETUP_CONNECTION_WITH_META: Connection
}
export const emitter = mitt<EventBus>()
