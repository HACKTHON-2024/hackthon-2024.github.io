import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";  
import Login from "./pages/Auth/Login";
import Header from "./components/Header";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
