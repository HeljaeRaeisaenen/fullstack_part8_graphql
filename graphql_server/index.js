const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { v1: uuid } = require("uuid");
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
require("dotenv").config();

const GraphQL = require("graphql");
const Book = require("./models/book");
const Author = require("./models/author");

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

  type Query {
    bookCount: Int
    authorCount: Int
    allBooks(author: String, genre: String): [Book]!
    allAuthors: [Author]!
  }
  
  type Mutation {
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
  },

  Mutation: {
    addBook: async (root, args) => {
      let author = await Author.findOne({ name: args.author });
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
      return book;
    },
    editAuthor: async (root, args) => {
      let author = await Author.findOne({ name: args.name });

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
    });
  })
  .then((res) => {
    console.log(`Server ready at ${res.url}`);
  });
