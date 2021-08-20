require("dotenv").config();
const Person = require("./models/contact");
const { response, request } = require("express");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();
app.use(cors());
app.use(express.static("build"));
app.use(express.json());
morgan.token("body", function (req) {
  return JSON.stringify(req.body);
});
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

app.get("/", (req, res) => {
  res.send("hello world!");
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((result) => {
    response.send(result);
  });
});

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  Person.findById(id)
    .then((result) => {
      response.json(result);
    })
    .catch((error) => {
      response.status(404).end();
    });
});

app.post("/api/persons", (request, response) => {
  const body = request.body;
  Person.exists({ name: body.name }, (error, result) => {
    if (error) {
      response.status(500).send(error);
    } else if (!result) {
      if (body.name && body.number) {
        newPerson = new Person({
          name: body.name,
          number: body.number,
        });
        newPerson.save().then((result) => {
          response.status(201).send(result);
        });
      }
    } else {
      response.status(400).json({
        error: `name must be unique`,
      });
    }
  });
});

app.put("/api/persons/:id", (request, response) => {
  const body = request.body;
  Person.findByIdAndUpdate(body.id, { number: body.number }, { new: true })
    .then((returnedPerson) => {
      response.status(201).send(returnedPerson);
    })
    .catch((error) => {
      console.log("error while updating data in MongoDB: ", error);
    });
});
// Deletes the wrong person, always the first one in the table
app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  Person.findByIdAndRemove(id)
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.get("/info", (request, response) => {
  const dateNow = new Date().toString();
  Person.find({}).then((result) => {
    response.send(
      `<p>Phonebook has info for ${result.length} people</p><p>${dateNow}</p>`
    );
  });
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.log(error.message, error.name, error);
  if (error.name == "CastError") {
    response.status(400).send({ error: "malformatted id" });
  } else {
  }
  next(error);
};
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
