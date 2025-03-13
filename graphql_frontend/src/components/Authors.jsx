import { useQuery } from '@apollo/client'
import { ALLAUTHORS } from './queries'


const Authors = (props) => {
  const result = useQuery(ALLAUTHORS)

  if (result.loading)  {
    return <div>loading...</div>
  }

  const authors = result.data.allAuthors

  if (!props.show) {
    return null
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born in</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{( a.born === null ? 'unknown' : a.born)}</td>
              <td>{a.booksN}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Authors
