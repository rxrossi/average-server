const JWT = require("jsonwebtoken");
const Article = require("../../app/articles/model");
const User = require("../../app/users/model");
const config = require("../../config");
const setupServer = require("../../app");
const fetch = require("../../testHelpers/fetch");
const mongoose = require("mongoose");
const { HOST, PORT, MONGODB_TEST } = require("../../config");

let server;
const BASE_URL = HOST + ":" + PORT;
const USERS_ENDPOINT = BASE_URL + "/users";
const SIGNUP_ENDPOINT = USERS_ENDPOINT + "/signup";
const ARTICLES_ENDPOINT = BASE_URL + "/articles";
const MYARTICLES_ENDPOINT = ARTICLES_ENDPOINT + "/my-articles";

const headers = {
  Accept: "application/json, text/plain, */*",
  "Content-Type": "application/json"
};

describe("Articles", () => {
  beforeEach(async done => {
    server = await setupServer(PORT, MONGODB_TEST);
    done();
  });

  afterEach(async done => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await server.close();
    done();
  });

  test("return a list of articles on GET", async () => {
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

  test("can save and article if has at least a link", async () => {
    // Prepare
    const article = {
      link: "some-unique-title"
    };

    // ACT
    const { response } = await createUserAndThenArticle(article);

    // Assert
    expect(response.message).toEqual("Article saved");
  });

  test("can save an article (POST)", async () => {
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

  test("Article.link are unique", async () => {
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

  test("Article.author is a user object, not a id (GET)", async () => {
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

  test("GET on /articles/my-articles", async () => {
    // Prepare
    // Creating an article of a different user
    const userTwo = new User({
      email: `user2-${Date.now()}@apitest.com`,
      password: "pw2",
      confirmPassword: "pw2"
    });
    await userTwo.save();
    const articleTwo = new Article({
      author: userTwo.id,
      content: "content 2 ",
      tags: ["atag"],
      link: "title-number2",
      mainImg: "someUrl",
      description: "Some nice description of article two here",
      title: "A good title for article two",
      published: true,
      creationDate: "2018-04-28T22:51:56.167Z"
    });

    await articleTwo.save();

    // Create the article and user that will be asserted against
    const userOne = {
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

    const { token } = await createUserAndThenArticle(article, {
      customUser: userOne,
      getTokenToo: true
    });

    // Act
    const response = await fetch(MYARTICLES_ENDPOINT, {
      headers: {
        ...headers,
        authorization: token
      }
    });

    // Assert
    expect(response.response.articles.length).toBe(1);
    expect(response.response.articles[0]).toMatchObject(article);
  });
});

async function createUserAndThenArticle(
  article,
  { expectError = false, customUser, getTokenToo } = {}
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

  if (getTokenToo) {
    return {
      token,
      response: answer
    };
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
