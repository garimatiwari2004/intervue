import { useEffect, useState } from "react";
import { socket } from "../socket";
import { Sparkles } from "lucide-react";

export default function StudentPoll() {
  const [poll, setPoll] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [results, setResults] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);

  // ================= SOCKET LISTENERS =================
  useEffect(() => {
    socket.on("poll_started", (data) => {
      setPoll(data);
      setSubmitted(false);
      setResults({});
      setSelectedOption(null);
      setTimeLeft(data.duration / 1000);

      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setSubmitted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    socket.on("poll_update", (answers) => {
      setResults(answers);
    });

    socket.on("poll_end", () => {
      setSubmitted(true);
      setTimeLeft(0);
    });

    return () => {
      socket.off("poll_started");
      socket.off("poll_update");
      socket.off("poll_end");
    };
  }, []);

  // ================= SUBMIT ANSWER =================
  const submitAnswer = () => {
    if (!selectedOption) return;

    const name = sessionStorage.getItem("studentName");
    if (!name) return;

    socket.emit("submit_answer", {
      name,
      answer: selectedOption,
    });

    setSubmitted(true);
  };

  // ================= EMPTY STATE =================
  if (!poll) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-xl font-bold">
        <div className="flex font-semibold text-white gap-2 bg-linear-to-r from-primary via-secondary to-accent px-3 py-2 rounded-4xl shadow-lg text-center">
                <Sparkles />
                <h2 className="text-md">Intervue Poll</h2>
        </div>
        <div className="border-b-4 border-accent animate-spin w-10 h-10 mt-10 mb-6 rounded-full flex items-center justify-center">

        </div>

        Waiting for teacher to ask the questions…
      </div>
    );
  }

  // ================= UI =================
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-xl rounded-xl shadow overflow-hidden p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-3 text-sm">
          <span className="font-medium">
            Question {poll.questionNumber ?? ""}
          </span>
          <span className="text-red-600 font-semibold">
            ⏱ {String(timeLeft).padStart(2, "0")}
          </span>
        </div>

        {/* ================= QUESTION + OPTIONS ================= */}
        {!submitted && (
          <>
            <div className="bg-[#373737] text-white p-3 rounded-md mb-4">
              {poll.question}
            </div>

            <div className="space-y-3">
              {poll.options.map((option, index) => (
                <div
                  key={index}
                  onClick={() => {
                    if (timeLeft > 0) setSelectedOption(option);
                  }}
                  className={`px-4 py-3 rounded-md border flex items-center gap-3
                    ${
                      selectedOption === option
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 bg-gray-100"
                    }
                    ${timeLeft === 0 ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-300 text-sm font-semibold">
                    {index + 1}
                  </div>
                  {option}
                </div>
              ))}
            </div>

            {/* Submit */}
            <div className="flex justify-end mt-6">
              <button
                disabled={!selectedOption || timeLeft === 0}
                onClick={submitAnswer}
                className={`px-6 py-3 rounded-full font-medium text-white
                  ${
                    !selectedOption || timeLeft === 0
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700"
                  }`}
              >
                Submit
              </button>
            </div>
          </>
        )}

        {/* ================= LIVE RESULTS ================= */}
        {(submitted || timeLeft === 0) && (
          <div className="mt-6">
            <div className="font-semibold mb-4 bg-[#373737] text-white p-2 rounded-t-lg">{poll.question}</div>

            {(() => {
              const counts = {};
              poll.options.forEach((opt) => (counts[opt] = 0));

              Object.values(results).forEach((ans) => {
                if (counts[ans] !== undefined) counts[ans]++;
              });

              const total =
                Object.values(counts).reduce((a, b) => a + b, 0) || 1;

              return Object.entries(counts).map(([option, count], index) => {
                const percent = Math.round((count / total) * 100);

                return (
                  <div
                    key={option}
                    className="relative mb-3 border border-purple-200 rounded-md overflow-hidden"
                  >
                    {/* Background */}
                    <div className="absolute inset-0 bg-gray-100" />

                    {/* Filled bar */}
                    <div
                      className="absolute inset-y-0 left-0 bg-linear-to-r from-primary via-accent to-secondary transition-all"
                      style={{ width: `${percent}%` }}
                    />

                    {/* Content */}
                    <div className="relative flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3 text-sm font-medium">
                        <div className="w-6 h-6 rounded-full bg-gray-200 text-black flex items-center justify-center text-xs font-semibold">
                          {index + 1}
                        </div>
                        <span>{option}</span>
                      </div>

                      <span className="text-sm font-semibold">
                        {percent}%
                      </span>
                    </div>
                  </div>
                );
              });
            })()}
            <h2 className="font-bold text-lg mt-10">Wait for the teacher to ask a new question..</h2>
          </div>
        )}
      </div>
    </div>
  );
}
