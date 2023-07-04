import { Button, ColorScheme, ColorSchemeProvider, MantineProvider, AppShell } from '@mantine/core'
import { useColorScheme } from '@mantine/hooks'
import { useState } from 'react'
import Aside from './components/Aside'
import { Provider } from 'jotai'
import LandingPage from './components/Landing'
import { Notifications } from '@mantine/notifications'
import useConnection from './hooks/useConnection'

function App(): JSX.Element {
  const preferredColorScheme = useColorScheme()
  const [colorScheme, setColorScheme] = useState<ColorScheme>(preferredColorScheme)
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'))
  const [connectionList] = useConnection()
  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <Provider>
          <Notifications />
          {connectionList.length > 0 ? (
            <AppShell aside={<Aside />}>
              <div className="container">
                <Button variant="light">Button</Button>
              </div>
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
