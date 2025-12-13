const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

let pollState = {
  active: false,
  question: "",
  questionNumber: 0,   
  options: [],
  answers: {},
  startTime: null,
  duration: 60000,
  timer: null,
};

function endPoll() {
  if (!pollState.active) return;

  clearTimeout(pollState.timer);
  pollState.active = false;

  io.emit("poll_end", {
    results: pollState.answers,
  });

  console.log("Poll ended");
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", ({ name, role }) => {
    // If poll already running, sync state
    if (pollState.active) {
      socket.emit("poll_started", {
        question: pollState.question,
        options: pollState.options,
        duration: pollState.duration,
      });

      socket.emit("poll_update", pollState.answers);
    }
  });

  socket.on("create_poll", ({ question, options, duration }) => {
    if (pollState.active) return;

    pollState.active = true;
    pollState.question = question;
    pollState.questionNumber += 1; 
    pollState.options = options;
    pollState.answers = {};
    pollState.startTime = Date.now();
    pollState.duration = duration || 60000;

    pollState.timer = setTimeout(endPoll, pollState.duration);

    io.emit("poll_started", {
      questionNumber: pollState.questionNumber,
      question: pollState.question,
      options: pollState.options,
      duration: pollState.duration,
    });

    console.log("Poll started:", question);
  });

  socket.on("submit_answer", ({ name, answer }) => {
    if (!pollState.active) return;

    pollState.answers[name] = answer;

    io.emit("poll_update", pollState.answers);

    console.log("Answer received:", name, answer);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});  