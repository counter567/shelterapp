import { BrowserRouter, Route, Routes } from "react-router-dom";
import ReactDom from "react-dom";
import "./App.css";
import AnimalDetail from "./components/AnimalDetail";
import AnimalList from "./components/AnimalList";
import { getRouterBasePath } from "./service/url-helper";
import { AnimalProvider } from "./stores/animalStore";

export interface AppProps {
  hideFilters?: boolean;
  type?: number;
  status?: string;
}

function App(props: AppProps) {
  return (
    <div className="App">
      <AnimalProvider props={props}>
        <BrowserRouter>
          <Routes>
            <Route path={getRouterBasePath()+"/"} element={<AnimalList />} />
            <Route path={getRouterBasePath()+"/:id"} element={<AnimalDetail />} />

            
            <Route path="*" element={<AnimalList hideFilters={props.hideFilters} />} />
            
            
          </Routes>
        </BrowserRouter>
      </AnimalProvider>
    </div>
  );
}

export default App;
