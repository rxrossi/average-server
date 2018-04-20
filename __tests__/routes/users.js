const setupServer = require("../../app");
const fetch = require('../../testHelpers/fetch')
const { HOST, PORT } = require("../../config");

let server;
const BASE_URL = HOST + ":" + PORT;
const USERS_ENDPOINT = BASE_URL + "/users";
const SIGNIN_ENDPOINT = USERS_ENDPOINT + "/signin";
const SIGNUP_ENDPOINT = USERS_ENDPOINT + "/signup";

const headers = {
  'Accept': 'application/json, text/plain, */*',
  'Content-Type': 'application/json'
}

describe("Users routes", () => {
  beforeEach(async done => {
    server = await setupServer(PORT);
    done();
  });

  afterEach(async done => {
    await server.close();
    done();
  });

  describe("SignUp", () => {
    test("empty fields", async () => {
      const { error } = await fetch(SIGNUP_ENDPOINT, {
        method: 'POST',
        headers,
      })

      expect(error).toEqual({
        fields: {
          email: '"Email" is required',
          password: '"Password" is required',
          confirmPassword: '"Confirm password" is required',
        }
      });
    });

    test('case passwords does not match', async () => {
      const { error } = await fetch(SIGNUP_ENDPOINT, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: 'user@mail.com',
          password: 'pw1',
          confirmPassword: 'pw2'
        })
      })

      expect(error).toEqual({
        message: "Passwords does not match"
      });
    });
  });

  describe("SignIn", () => {
    test("with incorrect credentials", async () => {
      const { error } = await fetch(
        SIGNIN_ENDPOINT, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            email: "invalid@mail.com",
            password: "invalid"
          })
        }
      )

      expect(error).toEqual({
        message: "Invalid credentials"
      });
    });
  });
});
