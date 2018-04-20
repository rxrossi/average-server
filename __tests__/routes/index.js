const fetch = require("isomorphic-fetch");
const setupServer = require("../../app");
const { HOST, PORT } = require("../../config");

let server;

const BASE_URL = HOST + ":" + PORT;

describe("Routes tests", () => {
  beforeEach(async done => {
    server = await setupServer(PORT);
    done();
  });

  afterEach(async done => {
    await server.close();
    done();
  });

  it("responds with 200 code on index route", async () => {
    const { status } = await fetch(BASE_URL)
      .then(res => res)
      .catch(e => console.log(e));

    expect(status).toBe(200);
  });
});
