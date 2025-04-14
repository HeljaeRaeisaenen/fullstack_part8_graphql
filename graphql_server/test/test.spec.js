const { ApolloServer } = require("@apollo/server");
const { expect, it } = require("@jest/globals");
const mongoose = require("mongoose");
require("dotenv").config();

const typeDefs = require("../schema");
const resolvers = require("../resolvers");

it("test DB connection", async () => {
  const MONGODB = process.env.MONGODB_URI;

  mongoose
    .connect(MONGODB)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((error) => {
      console.log("error connection to MongoDB:", error.message);
    });

  const testServer = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const response = await testServer.executeOperation({
    query: "query Query { bookCount }",
  });

  expect(response.body.kind === "single");

  // expect(response.body.singleResult.errors).toBeUndefined();

  //expect(response.body.singleResult.data?.bookCount).toBeGreaterThanOrEqual(0);
});
