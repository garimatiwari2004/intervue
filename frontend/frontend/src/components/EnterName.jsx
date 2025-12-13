import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";

export default function EnterName() {
  const [value, setValue] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!value.trim()) return;

    socket.emit("join", { name: value, role: "student" });
    navigate("/poll");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">

      {/* Badge */}
      <div className="flex items-center gap-2 bg-[#5a4fcf] text-white px-4 py-1 rounded-full mb-6">
        <Sparkles size={16} />
        <span className="text-sm font-medium">Intervue Poll</span>
      </div>

      {/* Heading */}
      <h1 className="text-4xl font-light text-black mb-2">
        Let’s <span className="font-semibold">Get Started</span>
      </h1>

      {/* Subtitle */}
      <p className="text-center max-w-xl text-gray-500 mb-8 leading-relaxed">
        If you’re a student, you’ll be able to <span className="font-semibold">submit your answers</span>, 
        participate in live polls, and see how your responses compare with your classmates.
      </p>

      {/* Input Label */}
      <label className="block  text-left   text-gray-700 font-medium ">
        Enter your Name
      </label>

      {/* Input */}
      <input
        className="w-full max-w-md border border-gray-300 rounded-md px-4 py-3 text-gray-700 
                   focus:outline-none focus:ring-2 focus:ring-accent         mb-6"
        placeholder="Your Name"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      {/* Continue Button */}
      <button
        onClick={handleSubmit}
        disabled={!value.trim()}
        className={`w-full max-w-md py-3 rounded-md text-white font-semibold text-lg
          transition-all duration-200
          ${value.trim()
            ? "bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90"
            : "bg-gray-300 cursor-not-allowed"
          }`}
      >
        Continue
      </button>
    </div>
  );
}
