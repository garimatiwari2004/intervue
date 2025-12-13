import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { socket } from "../socket";

export default function TeacherPanel() {
  // ===== FORM STATE =====
  const [activeQuestion, setActiveQuestion] = useState("");

  const [question, setQuestion] = useState("");
  const [time, setTime] = useState(60);
  const [options, setOptions] = useState([{ text: "" }, { text: "" }]);

  // ===== POLL STATE =====
  const [pollActive, setPollActive] = useState(false);
  const [pollOptions, setPollOptions] = useState([]);
  const [results, setResults] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);

  // ================= SOCKET LISTENERS =================
  const getPercentage = (count, total) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  useEffect(() => {
    // Poll started
    socket.on("poll_started", (data) => {
      console.log("TEACHER → poll_started", data);

      setPollActive(true);
      setPollOptions(data.options);
      setActiveQuestion(data.question);
      setResults({});
      setTimeLeft(data.duration / 1000);

      // Countdown timer
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    // Live updates
    socket.on("poll_update", (answers) => {
      console.log("TEACHER → poll_update", answers);
      setResults(answers);
    });

    // Poll ended
    socket.on("poll_end", () => {
      console.log("TEACHER → poll_end");
      setPollActive(false);
    });

    return () => {
      socket.off("poll_started");
      socket.off("poll_update");
      socket.off("poll_end");
    };
  }, []);

  // ================= CREATE POLL =================
  const handleAskQuestion = () => {
    if (!question.trim()) return;

    const cleanedOptions = options.map((o) => o.text.trim()).filter(Boolean);

    if (cleanedOptions.length < 2) return;

    socket.emit("create_poll", {
      question: question.trim(),
      options: cleanedOptions,
      duration: time * 1000,
    });

    setQuestion("");
    setOptions([{ text: "" }, { text: "" }]);
  };

  // ================= RESULT COUNTS =================
  const getCounts = () => {
    const counts = {};
    pollOptions.forEach((opt) => (counts[opt] = 0));

    Object.values(results).forEach((ans) => {
      if (counts[ans] !== undefined) counts[ans]++;
    });

    return counts;
  };

  // ================= UI =================
  return (
    <div className="min-h-screen bg-white px-20 py-8 flex flex-col">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center gap-2 bg-gradient-to-r from-primary via-accent to-secondary text-white px-3 py-1 rounded-full text-sm">
          <Sparkles size={14} />
          Intervue Poll
        </div>
      </div>

      {/* TITLE */}
      <h1 className="text-3xl font-semibold mb-2">Let’s Get Started</h1>
      <p className="text-gray-500 mb-8 max-w-2xl">
        Create polls, ask questions, and monitor student responses in real time.
      </p>

      {/* CREATE POLL (ONLY WHEN NO ACTIVE POLL) */}
      {!pollActive && (
        <>
          <div className="flex justify-between items-center mb-6 max-w-4xl">
            <label className="font-medium">Enter your question</label>

            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="border px-3 py-1 rounded-md text-sm"
            >
              <option value={60}>60 seconds</option>
              <option value={45}>45 seconds</option>
              <option value={30}>30 seconds</option>
            </select>
          </div>

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question here..."
            className="w-full max-w-4xl bg-gray-100 rounded-md p-4 resize-none mb-6"
            rows={4}
          />

          <div className="max-w-4xl">
            <h3 className="font-medium mb-3">Edit Options</h3>

            {options.map((opt, idx) => (
              <div key={idx} className="flex gap-3 mb-3">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 text-sm font-semibold">
                  {idx + 1}
                </div>

                <input
                  value={opt.text}
                  onChange={(e) => {
                    const copy = [...options];
                    copy[idx].text = e.target.value;
                    setOptions(copy);
                  }}
                  placeholder="Option text"
                  className="w-full bg-gray-100 px-3 py-2 rounded-md"
                />
              </div>
            ))}

            <button
              onClick={() => setOptions([...options, { text: "" }])}
              className="text-purple-600 border p-2 rounded-lg text-sm font-medium mt-2"
            >
              + Add More option
            </button>
          </div>
        </>
      )}

      {/* LIVE RESULTS */}
      {pollActive && (
        <div className="flex flex-col items-center mt-16">
          {/* Section title */}
          <div className="w-full max-w-3xl mb-3 text-sm font-medium text-gray-700">
            Question
          </div>

          {/* Poll Card */}
          <div className="w-full max-w-3xl border border-purple-300 rounded-lg overflow-hidden">
            {/* Question Header */}
            <div className="bg-[#5f5f5f] text-white px-4 py-3 text-sm font-medium">
              {activeQuestion || "Question"}
            </div>

            {/* Results Body */}
            <div className="p-4 space-y-4 bg-white">
              {(() => {
                const counts = getCounts();
                const total =
                  Object.values(counts).reduce((a, b) => a + b, 0) || 1;

                return Object.entries(counts).map(([option, count], index) => {
                  const percent = Math.round((count / total) * 100);

                  return (
                    <div
                      key={option}
                      className="border border-purple-200 rounded-md p-2"
                    >
                      {/* Row */}
                      <div className="flex items-center justify-between mb-1 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-semibold">
                            {index + 1}
                          </div>
                          <span>{option}</span>
                        </div>

                        <span className="text-gray-700 font-medium">
                          {percent}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-100 h-3 rounded overflow-hidden">
                        <div
                          className="bg-purple-600 h-3 transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Ask New Question */}
          <button
            disabled={timeLeft > 0}
            onClick={() => setPollActive(false)}
            className={`mt-8 px-8 py-3 rounded-full font-medium text-white
        ${
          timeLeft > 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-purple-600 hover:bg-purple-700"
        }`}
          >
            + Ask a new question
          </button>
        </div>
      )}

      {/* ASK QUESTION BUTTON */}
      {!pollActive && (
        <div className="mt-auto flex justify-end">
          <button
            onClick={handleAskQuestion}
            className="px-6 py-3 rounded-full font-medium text-white bg-gradient-to-r from-primary via-accent to-secondary"
          >
            Ask Question
          </button>
        </div>
      )}
    </div>
  );
}
