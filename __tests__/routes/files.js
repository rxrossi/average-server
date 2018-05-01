const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const fetch = require("isomorphic-fetch");
const setupServer = require("../../app");
const { HOST, PORT, MONGODB_TEST } = require("../../config");

let server;

const BASE_URL = HOST + ":" + PORT;
const FILES_URL = BASE_URL + "/files";

describe("Routes tests", () => {
  beforeEach(async done => {
    server = await setupServer(PORT, MONGODB_TEST);
    done();
  });

  afterEach(async done => {
    await server.close();
    done();
  });

  it("responds with 200 code on index route", async () => {
    // const imgPath = "C:\\Users\\Rossi\\OneDrive\\Imagens\\aa.png";
    const imgPath = path.join(process.cwd(), "__tests__", "imageForTests.png");

    const buffer = await fs.createReadStream(imgPath);

    const body = new FormData();

    body.append("file", buffer);

    const response = await fetch(FILES_URL, {
      method: "POST",
      body,
      headers: {
        "Content-Type": `multipart/form-data; boundary=${body._boundary}`
      }
    })
      .then(res => res)
      .catch(e => console.log(e));

    expect(response.status).toBe(200);

    //Cleaning files
    const json = await response.json();
    const fileName = json.response.storedAt.split("/").reverse()[0];
    const filePath = path.join(process.cwd(), "fileStorage");
    fs.unlinkSync(path.join(filePath, fileName));
  });
});
