require("dotenv").config();
const Person = require("./models/contact");
//const { response, request } = require("express");
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

app.get("/api/people", (request, response, next) => {
  Person.find({})
    .then((result) => {
      response.send(result);
    })
    .catch((error) => {
      next(error);
    });
});

app.get("/api/people/:id", (request, response, next) => {
  const id = request.params.id;
  Person.findById(id)
    .then((result) => {
      if (result) {
        response.json(result);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => {
      next(error);
    });
});

app.post("/api/people", (request, response, next) => {
  const body = request.body;
  const newPerson = new Person({
    name: body.name,
    number: body.number,
  });
  newPerson
    .save()
    .then((returnedPerson) => response.status(201).json(returnedPerson))
    .catch((error) => {
      console.log(error);
      next(error);
    });
});

app.put("/api/people/:id", (request, response, next) => {
  const body = request.body;
  Person.findByIdAndUpdate(
    request.params.id,
    { number: body.number },
    { new: true },
    (error, returnedPerson) => {
      if (error) {
        response.status(400).json(error);
      } else {
        response.status(201).json(returnedPerson);
      }
    }
  ).catch((error) => next(error));
});

app.delete("/api/people/:id", (request, response, next) => {
  const id = request.params.id;
  Person.findByIdAndRemove(id)
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.get("/info", (request, response, next) => {
  const dateNow = new Date().toString();
  Person.find({})
    .then((result) => {
      response.send(
        `<p>Phonebook has info for ${result.length} people</p><p>${dateNow}</p>`
      );
    })
    .catch((error) => {
      next(error);
    });
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  if (error.name === "CastError") {
    response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    response.status(400).json({ error: error.message });
  } else {
    console.log(error);
    response.status(500).json(error.message);
  }
  next(error);
};
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
