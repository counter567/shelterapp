import React, { createContext, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import AnimalDetail from "./components/AnimalDetail";
import AnimalList from "./components/AnimalList";
import { AnimalSex } from "./models/animalSex";
import { AnimalStatus } from "./models/animalStatus";
import { getRouterBasePath } from "./service/url-helper";
import { AnimalsStore } from "./stores/animals";

export interface AppProps {
  hideFilters?: boolean;
  type?: number;
  status?: Array<AnimalStatus>;
  sex?: AnimalSex;
  minAge?: number;
  maxAge?: number;
  wasFound?: boolean;
  missing?: boolean;
  privateAdoption?: boolean;
}

function App(props: AppProps) {
  const [animalStoreContext, setAnimalStoreContext] = useState<
    React.Context<AnimalsStore> | undefined
  >(undefined);

  useEffect(() => {
    const animalStore = new AnimalsStore();
    const animalStoreContext = createContext(animalStore);
    setAnimalStoreContext(animalStoreContext);

    animalStore.setFilter("shelterapp_animal_type", props.type, false);
    animalStore.setFilter("meta_status", props.status, false);
    animalStore.setFilter("meta_sex", props.sex, false);
    animalStore.setFilter("meta_age_max", props.maxAge, false);
    animalStore.setFilter("meta_age_min", props.minAge, false);
    animalStore.setFilter("meta_was_found", props.wasFound, false)
    animalStore.setFilter("meta_missing", props.missing, false)
    animalStore.setFilter("meta_private_adoption", props.privateAdoption, false)
  }, []);

  if (!animalStoreContext) {
    return <></>;
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route
            path={getRouterBasePath() + "/"}
            element={<AnimalList animalStoreContext={animalStoreContext} />}
          />
          <Route
            path={getRouterBasePath() + "/:id"}
            element={<AnimalDetail animalStoreContext={animalStoreContext} />}
          />

          <Route
            path="*"
            element={
              <AnimalList
                animalStoreContext={animalStoreContext}
                hideFilters={props.hideFilters}
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
