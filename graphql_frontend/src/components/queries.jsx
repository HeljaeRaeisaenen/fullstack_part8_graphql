import { gql } from '@apollo/client'

export const ALLBOOKS = gql`
  query AllBooks {
      allBooks {
    title
    author
    published
    genres
  }
}
`

export const ALLAUTHORS = gql`
  query AllAuthors {
    allAuthors {
      name
      born
      booksN
    }
  }
`

export const NEWBOOK = gql`
  mutation Mutation($title: String!, $author: String!, $published: Int, $genres: [String]) {
  addBook(
    title: $title,
    author: $author,
    published: $published,
    genres: $genres
  ) {
    author
    genres
    published
    title
  }
}
`

export const UPDATEAUTHOR = gql`
  mutation Mutation($name: String!, $born: Int!) {
  editAuthor(
    name: $name,
    setBornTo: $born
  ) {
    name
    born
  }
}
`