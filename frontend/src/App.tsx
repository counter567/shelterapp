/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import AnimalDetail from "./components/AnimalDetail";
import AnimalList from "./components/AnimalList";
import { requestData } from "./service/requestData";

function App() {
  useEffect(() => {
    requestData("/wp/v2")
      .then((data) => {
        console.log("all routes: ", data.routes);
      })
      .catch((error) => {
        console.error("error is: ", error);
      });
  }, []);

  return (
    <div className="App">
      <h1 className="text-3xl font-bold text-center">Tierheim-Helper v0.1a</h1>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AnimalList />} />
          <Route path="animal/:id" element={<AnimalDetail />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
