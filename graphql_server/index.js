const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const jwt = require("jsonwebtoken");
require("dotenv").config();

const GraphQL = require("graphql");
const Book = require("./models/book");
const Author = require("./models/author");
const User = require("./models/user");

const typeDefs = `
  type Book {
    title: String!
    author: Author!
    published: Int!
    genres: [String]
    id: ID!
  }
  
  type Author {
    name: String!
    born: Int
    booksN: Int
    id: ID!
  }

  type User {
    username: String!
    favoriteGenre: String
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    bookCount: Int
    authorCount: Int
    allBooks(author: String, genre: String): [Book]!
    allAuthors: [Author]!
    me: User
  }
  
  type Mutation {
    createUser(
      username: String!
      favoriteGenre: String
    ): User
    login(
      username: String!
      password: String!
    ): Token
    addBook(
      title: String!
      author: String!
      published: Int
      genres: [String]
    ): Book
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
    addFavoriteGenre(
      favoriteGenre: String!
    ): User
  }
`;

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      let filter = {};
      if (args.author) {
        let author = await Author.findOne({ name: args.author });
        filter = { ...filter, author: author._id };
      }
      if (args.genre) {
        filter = { ...filter, genres: { $elemMatch: { $eq: args.genre } } };
      }

      return Book.find(filter).populate("author");
    },
    allAuthors: async () => Author.find({}),
    me: (root, args, { currentUser }) => {
      return currentUser;
    },
  },

  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      let author = await Author.findOne({ name: args.author });

      if (!currentUser) {
        throw new GraphQL.GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      if (author == null) {
        author = new Author({ name: args.author });
        try {
          await author.save();
        } catch (error) {
          throw new GraphQL.GraphQLError("Saving author failed", {
            extensions: {
              code: "AUTOMATIC_AUTHOR_SAVE_FAILED",
              invalidArgs: author.name,
              error,
            },
          });
        }
      }

      const book = new Book({ ...args, author: author._id });

      try {
        await book.save();
      } catch (error) {
        throw new GraphQL.GraphQLError("Saving book failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: book.title,
            error,
          },
        });
      }
      return book.populate("author");
    },
    editAuthor: async (root, args, { currentUser }) => {
      let author = await Author.findOne({ name: args.name });

      if (!currentUser) {
        throw new GraphQL.GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      author.born = args.setBornTo;

      try {
        await author.save();
      } catch (error) {
        throw new GraphQL.GraphQLError("Saving author failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.setBornTo,
            error,
          },
        });
      }
      return author;
    },
    createUser: async (root, args) => {
      const user = new User({ username: args.username });

      return user.save().catch((error) => {
        throw new GraphQL.GraphQLError("Creating the user failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.username,
            error,
          },
        });
      });
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "secret") {
        throw new GraphQL.GraphQLError("wrong credentials", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
    },
    addFavoriteGenre: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQL.GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      currentUser.favoriteGenre = args.favoriteGenre;

      try {
        await currentUser.save();
      } catch (error) {
        throw new GraphQL.GraphQLError("Saving user failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: genre,
            error,
          },
        });
      }
      return currentUser;
    },
  },

  Author: {
    booksN: async (root) => {
      return Book.collection.countDocuments({ author: root._id });
    },
  },
};

/*
With help from 'The ERIN' at
https://dev.to/onlyoneerin/how-to-build-a-graphql-api-with-nodejs-apollo-server-and-mongodb-atlas-12fm
*/

const MONGODB = process.env.MONGODB_URI;

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

mongoose
  .connect(MONGODB)
  .then(() => {
    console.log("Connected to MongoDB");
    return startStandaloneServer(server, {
      listen: { port: 4000 },
      context: async ({ req, res }) => {
        const auth = req ? req.headers.authorization : null;
        if (auth && auth.startsWith("Bearer ")) {
          const decodedToken = jwt.verify(
            auth.substring(7),
            process.env.JWT_SECRET
          );
          const currentUser = await User.findById(decodedToken.id);
          return { currentUser };
        }
      },
    });
  })
  .then((res) => {
    console.log(`Server ready at ${res.url}`);
  });
