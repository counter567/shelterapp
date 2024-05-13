import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../helper/dateFormat";
import {
  germanStatus,
  getCardColorByAnimalStatus,
} from "../helper/getCardColorByAnimalStatus";
import ArrowLeft from "../icons/arrowLeft";
import ArrowRight from "../icons/arrowRight";
import { AnimalSex } from "../models/animalSex";
import { AnimalStatus } from "../models/animalStatus";
import {
  SelectItem,
  SelectItemString,
  getAnimalTypes,
} from "../service/animalapi";
import { useData } from "../stores/animalStore";
import "./AnimalList.css";
import BirthDate from "./Birthdate";
import Gender from "./Gender";
import Pagination from "./Pagination";
import AnimalCard from "./AnimalCard";

const animalSex = [
  { id: undefined, name: "Alle Geschlechter" },
  { id: AnimalSex.Male, name: "Männlich" },
  { id: AnimalSex.Female, name: "Weiblich" },
];

export default function AnimalList() {
  const {
    getAnimalsPaged,
    filter,
    changePage,
    resetFilter,
    entriesPerPage,
    currentPage,
    maxPages,
    searchedAnimalType,
    searchedAnimalSex,
  } = useData();
  const [animalTypes, setAnimalType] = useState<SelectItem[]>([]);
  const [isAnimalTypeOpen, setIsAnimalTypeOpen] = useState(false);
  const [isAnimalSexOpen, setAnimalSexOpen] = useState(false);
  useEffect(() => {
    (async () => {
      const foundAnimalTypes = await getAnimalTypes();
      foundAnimalTypes.unshift({ id: 0, name: "Alle Tierarten" });
      setAnimalType(foundAnimalTypes);
      // calculateMaxPages(res._pagination.total || 1);
    })();
  }, []);

  const getSelectItemName = (
    selectItems: { id: any; name: string }[],
    defaultValue: string,
    value?: string | number
  ) => {
    return (
      selectItems.find((option) => option.id === value || option.name === value)
        ?.name || defaultValue
    );
  };

  return (
    <div>
      <div className="mb-4 flex">
        <div>
          <button
            id="dropdownDefaultButton"
            data-dropdown-toggle="dropdown"
            className="text-white min-w-40 justify-between bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            type="button"
            onClick={() => setIsAnimalTypeOpen((value) => !value)}
          >
            {getSelectItemName(
              animalTypes,
              "Alle Tierarten",
              searchedAnimalType
            )}
            <svg
              className="w-2.5 h-2.5 ms-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 6"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 4 4 4-4"
              />
            </svg>
          </button>
          <div
            id="dropdown"
            className={
              "z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 absolute" +
              (isAnimalTypeOpen ? " block" : " hidden")
            }
          >
            <ul
              className="py-2 text-sm text-gray-700 dark:text-gray-200 relative"
              aria-labelledby="dropdownDefaultButton"
            >
              {animalTypes.map(({ name, id: animalType }, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setIsAnimalTypeOpen(false);
                    filter([
                      {
                        propName: "type",
                        compare: "===",
                        value: animalType,
                      },
                    ]);
                  }}
                >
                  <span className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer">
                    {name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div>
          <button
            id="dropdownDefaultButton"
            data-dropdown-toggle="dropdown"
            className="text-white min-w-40 justify-between bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            type="button"
            onClick={() => setAnimalSexOpen((value) => !value)}
          >
            {getSelectItemName(
              animalSex,
              "Alle Geschlechter",
              searchedAnimalSex
            )}
            <svg
              className="w-2.5 h-2.5 ms-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 6"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 4 4 4-4"
              />
            </svg>
          </button>
          <div
            id="dropdown"
            className={
              "z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 absolute" +
              (isAnimalSexOpen ? " block" : " hidden")
            }
          >
            <ul
              className="py-2 text-sm text-gray-700 dark:text-gray-200 relative"
              aria-labelledby="dropdownDefaultButton"
            >
              {animalSex.map(({ name, id: animalSex }, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setAnimalSexOpen(false);
                    filter([
                      { propName: "sex", compare: "===", value: animalSex },
                    ]);
                  }}
                >
                  <span className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer">
                    {name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
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
