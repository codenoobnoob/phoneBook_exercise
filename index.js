const { response, request } = require("express");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();
app.use(cors());
app.use(express.json());
morgan.token("body", function (req) {
  return JSON.stringify(req.body);
});
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendick",
    number: "39-23-634253463",
  },
];

const generateNewId = () => {
  const newId = Math.round(Math.random() * 1000);
  return newId;
};

app.get("/", (req, res) => {
  res.send("hello world!");
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.post("/api/persons", (request, response) => {
  const body = request.body;
  const existingNumber = persons.find((person) => person.name === body.name);
  if (body.name && body.number && !existingNumber) {
    newPerson = {
      id: generateNewId(),
      name: body.name,
      number: body.number,
    };
    persons = persons.concat(newPerson);
    response.status(201).end(`person ${body.name} created!`);
  } else {
    response.status(400).json({
      error: `name must be unique`,
    });
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);
  response.status(204).end();
});

app.get("/info", (request, response) => {
  const dateNow = new Date().toString();
  response.send(
    `<p>Phonebook has info for ${persons.length} people</p><p>${dateNow}</p>`
  );
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
