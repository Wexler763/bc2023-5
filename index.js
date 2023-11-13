const express = require("express");
const app = express();
const fs = require("fs");
const bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer();

app.use(bodyParser.json());

const dataFilePath = 'data.json';


if (!fs.existsSync(dataFilePath)) {
  const initialData = {}; 
  fs.writeFileSync(dataFilePath, JSON.stringify(initialData, null, 2));
}


app.get("/UploadForm.html", (req, res) => {
  res.sendFile(__dirname + '/UploadForm.html');
});

app.get("/notes", (req, res) => {
  fs.readFile("data.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error reading the JSON file" });
    }
    try {

      const jsonData = JSON.parse(data);
      res.header("Content-Type", "application/json");
      res.send(JSON.stringify(jsonData, null, 2));
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error parsing JSON data" });
    }
  });
});

app.get("/notes/:noteName", (req, res) => {
  const noteName = req.params.noteName;

  fs.readFile("data.json", "utf8", (err, data) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ error: "Error reading the JSON file" });
      }

      const jsonData = JSON.parse(data);

      if (jsonData.hasOwnProperty(noteName)) {
          res.send(jsonData[noteName]);
      } else {
          res.status(404).send("Note not found");
      }
  });
});

app.post("/upload", upload.none(), (req, res) => {
  const formData = {
    note_name: req.body.note_name,
    note: req.body.note
  };

  if (!formData.note_name || !formData.note) {
    res.status(400).send("Both 'note_name' and 'note' fields are required.");
    return;
  }

  fs.readFile("data.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error reading the JSON file");
    }

    let jsonData = JSON.parse(data);

    // Check if the note name already exists
    if (jsonData.hasOwnProperty(formData.note_name)) {
      return res.status(400).send("Note with this name already exists. Choose a different name.");
    }

    // Add the new note to the data
    jsonData[formData.note_name] = formData.note;

    fs.writeFile("data.json", JSON.stringify(jsonData, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error writing to the JSON file");
      }

      res.status(201).send("Data written successfully");
    });
  });
});

app.put("/notes/:noteName", (req, res) => {
  const noteName = req.params.noteName;

  let updatedNote = '';

  req.on('data', chunk => {
    updatedNote += chunk;
  });

  req.on('end', () => {
    if (!updatedNote) {
      res.status(400).send("The request body should contain the updated note text.");
      return;
    }

    fs.readFile("data.json", "utf8", (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error reading the JSON file");
      }

      let jsonData = JSON.parse(data);

      if (jsonData.hasOwnProperty(noteName)) {
        jsonData[noteName] = updatedNote.trim(); 
        fs.writeFile("data.json", JSON.stringify(jsonData, null, 2), (err) => {
          if (err) {
            console.error(err);
            return res.status(500).send("Error writing to the JSON file");
          }

          res.send("Note updated successfully");
        });
      } else {
        res.status(404).send("Note not found");
      }
    });
  });
});



app.delete("/notes/:noteName", (req, res) => {
  const noteName = req.params.noteName;

  fs.readFile("data.json", "utf8", (err, data) => {
      if (err) {
          console.error(err);
          return res.status(500).send("Error reading the JSON file");
      }

      let jsonData = JSON.parse(data);

      if (jsonData.hasOwnProperty(noteName)) {
          delete jsonData[noteName];

          fs.writeFile("data.json", JSON.stringify(jsonData, null, 2), (err) => {
              if (err) {
                  console.error(err);
                  return res.status(500).send("Error writing to the JSON file");
              }

              res.send("Note deleted successfully");
          });
      } else {
          res.status(404).send("Note not found");
      }
  });
});



app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
