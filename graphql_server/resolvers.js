const jwt = require("jsonwebtoken");
const { GraphQLError } = require("graphql");

const Book = require("./models/book");
const Author = require("./models/author");
const User = require("./models/user");

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
        throw new GraphQLError("not authenticated", {
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
          throw new GraphQLError("Saving author failed", {
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
        throw new GraphQLError("Saving book failed", {
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
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      author.born = args.setBornTo;

      try {
        await author.save();
      } catch (error) {
        throw new GraphQLError("Saving author failed", {
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
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      });

      return user.save().catch((error) => {
        throw new GraphQLError("Creating the user failed", {
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
        throw new GraphQLError("wrong credentials", {
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
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      currentUser.favoriteGenre = args.favoriteGenre;

      try {
        await currentUser.save();
      } catch (error) {
        throw new GraphQLError("Saving user failed", {
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

module.exports = resolvers;
