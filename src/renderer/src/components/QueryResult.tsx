import { Flex, Table } from '@mantine/core'
export type Props = {
  columns?: unknown[]
  data?: unknown[]
}
export default function QueryResult({ columns, data }: Props) {
  const thead = columns?.map((v) => {
    const { column } = v as Record<string, string>
    return <th key={column}>{column}</th>
  })
  const rows = data?.map((row, index) => {
    const element = row as Record<string, string>
    return (
      <tr key={index}>
        {columns?.map((c) => {
          return (
            <td key={(c as Record<string, string>).column}>
              {element[(c as Record<string, string>).column]}
            </td>
          )
        })}
      </tr>
    )
  })

  return (
    <Flex>
      <Table striped withBorder withColumnBorders>
        <thead>
          <tr>{thead}</tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </Flex>
  )
}
