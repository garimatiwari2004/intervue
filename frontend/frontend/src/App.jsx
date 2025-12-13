import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import RoleSelection from "./components/RoleSelection";
import EnterName from "./components/EnterName";
import StudentPoll from "./components/StudentPoll";
import TeacherPanel from "./components/TeacherPanel";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/student" element={<EnterName />} />
        <Route path="/poll" element={<StudentPoll />} />
        <Route path="/teacher" element={<TeacherPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
