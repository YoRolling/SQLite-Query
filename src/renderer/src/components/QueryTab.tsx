import styled from '@emotion/styled'
import { useElementSize } from '@mantine/hooks'
import { tabState } from '@renderer/store'
import { invokeIpc } from '@renderer/utils/ipcHelper'
import { EXEC_SQL } from '@src/common/const'
import { Tab } from '@src/common/types'
import MonacoEditor, { IMonacoEditor, RefEditorInstance } from '@uiw/react-monacoeditor'
import { useAtom } from 'jotai'
import { editor } from 'monaco-editor'
import { useEffect, useRef } from 'react'
import QueryResult from './QueryResult'

const TabComponent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: ${({ theme }) => theme.spacing.lg};
  > div {
    flex: 1;
  }
`

export default function QueryTab({ tab }: { tab: Tab }) {
  const { ref, width, height } = useElementSize()
  const editor = useRef<RefEditorInstance | null>(null)
  const { uuid } = tab
  const currentTabAtom = tabState(uuid)
  const [tab_state, update] = useAtom(currentTabAtom)
  useEffect(() => {
    editor.current?.editor?.layout({ width: width, height: height })
  }, [width, height])
  useEffect(() => {
    update((prev) => {
      return { ...prev, query: tab.query }
    })
  }, [])

  useEffect(() => {
    editor.current?.editor?.setValue(tab_state.query)
  }, [tab])

  const onMount = (editor: editor.IStandaloneCodeEditor, monaco: IMonacoEditor) => {
    // editor.focus()
    editor.addAction({
      id: 'com.yorolling.query',
      // A label of the action that will be presented to the user.
      label: 'Run Query',
      // An optional array of keybindings for the action.
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.F10,
        // chord
        monaco.KeyMod.chord(
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK,
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyM
        )
      ],
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1.5,
      // Method that will be executed when the action is triggered.
      // @param editor The editor instance is passed in as a convenience
      run: async function (ed) {
        const model = ed.getModel()
        if (model != null) {
          const value = model.getValue()
          if (value) {
            const result = await invokeIpc(EXEC_SQL, { sql: value, uuid: tab.relateConn })
            update((prev) => {
              return { ...prev, result }
            })
          }
        }
      }
    })
    editor.addAction({
      id: 'com.yorolling.querySelection',
      label: 'Run Selection Query',
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1.6,
      run: async function (editor) {
        const selection = editor.getSelection()
        if (selection !== null) {
          const value = editor.getModel()?.getValueInRange(selection)
          if (value) {
            const result = await invokeIpc(EXEC_SQL, { sql: value, uuid: tab.relateConn })
            update((prev) => {
              return { ...prev, result }
            })
          }
        }
      }
    })
  }

  const onInput = (value: string) => {
    console.log('edito change', value)
    update((prev) => {
      return { ...prev, query: value }
    })
  }
  return (
    <TabComponent>
      <div ref={ref}>
        <MonacoEditor
          language="sql"
          defaultValue={tab_state.query}
          height={height}
          width={width}
          editorDidMount={onMount}
          onChange={onInput}
          ref={editor}
          options={{
            theme: 'vs-dark'
          }}
        />
      </div>
      <div className="query-result">
        <QueryResult columns={tab_state.result.columns} data={tab_state.result.data} />
      </div>
    </TabComponent>
  )
}
