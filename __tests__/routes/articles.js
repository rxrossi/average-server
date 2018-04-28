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
    // Prepare
    const article = {
      content: "content"
    };

    // ACT
    const { error } = await createUserAndThenArticle(article, {
      expectError: true
    });

    // Assert
    expect(error.code).toEqual(422);
    expect(error.message).toEqual("Could not save the article");
    expect(error.fields).toEqual({
      published: "Path `published` is required.",
      mainImg: "Path `mainImg` is required.",
      title: "Path `title` is required.",
      description: "Path `description` is required.",
      link: "Path `link` is required."
    });
  });

  test("can save an article", async () => {
    // Prepare
    const article = {
      content: "content",
      tags: ["Auth", "Node.js"],
      link: "title-number",
      mainImg: "someUrl",
      description: "Some nice description here",
      title: "A good title",
      published: true,
      creationDate: Date.now()
    };

    // Act
    const { response } = await createUserAndThenArticle(article);

    // Assert
    expect(response.message).toEqual("Article saved");
    const x = await Article.find({});
    expect(x[0].content).toBe(article.content);
  });

  test("can GET by link", async () => {
    // Prepare
    const article = {
      content: "content",
      tags: ["Auth", "Node.js"],
      link: "title-number",
      mainImg: "someUrl",
      description: "Some nice description here",
      title: "A good title",
      published: true,
      creationDate: "2018-04-28T22:51:56.167Z"
    };
    await createUserAndThenArticle(article);

    // Act
    const { response } = await fetch(`${ARTICLES_ENDPOINT}/${article.link}`);

    // Assert
    expect(response.article).toMatchObject(article);
  });

  test("Articles.link are unique", async () => {
    // Prepare
    const article = {
      content: "content",
      tags: ["Auth", "Node.js"],
      link: "title-number",
      mainImg: "someUrl",
      description: "Some nice description here",
      title: "A good title",
      published: true,
      creationDate: "2018-04-28T22:51:56.167Z"
    };

    // Act
    await createUserAndThenArticle(article);
    const { error } = await createUserAndThenArticle(article, {
      expectError: true
    });

    // Assert
    expect(error).toEqual({
      message: "Could not save the article",
      code: 422,
      fields: {
        link: "Error, expected `link` to be unique. Value: `title-number`"
      }
    });
  });

  test("Article.author is a user object, not a id", async () => {
    // Prepare
    const user = {
      email: `user-${Date.now()}@apitest.com`,
      password: "pw1",
      confirmPassword: "pw1"
    };

    const article = {
      content: "content",
      tags: ["Auth", "Node.js"],
      link: "title-number",
      mainImg: "someUrl",
      description: "Some nice description here",
      title: "A good title",
      published: true,
      creationDate: "2018-04-28T22:51:56.167Z"
    };

    await createUserAndThenArticle(article, {
      customUser: user
    });

    // Act
    const { response } = await fetch(`${ARTICLES_ENDPOINT}/${article.link}`);

    // Assert
    expect(response.article.author).toMatchObject({ email: user.email });
  });
});

async function createUserAndThenArticle(
  article,
  { expectError = false, customUser } = {}
) {
  // Prepare
  const user = customUser || {
    email: `user-${Date.now()}@apitest.com`,
    password: "pw1",
    confirmPassword: "pw1"
  };
  const token = await createUserGetToken(user);

  // Act
  const answer = await fetch(ARTICLES_ENDPOINT, {
    method: "POST",
    headers: {
      ...headers,
      authorization: token
    },
    body: JSON.stringify(article)
  });

  const { response, error } = answer;
  if (error && !expectError) {
    console.error(error);
  }

  return answer;
}

async function createUserGetToken(user) {
  const answer = await fetch(SIGNUP_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify(user)
  });

  if (answer.error) {
    console.error("Error while creating user", answer.error);
  }

  return answer.response.token;
}
