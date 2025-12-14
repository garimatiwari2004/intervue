import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RoleSelection() {
    const [selectedRole, setSelectedRole] = useState(null);
    const navigate = useNavigate();

    const handleContinue = () => {
        if (selectedRole === "student") navigate("/student");
        if (selectedRole === "teacher") navigate("/teacher");
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center space-y-5 p-5">
            
            <div className="flex font-semibold text-white gap-2 bg-linear-to-r from-primary via-secondary to-accent px-3 py-2 rounded-4xl shadow-lg text-center">
                <Sparkles />
                <h2 className="text-md">Intervue Poll</h2>
            </div>

            <div className="text-center mx-2">
                <span className="text-xl">Welcome to </span>
                <span className="text-xl font-bold">Live Polling System</span>
                <div className="text-md text-gray-400">
                    Please select your role
                </div>
            </div>

            <div className="mt-4 flex gap-6 flex-col md:flex-row">

                {/* Student card */}
                <div
                    onClick={() => setSelectedRole("student")}
                    className={`border px-4 py-4 rounded-lg cursor-pointer w-auto md:w-80 transition-all
                        ${selectedRole === "student"
                            ? "border-accent bg-accent/10 shadow-md"
                            : "border-gray-300 hover:border-accent"}`}
                >
                    <h2 className="font-bold text-lg">I am a Student</h2>
                    <h3 className="text-md text-gray-700">
                        Join polls and answer questions.
                    </h3>
                </div>

                {/* Teacher card */}
                <div
                    onClick={() => setSelectedRole("teacher")}
                    className={`border px-4 py-4 rounded-lg cursor-pointer w-auto md:w-80 transition-all
                        ${selectedRole === "teacher"
                            ? "border-accent bg-accent/10 shadow-md"
                            : "border-gray-300 hover:border-accent"}`}
                >
                    <h2 className="font-bold text-lg">I am a Teacher</h2>
                    <h3 className="text-md text-gray-700">
                        Create polls and view live results.
                    </h3>
                </div>
            </div>

            {/* Continue Button */}
            <div className="mt-4">
                <button
                    onClick={handleContinue}
                    disabled={!selectedRole}
                    className={`px-6 py-3 rounded-4xl w-48 font-semibold text-white
                        transition-all
                        ${selectedRole
                            ? "bg-linear-to-r from-primary via-accent to-secondary hover:opacity-90"
                            : "bg-gray-400 cursor-not-allowed"}`}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
