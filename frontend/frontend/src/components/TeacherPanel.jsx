import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { socket } from "../socket";

export default function TeacherPanel() {
  // ===== FORM STATE =====
  const [question, setQuestion] = useState("");
  const [time, setTime] = useState(60);
  const [options, setOptions] = useState([{ text: "" }, { text: "" }]);

  // ===== ACTIVE POLL STATE =====
  const [pollActive, setPollActive] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState([]);
  const [results, setResults] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);

  // ================= SOCKET LISTENERS =================
  useEffect(() => {
    socket.on("poll_started", (data) => {
      setPollActive(true);
      setActiveQuestion(data.question);
      setPollOptions(data.options);
      setResults({});
      setTimeLeft(data.duration / 1000);

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

    socket.on("poll_update", (answers) => {
      setResults(answers);
    });

    socket.on("poll_end", () => {
      setTimeLeft(0);
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

      {/* ================= CREATE POLL ================= */}
      {!pollActive && (
        <>
          <div className="flex justify-between items-center mb-6 max-w-4xl">
            <label className="font-medium">Enter your question</label>

            <select
              value={time}
              onChange={(e) => setTime(Number(e.target.value))}
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
              className="text-purple-600 border px-3 py-2 rounded-lg text-sm font-medium"
            >
              + Add More option
            </button>
          </div>
        </>
      )}

      {/* ================= LIVE RESULTS ================= */}
      {pollActive && (
        <div className="w-full max-w-3xl mx-auto mt-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Question {/** you can add number later */}
            </h2>

            {timeLeft !== null && (
              <div className="flex items-center gap-2 text-red-600 font-semibold">
                ⏱ {timeLeft}
              </div>
            )}
          </div>

          <div className="bg-[#373737] p-2 rounded-t-lg text-white text-lg font-semibold mb-4">{activeQuestion}</div>

          {/* Results */}
          <div className="space-y-4">
            {(() => {
              const counts = getCounts();
              const total =
                Object.values(counts).reduce((a, b) => a + b, 0) || 1;

              return Object.entries(counts).map(([option, count], index) => {
                const percent = Math.round((count / total) * 100);

                return (
                  <div
                    key={option}
                    className="relative w-full rounded-lg overflow-hidden border"
                  >
                    {/* Filled background */}
                    <div
                      className="absolute inset-y-0 left-0 border-none bg-linear-to-r from-primary via-accent to-secondary"
                      style={{ width: `${percent}%` }}
                    />

                    {/* Content */}
                    <div className="relative z-10 flex items-center justify-between px-4 py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-black font-semibold">
                          {index + 1}
                        </div>
                        <span className="font-medium text-black">{option}</span>
                      </div>

                      <span className="font-semibold text-black">
                        {percent}%
                      </span>
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          

          {/* Ask New Question */}
          <div className="flex justify-center mt-6">
            <button
              disabled={timeLeft > 0}
              onClick={() => setPollActive(false)}
              className={`px-8 py-3 rounded-full font-medium text-white
          ${
            timeLeft > 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-linear-to-r from-primary via-accent to-secondary hover:bg-accent hover:cursor-pointer"
          }`}
            >
              + Ask a new question
            </button>
          </div>
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
