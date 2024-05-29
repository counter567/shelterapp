import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import AnimalDetail from "./components/AnimalDetail";
import AnimalList from "./components/AnimalList";
import { getRouterBasePath } from "./service/url-helper";
import { AnimalProvider } from "./stores/animalStore";

function App() {
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
