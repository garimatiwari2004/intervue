import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { socket } from "../socket";

export default function TeacherPanel() {
  // ===== FORM STATE =====
  const [question, setQuestion] = useState("");
  const [time, setTime] = useState(60);
  const [options, setOptions] = useState([
    { text: "" },
    { text: "" },
  ]);

  // ===== POLL STATE =====
  const [pollActive, setPollActive] = useState(false);
  const [pollOptions, setPollOptions] = useState([]);
  const [results, setResults] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);

  // ================= SOCKET LISTENERS =================
  useEffect(() => {
    // Poll started
    socket.on("poll_started", (data) => {
      console.log("TEACHER → poll_started", data);

      setPollActive(true);
      setPollOptions(data.options);
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

    const cleanedOptions = options
      .map((o) => o.text.trim())
      .filter(Boolean);

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
              className="text-purple-600 text-sm font-medium mt-2"
            >
              + Add More option
            </button>
          </div>
        </>
      )}

      {/* LIVE RESULTS */}
      {pollActive && (
        <div className="mt-10 max-w-4xl w-full">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Live Poll Results</h2>
            <span className="text-sm text-gray-600">
              Time left: <b>{timeLeft}s</b>
            </span>
          </div>

          {(() => {
            const counts = getCounts();
            const total =
              Object.values(counts).reduce((a, b) => a + b, 0) || 1;

            return (
              <div className="space-y-4">
                {Object.entries(counts).map(([option, count]) => {
                  const percent = Math.round((count / total) * 100);

                  return (
                    <div key={option}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{option}</span>
                        <span>{count} votes</span>
                      </div>

                      <div className="w-full bg-gray-200 h-3 rounded-full">
                        <div
                          className="bg-purple-600 h-3 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* ASK QUESTION BUTTON */}
      <div className="mt-auto flex justify-end">
        <button
          disabled={pollActive}
          onClick={handleAskQuestion}
          className={`px-6 py-3 rounded-full font-medium text-white
            ${
              pollActive
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-primary via-accent to-secondary"
            }`}
        >
          Ask Question
        </button>
      </div>
    </div>
  );
}
