import { useEffect, useState } from "react";
import { AnimalSex } from "../models/animalSex";
import { SelectItem, getAnimalTypes } from "../service/animalapi";
import { useData } from "../stores/animalStore";
import AnimalCard from "./AnimalCard";
import "./AnimalList.css";
import DropDown from "./DropDown";
import Pagination from "./Pagination";
import { germanStatus } from "../helper/getCardColorByAnimalStatus";
import { statusValues } from "../models/animalStatus";

export const animalSex = [
  { id: AnimalSex.All, name: "Alle Geschlechter" },
  { id: AnimalSex.Male, name: "Männlich" },
  { id: AnimalSex.Female, name: "Weiblich" },
];

export const animalStatus: { id: string | number; name: string }[] = statusValues.map(
  (status) => ({
    id: status,
    name: germanStatus(status),
  })
);
animalStatus.unshift({ id: 0, name: "Alle Status" });
export const ageFilter = [
  { id: 0, name: "Alter beliebig" },
  { id: 1, name: "Bis 6 Monate" },
  { id: 2, name: "Von 6 bis 12 Monate" },
  { id: 3, name: "1 bis 3 Jahre" },
  { id: 4, name: "3 bis 5 Jahre" },
  { id: 5, name: "Über 5 Jahre" },
];

export default function AnimalList() {
  const {
    getOriginalTitle,
    getTitle,
    getAnimalTypes,
    getAnimalsPaged,
    filter,
    changePage,
    resetFilter,
    searchedAnimalAge,
    currentPage,
    maxPages,
    searchedAnimalType,
    searchedAnimalSex,
    searchedAnimalStatus,
    ready,
  } = useData();

  useEffect(() => {
    document.title = getTitle();
    return () => {
      document.title = getOriginalTitle();
    }
  });

  return (
    <div>
      <div className="mb-4 dropdown-buttons gap-y-6 gap-x-8 items-center justify-center">
        <DropDown
          items={animalStatus}
          value={searchedAnimalStatus}
          callback={(status) =>
            filter([
              {
                propName: "status",
                compare: "===",
                value: status,
              },
            ])
          }
        />
        <DropDown
          items={Array.prototype.concat([], [{ id: 0, name: "Alle Tierarten" }], getAnimalTypes())}
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
      <ul className="grid justify-center gap-4 animals mb-12">
        {ready && getAnimalsPaged().map((animal) => (
          <AnimalCard key={animal.id} animal={animal} />
        ))}
      </ul>
      {ready && getAnimalsPaged().length === 0 && (
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
      {ready && getAnimalsPaged().length > 0 && (
        <Pagination
          currentPage={currentPage}
          maxPages={maxPages}
          onPageChange={changePage}
        ></Pagination>
      )}
    </div>
  );
}
