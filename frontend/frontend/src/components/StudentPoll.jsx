import { useEffect, useState } from "react";
import { socket } from "../socket";

export default function StudentPoll() {
  const [poll, setPoll] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [results, setResults] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);

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

  if (!poll) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Waiting for teacher to start the poll…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-xl rounded-xl shadow overflow-hidden p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-3 text-sm">
          <span className="font-medium"> Question {poll.questionNumber}</span>
          <span className="text-red-600 font-semibold">
            ⏱ {String(timeLeft).padStart(2, "0")}
          </span>
        </div>

        {/* Question */}
        {!submitted && (
          <>
            <div className="bg-[#373737] text-white p-3 rounded-md mb-4">
              {poll.question}
            </div>

            {/* Options */}
            <div className="space-y-3">
              {poll.options.map((option, index) => (
                <div
                  key={index}
                  onClick={() => {
                    if (!submitted && timeLeft > 0) setSelectedOption(option);
                  }}
                  className={`px-4 py-3 rounded-md border flex items-center gap-3
                ${
                  selectedOption === option
                    ? "border-purple-600 bg-purple-50"
                    : "border-gray-200 bg-gray-100"
                }
                ${
                  submitted || timeLeft === 0
                    ? "opacity-60 cursor-not-allowed"
                    : "cursor-pointer"
                }
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
            disabled={!selectedOption || submitted || timeLeft === 0}
            onClick={submitAnswer}
            className={`px-6 py-3 rounded-full font-medium text-white
              ${
                !selectedOption || submitted || timeLeft === 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
          >
            Submit
          </button>
        </div>
        </>
        )}

        {/* Results */}
        {(submitted || timeLeft === 0) && (
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Live Poll Results</h3>

            {(() => {
              const counts = {};
              poll.options.forEach((opt) => (counts[opt] = 0));
              Object.values(results).forEach((ans) => {
                if (counts[ans] !== undefined) counts[ans]++;
              });

              const total =
                Object.values(counts).reduce((a, b) => a + b, 0) || 1;

              return Object.entries(counts).map(([option, count]) => (
                <div key={option} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{option}</span>
                    <span>{Math.round((count / total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded">
                    <div
                      className="bg-purple-600 h-2 rounded"
                      style={{
                        width: `${(count / total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ));
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
