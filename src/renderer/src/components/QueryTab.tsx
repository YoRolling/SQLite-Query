import styled from '@emotion/styled'
import { useElementSize } from '@mantine/hooks'
import { tabState } from '@renderer/store'
import { invokeIpc } from '@renderer/utils/ipcHelper'
import { EXEC_SQL } from '@src/common/const'
import { Result, Tab } from '@src/common/types'
import MonacoEditor, {
  IMonacoEditor,
  RefEditorInstance
} from '@uiw/react-monacoeditor'
import { useAtom } from 'jotai'
import { editor } from 'monaco-editor'
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef
} from 'react'
import QueryResult from './QueryResult'
import { notifications } from '@mantine/notifications'

const TabComponent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: ${({ theme }) => theme.spacing.lg};
  > div {
    flex: 1;
  }
`
export type QueryTabInstance = {
  syncEditorState: () => Promise<string>
}
function QueryTab(
  { tab }: { tab: Tab },
  ref: React.Ref<QueryTabInstance | null>
) {
  const { ref: element, width, height } = useElementSize()
  const editor = useRef<RefEditorInstance | null>(null)
  const { uuid } = tab
  const [tab_state, update] = useAtom(tabState({ uuid }))

  // fixed editor layout when container size changed
  useEffect(() => {
    editor.current?.editor?.layout({ width: width, height: height })
  }, [width, height])

  const getUserInput = useCallback((type: 1 | 2 = 1) => {
    const model = editor?.current?.editor?.getModel()
    if (type === 1) {
      if (model != null) {
        const value = model.getValue()
        return value
      }
      return ''
    } else {
      const selection = editor?.current?.editor?.getSelection() ?? null
      if (selection !== null) {
        const value = model?.getValueInRange(selection)
        return value ?? ''
      } else {
        return ''
      }
    }
  }, [])

  // expose API to others
  useImperativeHandle<QueryTabInstance | null, QueryTabInstance>(
    ref,
    () => {
      return {
        syncEditorState() {
          // pass
          const value = getUserInput()
          console.log('expose', value, tab_state.uuid)
          update({ ...tab_state, query: value })
          console.log('expose', value, tab_state)
          return Promise.resolve(value)
        }
      }
    },
    [uuid]
  )

  useEffect(() => {
    console.log(tab_state)
    editor.current?.editor?.setValue(tab_state.query)
    return () => {
      const value = getUserInput()
      console.log('tab changed', value, tab_state.uuid)
      update({ ...tab_state, query: value })
    }
  }, [uuid])

  const onMount = useCallback(
    (editor: editor.IStandaloneCodeEditor, monaco: IMonacoEditor) => {
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
        run: async function () {
          const value = getUserInput()
          if (value) {
            try {
              const result = await invokeIpc<Result>(EXEC_SQL, {
                sql: value,
                uuid: tab.relateConn
              })

              update({ ...tab_state, result })
            } catch (error) {
              notifications.show({
                title: 'Error',
                message: 'Hey there,Error caughted! 🤥,' + error,
                color: 'red'
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
        run: async function () {
          const value = getUserInput(2)
          if (value) {
            const result = await invokeIpc(EXEC_SQL, {
              sql: value,
              uuid: tab.relateConn
            })
            update({ ...tab_state, result })
          }
        }
      })
    },
    [editor]
  )

  return (
    <TabComponent>
      <div ref={element}>
        <MonacoEditor
          language="sql"
          defaultValue={tab_state.query}
          height={height}
          width={width}
          editorDidMount={onMount}
          ref={editor}
          options={{
            theme: 'vs-dark'
          }}
        />
      </div>
      <div className="query-result">
        <QueryResult
          columns={tab_state.result.columns}
          data={tab_state.result.data}
        />
      </div>
    </TabComponent>
  )
}
export default forwardRef<QueryTabInstance, { tab: Tab }>(QueryTab)
