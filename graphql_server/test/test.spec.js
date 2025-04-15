const { ApolloServer } = require("@apollo/server");
const { expect, it, beforeAll, afterAll, describe } = require("@jest/globals");
const mongoose = require("mongoose");
require("dotenv").config();

const typeDefs = require("../schema");
const resolvers = require("../resolvers");

describe("server testing", () => {
  // not modifying data in the DB bc we're not using a separate test DB
  let testServer;

  beforeAll(() => {
    const MONGODB = process.env.MONGODB_URI;
    mongoose
      .connect(MONGODB)
      .then(() => {
        console.log("Connected to MongoDB");
      })
      .catch((error) => {
        console.log("error connection to MongoDB:", error.message);
      });

    testServer = new ApolloServer({
      typeDefs,
      resolvers,
    });
  });

  afterAll(async () => {
    await testServer?.stop();
    mongoose.connection.close();
  });

  it("test DB connection", async () => {
    const response = await testServer.executeOperation({
      query: "query AllAuthors { allAuthors { name } }",
    });

    expect(response.body.kind === "single");

    expect(response.body.singleResult.errors).toBeUndefined();

    expect(response.body.singleResult.data?.allAuthors[0]?.name).toBeTruthy();
  });
});
