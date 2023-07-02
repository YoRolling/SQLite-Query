import { Button, ColorScheme, ColorSchemeProvider, MantineProvider, AppShell } from '@mantine/core'
import { useColorScheme } from '@mantine/hooks'
import { useState } from 'react'
import Aside from './components/Aside'
function App(): JSX.Element {
  const preferredColorScheme = useColorScheme()
  const [colorScheme, setColorScheme] = useState<ColorScheme>(preferredColorScheme)
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'))
  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <AppShell aside={<Aside />}>
          <div className="container">
            <Button variant="light">Button</Button>
          </div>
        </AppShell>
      </MantineProvider>
    </ColorSchemeProvider>
  )
}

export default App
