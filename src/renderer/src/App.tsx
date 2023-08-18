import {
  AppShell,
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider
} from '@mantine/core'
import { useColorScheme } from '@mantine/hooks'
import { Notifications } from '@mantine/notifications'
import Aside from '@renderer/components/Aside'
import LandingPage from '@renderer/components/Landing'
import { Provider } from 'jotai'
import { useEffect, useState } from 'react'
import Handler from './components/Handler'
import store from './store'
import MainTab from './components/Main'
import { ModalsProvider } from '@mantine/modals'

function App(): JSX.Element {
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const newColorScheme = media.matches ? 'dark' : 'light'
    setColorScheme(newColorScheme)

    const handler = (event) => {
      const newColorScheme = event.matches ? 'dark' : 'light'
      setColorScheme(newColorScheme)
    }

    media.addEventListener('change', handler)

    return () => {
      media.removeEventListener('change', handler)
    }
  }, [])
  const preferredColorScheme = useColorScheme()
  const [colorScheme, setColorScheme] =
    useState<ColorScheme>(preferredColorScheme)

  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'))

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <Provider store={store}>
          <ModalsProvider>
            <Notifications />
            <Handler />
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
            <LandingPage />
          </ModalsProvider>
        </Provider>
      </MantineProvider>
    </ColorSchemeProvider>
  )
}

export default App
