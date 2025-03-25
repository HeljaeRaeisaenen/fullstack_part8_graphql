import { useQuery } from '@apollo/client'
import { ME, ALLBOOKS } from './queries'

const Recommend = (props) => {
  const result = useQuery(ME, {
		// don't cache this query because logging out cases it to be cached
		// as null for some reason??? until the page is refreshed
		fetchPolicy: "no-cache"
	})
	const books_result = useQuery(ALLBOOKS, {
		variables: {genre: result.data?.me?.favoriteGenre},
		skip: result.loading || !result.data?.me
	})

	if (!props.show) {
    return null
  }

  if (result.loading || books_result.loading)  {
    return <div>loading...</div>
  }
	
	if (!result.data.me.favoriteGenre) {
		return <div>no favorite genre</div>
	}
	const genre = result.data.me.favoriteGenre


	const books = books_result.data.allBooks
  
  return (
    <div>
      <h2>recommendations</h2>
			<p>books in your favorite genre <b>{genre}</b></p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((b) => (
            (<tr key={b.title}>
                <td>{b.title}</td>
                <td>{b.author.name}</td>
                <td>{b.published}</td>
              </tr>) 
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Recommend
