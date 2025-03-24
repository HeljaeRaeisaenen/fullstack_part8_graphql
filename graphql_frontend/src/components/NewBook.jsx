import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { NEWBOOK, ALLBOOKS, ALLAUTHORS } from './queries'

const NewBook = (props) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])
  const [ createBook ] = useMutation(NEWBOOK, {
    update: (cache, response) => {
      cache.updateQuery({ query: ALLBOOKS }, ({ allBooks }) => {
        return {
          allBooks: allBooks.concat(response.data.addBook),
        }
      })
      cache.updateQuery( {query: ALLAUTHORS }, ({ allAuthors }) => {
        const a_name = response.data.addBook.author.name
        if (allAuthors.map((a) => a.name).includes(a_name)) {
          return { allAuthors: allAuthors.map( (a) => a.name == a_name ? {...a, booksN: a.booksN+1} : a ) }
        } 
        return {
          allAuthors: allAuthors.concat(response.data.addBook.author),
        }
      })
    }
  })
  
  if (!props.show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()

    console.log('add book...')
    //const published_real = parseInt(published)
    const published_real = published.length > 0 ? parseInt(published) : undefined;

    createBook({
      variables: {
        title: title,
        author: author,
        published: published_real,
        genres: genres
      }
    })

    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (
    
    <div>
      <h2>add a new book</h2>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  )
}

export default NewBook