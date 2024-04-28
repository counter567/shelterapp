/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import AnimalDetail from "./components/AnimalDetail";
import AnimalList from "./components/AnimalList";
import { requestData } from "./service/requestData";

function App() {
  useEffect(() => {
    requestData("/wp/v2")
      .then((data: any) => {
        console.log("all routes: ", data.routes);
      })
      .catch((error) => {
        console.error("error is: ", error);
      });
  }, []);

  return (
    <div className="App">
      <HashRouter>
        <Routes>
          <Route path="/" element={<AnimalList />} />
          <Route path="animal/:id" element={<AnimalDetail />} />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
