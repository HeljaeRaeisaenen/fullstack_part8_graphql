import { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { UPDATEAUTHOR, ALLAUTHORS } from './queries'

const EditAuthor = (props) => {
	const [name, setName] = useState('')
	const [born, setBorn] = useState('')
	const [ editAuthor ] = useMutation(UPDATEAUTHOR, { refetchQueries: [ { query: ALLAUTHORS } ] })
	const result = useQuery(ALLAUTHORS)

	if (result.loading)  {
		return <div>loading...</div>
	}

	if (!props.show) {
		return null
	}

	const authors = result.data.allAuthors

	const submit = async (event) => {
		event.preventDefault()

		console.log('update author...')
		const born_real = parseInt(born)

		editAuthor({variables: {name: name, born: born_real}})

		setName('')
		setBorn('')
	}

	return (
		<div>
			<h2>edit author</h2>
			<form onSubmit={submit}>
				<div>
					name
					<select value={name} onChange={({ target }) => setName(target.value)}>
						<option value="">select author</option>
						{authors.map((a) => (
							<option key={a.name} value={a.name}>{a.name}</option>
						))}
					</select>
				</div>
				<div>
					born
					<input value={born} onChange={({ target }) => setBorn(target.value)} />
				</div>
				<button type="submit">update author</button>
			</form>
		</div>
	)
}

export default EditAuthor