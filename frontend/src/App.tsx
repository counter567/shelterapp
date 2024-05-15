/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import AnimalDetail from "./components/AnimalDetail";
import AnimalList from "./components/AnimalList";
import { requestData } from "./service/requestData";
import { getRouterBasePath } from "./service/url-helper";
import { AnimalProvider } from "./stores/animalStore";

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
      <AnimalProvider>
        <BrowserRouter basename={getRouterBasePath()}>
          <Routes>
            <Route path="/" element={<AnimalList />} />
            <Route path="/:id" element={<AnimalDetail />} />
          </Routes>
        </BrowserRouter>
      </AnimalProvider>
    </div>
  );
}

export default App;
