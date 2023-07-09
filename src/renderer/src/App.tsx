import { AppShell, ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core'
import { useColorScheme } from '@mantine/hooks'
import { Notifications } from '@mantine/notifications'
import Aside from '@renderer/components/Aside'
import LandingPage from '@renderer/components/Landing'
import useConnection from '@renderer/hooks/useConnection'
import { Provider } from 'jotai'
import { useEffect, useState } from 'react'
import Handler from './components/Handler'
import store, { dbList } from './store'
import MainTab from './components/Main'

function App(): JSX.Element {
  const preferredColorScheme = useColorScheme()
  const [colorScheme, setColorScheme] = useState<ColorScheme>(preferredColorScheme)
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'))
  const [connectionList] = useConnection()
  useEffect(() => {
    store.set(dbList, connectionList)
  }, [JSON.stringify(connectionList)])
  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <Provider store={store}>
          <Notifications />
          <Handler />
          {connectionList.length > 0 ? (
            <AppShell
              aside={<Aside />}
              layout="alt"
              styles={{
                main: {
                  paddingTop: 0,
                  display: 'flex'
                }
              }}
            >
              <MainTab />
            </AppShell>
          ) : (
            <LandingPage />
          )}
        </Provider>
      </MantineProvider>
    </ColorSchemeProvider>
  )
}

export default App
