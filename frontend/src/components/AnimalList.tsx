import { useEffect, useState } from "react";
import { AnimalSex } from "../models/animalSex";
import { SelectItem, getAnimalTypes } from "../service/animalapi";
import { useData } from "../stores/animalStore";
import AnimalCard from "./AnimalCard";
import "./AnimalList.css";
import DropDown from "./DropDown";
import Pagination from "./Pagination";

const animalSex = [
  { id: AnimalSex.All, name: "Alle Geschlechter" },
  { id: AnimalSex.Male, name: "Männlich" },
  { id: AnimalSex.Female, name: "Weiblich" },
];

const ageFilter = [
  { id: 0, name: "Alter beliebig" },
  { id: 1, name: "Bis 6 Monate" },
  { id: 2, name: "Bis 12 Monate" },
  { id: 3, name: "1 bis 3 Jahre" },
  { id: 4, name: "3 bis 5 Jahre" },
  { id: 5, name: "Über 5 Jahre" },
];

export default function AnimalList() {
  const {
    getAnimalsPaged,
    filter,
    changePage,
    resetFilter,
    searchedAnimalAge,
    currentPage,
    maxPages,
    searchedAnimalType,
    searchedAnimalSex,
  } = useData();
  const [animalTypes, setAnimalType] = useState<SelectItem[]>([]);

  useEffect(() => {
    (async () => {
      const foundAnimalTypes = await getAnimalTypes();
      foundAnimalTypes.unshift({ id: 0, name: "Alle Tierarten" });
      setAnimalType(foundAnimalTypes);
    })();
  }, []);

  return (
    <div>
      <div className="mb-4 flex space-x-8">
        {/* <DropDown
          items={animalTypes}
          value={searchedAnimalType}
          callback={(animalType) =>
            filter([
              {
                propName: "status",
                compare: "===",
                value: animalType,
              },
            ])
          }
        /> */}
        <DropDown
          items={animalTypes}
          value={searchedAnimalType}
          callback={(animalType) =>
            filter([
              {
                propName: "type",
                compare: "===",
                value: animalType,
              },
            ])
          }
        />
        <DropDown
          items={animalSex}
          value={searchedAnimalSex}
          callback={(animalSex) =>
            filter([
              {
                propName: "sex",
                compare: "===",
                value: animalSex,
              },
            ])
          }
        />
        <DropDown
          items={ageFilter}
          value={searchedAnimalAge}
          callback={(animalAge) =>
            filter([
              {
                propName: "dateOfBirth",
                compare: "===",
                value: animalAge,
              },
            ])
          }
        />
      </div>
      <ul className="grid gap-8 animals mb-16">
        {getAnimalsPaged().map((animal) => (
          <AnimalCard animal={animal} />
        ))}
      </ul>
      {getAnimalsPaged().length === 0 && (
        <div className="text-center mt-20">
          <h1 className="text-4xl font-bold mb-4">Keine Tiere gefunden</h1>
          <button
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => resetFilter()}
          >
            Filter zurücksetzen
          </button>
        </div>
      )}
      {getAnimalsPaged().length > 0 && (
        <Pagination
          currentPage={currentPage}
          maxPages={maxPages}
          onPageChange={changePage}
        ></Pagination>
      )}
    </div>
  );
}
