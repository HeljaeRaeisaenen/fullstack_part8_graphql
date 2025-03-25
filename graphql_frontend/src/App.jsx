import { useState } from "react";
import { useApolloClient, useSubscription } from '@apollo/client';
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import EditAuthor from "./components/EditAuthor";
import LoginForm from "./components/LoginForm";
import Notify from "./components/Notify";
import Recommend from "./components/Recommend";
import { ALLBOOKS, BOOK_ADDED } from "./components/queries";

// function that takes care of manipulating cache
export const updateCache = (cache, query, addedBook) => {
  const uniqByTitle = (b) => {
    let seen = new Set()
    return b.filter((item) => {
      let k = item.title
      return seen.has(k) ? false : seen.add(k)
    })
  }
  cache.updateQuery(query, ({ allBooks }) => {
    return {
      allBooks: uniqByTitle(allBooks.concat(addedBook)),
    }
  })
}

const App = () => {
  const [token, setToken] = useState(null)
  const [page, setPage] = useState("authors");
  const [errorMessage, setErrorMessage] = useState(null)
  const client = useApolloClient()

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
    setPage("login")
  }

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      console.log(data)
      const book = data.data.bookAdded
      notify(`Added book '${book.title}'`)
      updateCache(client.cache, { query: ALLBOOKS }, book)
      }
  })


  if (!token) {
    return (
      <div>
        <Notify errorMessage={errorMessage} />
        <div>
          <button onClick={() => setPage("authors")}>authors</button>
          <button onClick={() => setPage("books")}>books</button>
          <button onClick={() => setPage("login")}>login</button>
        </div>
        <Authors show={page === "authors"} />
        <Books show={page === "books"} />
        <LoginForm
          show={page === "login"}
          setToken={setToken}
          setPage={setPage}
          setError={notify}
        />
      </div>
    )
  }

  return (
    <div>
      <Notify errorMessage={errorMessage}/>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        <button onClick={() => setPage("add")}>add book</button>
        <button onClick={() => setPage("edit")}>edit author</button>
        <button onClick={() => setPage("recommend")}>recommend</button>
        <button onClick={logout}>logout</button>
      </div>

      <Authors show={page === "authors"} />
      <Books show={page === "books"} />
      <NewBook show={page === "add"} />
      <EditAuthor show={page === "edit"} />
      <Recommend show={page === "recommend"} />
    </div>
  );
};

export default App;
