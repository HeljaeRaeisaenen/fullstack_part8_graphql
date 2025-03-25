import { gql } from '@apollo/client'

const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    title
    author {
      name
      born
      booksN
    }
    published
    genres
  }
`

export const ALLBOOKS = gql`
  query AllBooks($genre: String) {
    allBooks(genre: $genre) {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
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
    ...BookDetails
    }
  }
  ${BOOK_DETAILS}
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

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`

export const ME = gql`
  query Me {
    me {
      favoriteGenre
      username
    }
  }
`
