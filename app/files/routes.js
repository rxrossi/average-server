const express = require("express");
const fileUpload = require("express-fileupload");
const path = require("path");

const storage = path.join(process.cwd(), `fileStorage`);

module.exports = setupFileStorageRoutes;

function setupFileStorageRoutes(app, route = "/files") {
  app.use(fileUpload());

  app.post(route, async (req, res) => {
    if (!req.files) {
      return res.status(422).json({
        error: {
          message: "No files receive"
        }
      });
    }
    const file = req.files.file;
    const fileName = Date.now() + file.name;

    //move the file
    const filePath = path.join(storage, fileName);

    const err = await file.mv(filePath);
    if (err) {
      return res.status(500).json({
        error: {
          message: err
        }
      });
    }

    res.json({
      response: {
        storedAt: route + "/" + fileName
      }
    });
  });

  app.use(route, express.static(storage));
}
