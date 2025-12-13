import { useEffect, useState } from "react";
import { socket } from "../socket";

export default function StudentPoll() {
  const [poll, setPoll] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // 🔌 Listen to poll events
  useEffect(() => {
    socket.on("poll_started", (data) => {
      console.log("Poll started:", data);
      setPoll(data);
      setSubmitted(false);
    });

    socket.on("poll_end", () => {
      setSubmitted(true);
    });

    return () => {
      socket.off("poll_started");
      socket.off("poll_end");
    };
  }, []);

  // 🟣 Submit answer
  const studentName = localStorage.getItem("studentName");
  const submitAnswer = (option) => {
    const name = localStorage.getItem("studentName");

    socket.emit("submit_answer", {
      name,
      answer: option,
    });

    setSubmitted(true);
  };

  // 🕒 No poll yet
  if (!poll) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Waiting for teacher to start the poll…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="bg-white w-full max-w-xl p-6 rounded-xl shadow">
        <h2 className="text-2xl font-semibold mb-6">{poll.question}</h2>

        {/* Options */}
        <div className="space-y-3">
          {poll.options.map((option, index) => (
            <button
              key={index}
              disabled={submitted}
              onClick={() => submitAnswer(option)}
              className={`w-full px-4 py-3 rounded-md text-left
                ${
                  submitted
                    ? "bg-gray-200 cursor-not-allowed"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
            >
              {option}
            </button>
          ))}
        </div>

        {submitted && (
          <p className="text-center text-green-600 mt-4 font-medium">
            Answer submitted!
          </p>
        )}
      </div>
    </div>
  );
}
