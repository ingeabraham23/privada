// eslint-disable-next-line no-unused-vars
import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Cronograma from "./components/Cronograma";
import Faenas from "./components/Faenas";
import Informacion from "./components/Informacion";

function App() {
  return (
    <HashRouter>
        <div>
          <Navbar />
          <Routes>
            <Route path="/" element={<Cronograma />} />
            <Route path="/faenas" element={<Faenas />} />
            <Route path="/informacion" element={<Informacion />} />
          </Routes>
        </div>
    </HashRouter>
  );
}

export default App;