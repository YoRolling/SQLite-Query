import { SimpleGrid } from '@mantine/core'
import { Tab } from '@src/common/types'
import MonacoEditor, { IMonacoEditor, RefEditorInstance } from '@uiw/react-monacoeditor'
import { editor } from 'monaco-editor'
import { useElementSize, useResizeObserver } from '@mantine/hooks'
import { useEffect, useRef } from 'react'

export default function QueryTab(props: { tab: Tab }) {
  const { ref, width, height } = useElementSize()
  const editor = useRef<RefEditorInstance | null>(null)
  useEffect(() => {
    editor.current?.editor?.layout({ width: width, height: height })
    console.log(editor.current)
  }, [width, height])
  const onMount = (editor: editor.IStandaloneCodeEditor, monaco: IMonacoEditor) => {
    // editor.focus()
    editor.addAction({
      id: 'my-unique-id',
      // A label of the action that will be presented to the user.
      label: 'My Label!!!',
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
      run: function (ed) {
        alert("i'm running => " + ed.getPosition())
      }
    })
  }
  return (
    <SimpleGrid cols={1} spacing="sm" verticalSpacing="sm" sx={{ height: '100%' }}>
      <div ref={ref}>
        <MonacoEditor
          language="sql"
          value={props.tab.query}
          height={height}
          width={width}
          editorDidMount={onMount}
          ref={editor}
          options={{
            theme: 'vs-dark'
          }}
        />
      </div>
      <div>2</div>
    </SimpleGrid>
  )
}
