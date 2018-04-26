const JWT = require("jsonwebtoken");
const Article = require("../../app/articles/model");
const config = require("../../config");
const setupServer = require("../../app");
const fetch = require("../../testHelpers/fetch");
const mongoose = require("mongoose");
const { HOST, PORT } = require("../../config");

let server;
const BASE_URL = HOST + ":" + PORT;
const USERS_ENDPOINT = BASE_URL + "/users";
const SIGNUP_ENDPOINT = USERS_ENDPOINT + "/signup";
const ARTICLES_ENDPOINT = BASE_URL + "/articles";

const headers = {
  Accept: "application/json, text/plain, */*",
  "Content-Type": "application/json"
};

describe("Articles", () => {
  beforeEach(async done => {
    server = await setupServer(PORT);
    done();
  });

  afterEach(async done => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await server.close();
    done();
  });

  test("return a list of article on GET", async () => {
    const { response } = await fetch(ARTICLES_ENDPOINT);

    expect(response.articles).toEqual([]);
  });

  test("POST requires auth", async () => {
    const { error } = await fetch(ARTICLES_ENDPOINT, {
      method: "POST",
      headers
    });

    expect(error.message).toEqual("Unauthorized");
    expect(error.code).toEqual(401);
  });

  test("thows a nice error on invalid format", async () => {
    const user = {
      email: `user-${Date.now()}@apitest.com`,
      password: "pw1",
      confirmPassword: "pw1"
    };

    const token = await createUserGetToken(user);

    const article = {
      content: "content"
    };

    const { error } = await fetch(ARTICLES_ENDPOINT, {
      method: "POST",
      headers: {
        ...headers,
        authorization: token
      },
      body: JSON.stringify(article)
    });

    expect(error.code).toEqual(422);
    expect(error.message).toEqual("Could not save the article");
    expect(error.fields).toEqual({
      published: "Path `published` is required."
    });
  });

  test("can save an article", async () => {
    const user = {
      email: `user-${Date.now()}@apitest.com`,
      password: "pw1",
      confirmPassword: "pw1"
    };

    const token = await createUserGetToken(user);

    const article = {
      content: "content",
      tags: ["Auth", "Node.js"],
      published: true,
      creationDate: Date.now()
    };

    const answer = await fetch(ARTICLES_ENDPOINT, {
      method: "POST",
      headers: {
        ...headers,
        authorization: token
      },
      body: JSON.stringify(article)
    });

    const { response, error } = answer;
    if (error) {
      console.error(error);
    }

    expect(response.message).toEqual("Article saved");

    const x = await Article.find({});
    expect(x[0].content).toBe(article.content);
  });
});

async function createUserGetToken(user) {
  const { response: { token } } = await fetch(SIGNUP_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify(user)
  });

  return token;
}
