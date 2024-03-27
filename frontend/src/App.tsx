import { useEffect, useState } from "react";
import "./App.css";
import AnimalDetail from "./components/AnimalDetail";
import AnimalList from "./components/AnimalList";
import { requestData } from "./service/requestData";
import { animalTypes, animals } from "./service/animalapi";

function App() {
  const [showDetail, setShowDetail] = useState(true);

  useEffect(() => {
    requestData("/wp/v2")
      .then((data) => {
        console.log("all routes: ", data.routes);
      })
      .catch((error) => {
        console.error("error is: ", error);
      });

    (async () => {
      const res2 = await animalTypes();
      console.log("types: ", res2);
      const res = await animals();
      console.log("animals: ", res);
    })();
  }, []);

  return (
    <div className="App">
      <h1 className="text-3xl font-bold text-center">Tierheim-Helper v0.1a</h1>
      <div className="flex justify-center my-4">
        <button
          className="bg-green-400 text-white py-2 px-4 rounded"
          onClick={() => setShowDetail(!showDetail)}
        >
          Toggle
        </button>
      </div>
      {showDetail && <AnimalDetail />}
      {!showDetail && <AnimalList />}
    </div>
  );
}

export default App;