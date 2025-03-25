import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { ALLBOOKS } from './queries'

const Books = (props) => {
  const [genre, setGenre] = useState('')
  const result = useQuery(ALLBOOKS)
  
  if (result.loading)  {
    return <div>loading...</div>
  }
  
  if (!props.show) {
    return null
  }
  
  const books = result.data.allBooks
  const genres = [... new Set(books.map((b) => b.genres).flat())]

  return (
    <div>
      <h2>books</h2>

      {!(genre.trim().length === 0) ? (<p>books in genre <b>{genre}</b></p>) : <></>}

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((b) => (
            ((b.genres.includes(genre)) || (genre.trim().length === 0))
            ? (<tr key={b.title}>
                <td>{b.title}</td>
                <td>{b.author.name}</td>
                <td>{b.published}</td>
              </tr>) 
            : (<tr key={b.title}></tr>)
          ))}
        </tbody>
      </table>
      <select value={genre} onChange={({ target }) => setGenre(target.value)}>
        <option value="">select genre</option>
        {genres.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>
    </div>
  )
}

export default Books
