const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

// Socket.io server
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

let pollState = {
    active: false,
    question: "",
    options: [],
    answers: {},
    startTime: null,
    duration: 60000,  // 60 seconds
    timer: null,
    totalStudents: 0
};

function endPoll() {
    if (!pollState.active) return;

    clearTimeout(pollState.timer); // stop timer if active

    pollState.active = false;

    io.emit("poll_end", {
        results: pollState.answers
    });

    console.log("Poll ended");
}



io.on("connection", (socket) => {

    console.log("A user connected:", socket.id);
    socket.on("join", ({ name, role }) => {
        if (role === "student") {
            pollState.totalStudents++;
        }
    });


    socket.on("create_poll", ({ question, options }) => {
        if (pollState.active) return;

        pollState.active = true;
        pollState.question = question;
        pollState.options = options;
        pollState.answers = {};
        pollState.startTime = Date.now();


        pollState.timer = setTimeout(() => {
            endPoll();
        }, pollState.duration);

        io.emit("poll_started", {
            question,
            options,
            duration: pollState.duration
        });

        console.log("Poll started:", question);
    });

    socket.on("submit_answer", ({ name, answer }) => {
        if (!pollState.active) return;

        // Save student’s answer
        pollState.answers[name] = answer;

        // Broadcast live update
        io.emit("poll_update", pollState.answers);

        // If all students answered → end poll early
        if (Object.keys(pollState.answers).length === pollState.totalStudents) {
            endPoll();
        }
    });



    socket.on("disconnect", () => {
        pollState.totalStudents = Math.max(0, pollState.totalStudents - 1);
        console.log("User disconnected:", socket.id);
    });
});

server.listen(5000, () => {
    console.log("Server running on port 5000");
});
