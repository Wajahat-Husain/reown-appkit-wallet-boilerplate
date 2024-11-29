import { Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage.jsx";
import ConnectionContextProvider from "./context/ConnectionContextProvider.jsx";
import "./App.css";

function App() {
  return (
    <ConnectionContextProvider>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/connect" element={<MainPage />} />
      </Routes>
    </ConnectionContextProvider>
  );
}

export default App;
