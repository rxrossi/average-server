const JWT = require("jsonwebtoken");
const config = require("../../config");
const setupServer = require("../../app");
const fetch = require("../../testHelpers/fetch");
const User = require("../../app/users/model");
const mongoose = require("mongoose");
const { HOST, PORT, MONGODB_TEST } = require("../../config");

let server;
const BASE_URL = HOST + ":" + PORT;
const USERS_ENDPOINT = BASE_URL + "/users";
const MYPROFILE_ENDPOINT = USERS_ENDPOINT + "/myprofile";
const SIGNIN_ENDPOINT = USERS_ENDPOINT + "/signin";
const SIGNUP_ENDPOINT = USERS_ENDPOINT + "/signup";

const headers = {
  Accept: "application/json, text/plain, */*",
  "Content-Type": "application/json"
};

describe("Users routes", () => {
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

  describe("SignUp", () => {
    test("empty fields", async () => {
      const { error } = await fetch(SIGNUP_ENDPOINT, {
        method: "POST",
        headers
      });

      expect(error).toEqual({
        fields: {
          email: '"Email" is required',
          password: '"Password" is required',
          confirmPassword: '"Confirm password" is required'
        }
      });
    });

    test("case passwords does not match", async () => {
      const { error } = await fetch(SIGNUP_ENDPOINT, {
        method: "POST",
        headers,
        body: JSON.stringify({
          email: "user@mail.com",
          password: "pw1",
          confirmPassword: "pw2"
        })
      });

      expect(error).toEqual({
        message: "Passwords does not match"
      });
    });

    test("actually save to the database", async () => {
      const user = {
        email: "user@mail.com",
        password: "pw1",
        confirmPassword: "pw1"
      };

      const token = await createUserAngGetToken(user);

      expect(token).toBeTruthy();
    });

    test("do not allow duplicates", async () => {
      const userSaveFn = () =>
        fetch(SIGNUP_ENDPOINT, {
          method: "POST",
          headers,
          body: JSON.stringify({
            email: "user@mail.com",
            password: "pw1",
            confirmPassword: "pw1"
          })
        });

      await userSaveFn();
      const { error } = await userSaveFn();

      expect(error).toEqual({ message: "Email is already in use" });
    });

    test("the token of signUp is valid", async () => {
      const { response: { token } } = await fetch(SIGNUP_ENDPOINT, {
        method: "POST",
        headers,
        body: JSON.stringify({
          email: "user@mail.com",
          password: "pw1",
          confirmPassword: "pw1"
        })
      });

      JWT.verify(token, config.JWT_SECRET);
    });
  });

  describe("SignIn", async () => {
    test("with incorrect credentials", async () => {
      const { error } = await fetch(SIGNIN_ENDPOINT, {
        method: "POST",
        headers,
        body: JSON.stringify({
          email: "invalid@mail.com",
          password: "invalid"
        })
      });

      expect(error).toEqual({ message: "Invalid credentials" });
    });

    test("returns validation errors for empty filds", async () => {
      const { error } = await fetch(SIGNIN_ENDPOINT, {
        method: "POST",
        headers
      });

      const expectedError = {
        fields: {
          email: '"Email" is required',
          password: '"Password" is required'
        }
      };

      expect(error).toEqual(expectedError);
    });

    test("can actually signIn", async () => {
      const user = {
        email: "user@mail.com",
        password: "pw1",
        confirmPassword: "pw1"
      };

      // Create a user
      await fetch(SIGNUP_ENDPOINT, {
        method: "POST",
        headers,
        body: JSON.stringify(user)
      });

      // Can signin with the credentials
      const { response: { token } } = await fetch(SIGNIN_ENDPOINT, {
        method: "POST",
        headers,
        body: JSON.stringify({
          email: user.email,
          password: user.password
        })
      });

      JWT.verify(token, config.JWT_SECRET);
    });
  });

  describe("PUT on / (Update user)", () => {
    it("can update user", async () => {
      // create a user and get a token
      const user = {
        email: "user@mail.com",
        password: "pw1",
        confirmPassword: "pw1"
      };
      const token = await createUserAngGetToken(user);

      // Act
      const updatedUser = {
        name: "Carlos D",
        photoLocation: {
          server: "this",
          path: "/photo.jpg"
        }
      };

      const response = await fetch(USERS_ENDPOINT, {
        method: "PUT",
        headers: {
          ...headers,
          authorization: token
        },
        body: JSON.stringify(updatedUser)
      });

      expect(response.response.message).toBe("User updated");

      // console.log(server);

      const expectedUser = {
        name: updatedUser.name,
        photo: `${HOST}:${PORT}/photo.jpg`
      };

      expect(response.response.user).toMatchObject(expectedUser);

      const userOnDb = await User.findOne({ email: user.email });
      expect(userOnDb).toMatchObject(updatedUser);
    });
  });

  describe("GET on /users/:userID ", () => {
    it("returns a user", async () => {
      // Create a user
      const email = "user@mail.com";
      const name = "Carlos D";
      const user = new User({
        email,
        password: "pw",
        name
      });
      await user.save();

      // ACT, send a get on /users/ID
      const { response } = await fetch(`${USERS_ENDPOINT}/${user.id}`);

      // Assert
      expect(response.user).toMatchObject({ email, name });
    });
  });

  describe("GET /users/myprofile", () => {
    it("returns user's profile", async () => {
      const email = "user@mail.com";
      const user = {
        email,
        password: "pw",
        confirmPassword: "pw"
      };
      const token = await createUserAngGetToken(user);

      const response = await fetch(MYPROFILE_ENDPOINT, {
        headers: {
          ...headers,
          authorization: token
        }
      });

      expect(response.response.user).toMatchObject({ email });
    });
  });
});

async function createUserAngGetToken(user) {
  const { response } = await fetch(SIGNUP_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify(user)
  });

  if (response && response.token) {
    return response.token;
  }

  return undefined;
}
