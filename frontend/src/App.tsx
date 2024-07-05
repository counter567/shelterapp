import { BrowserRouter, Route, Routes } from "react-router-dom";
import ReactDom from "react-dom";
import "./App.css";
import AnimalDetail from "./components/AnimalDetail";
import AnimalList from "./components/AnimalList";
import { getRouterBasePath } from "./service/url-helper";
import { AnimalProvider } from "./stores/animalStore";
import { AnimalsStore } from "./stores/animals";
import React, { createContext, useEffect, useState } from "react";
import { AnimalStatus } from "./models/animalStatus";
import { AnimalSex } from "./models/animalSex";

export interface AppProps {
  hideFilters?: boolean;
  type?: number;
  status?: AnimalStatus;
  sex?: AnimalSex;
  minAge?: number;
  maxAge?: number;
}

function App(props: AppProps) {
  const [animalStoreContext, setAnimalStoreContext] = useState<React.Context<AnimalsStore> | undefined>(undefined);
  
  useEffect(() => {
    const animalStore = new AnimalsStore();
    const animalStoreContext = createContext(animalStore);
    setAnimalStoreContext(animalStoreContext);

    animalStore.setFilter('shelterapp_animal_type', props.type, false);
    animalStore.setFilter('meta_status', props.status, false);
    animalStore.setFilter('meta_sex', props.sex, false);
    animalStore.setFilter('meta_age_max', props.maxAge, false);
    animalStore.setFilter('meta_age_min', props.minAge, false);
  }, [])

  if(!animalStoreContext) {
    return <></>;
  }

  return (
    <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path={getRouterBasePath()+"/"} element={<AnimalList animalStoreContext={animalStoreContext} />} />
            <Route path={getRouterBasePath()+"/:id"} element={<AnimalDetail animalStoreContext={animalStoreContext} />} />

            <Route path="*" element={<AnimalList animalStoreContext={animalStoreContext} hideFilters={props.hideFilters} />} />
          </Routes>
        </BrowserRouter>
    </div>
  );
}

export default App;
