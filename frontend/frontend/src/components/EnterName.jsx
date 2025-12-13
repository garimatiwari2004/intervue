import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";

export default function EnterName() {
  const [value, setValue] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!value.trim()) return;

    sessionStorage.setItem("studentName", value);

    socket.emit("join", { name: value, role: "student" });
    navigate("/poll");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="flex items-center gap-2 bg-[#5a4fcf] text-white px-4 py-1 rounded-full mb-6">
        <Sparkles size={16} />
        <span className="text-sm font-medium">Intervue Poll</span>
      </div>

      <h1 className="text-4xl font-light mb-2">
        Let’s <span className="font-semibold">Get Started</span>
      </h1>

      <p className="text-center max-w-xl text-gray-500 mb-8">
        Submit answers, participate in live polls, and compare responses.
      </p>

      <label className="text-gray-700 font-medium">Enter your Name</label>

      <input
        className="w-full max-w-md border rounded-md px-4 py-3 mb-6"
        placeholder="Your Name"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        disabled={!value.trim()}
        className={`w-full max-w-md py-3 rounded-md text-white font-semibold
          ${value.trim()
            ? "bg-gradient-to-r from-purple-500 to-indigo-500"
            : "bg-gray-300 cursor-not-allowed"}`}
      >
        Continue
      </button>
    </div>
  );
}
