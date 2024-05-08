import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../helper/dateFormat";
import {
  germanStatus,
  getCardColorByAnimalStatus,
} from "../helper/getCardColorByAnimalStatus";
import ArrowLeft from "../icons/arrowLeft";
import ArrowRight from "../icons/arrowRight";
import { Animal } from "../models/animal";
import { AnimalStatus } from "../models/animalStatus";
import {
  PostFilter,
  SelectItem,
  SelectItemString,
  getAnimalTypes,
  getAnimalsPaged,
} from "../service/animalapi";
import "./AnimalList.css";
import BirthDate from "./Birthdate";
import Gender from "./Gender";
import { AnimalSex } from "../models/animalSex";

export default function AnimalList() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [maxPages, setMaxPages] = useState<number>(1);
  const [searchedAnimalType, setSearchedAnimalType] = useState<number>(0);
  const [animalTypes, setAnimalType] = useState<SelectItem[]>([]);
  const [animalSex] = useState<SelectItemString[]>([
    { id: "", name: "Alle Geschlechter" },
    { id: AnimalSex.Male, name: "Männlich" },
    { id: AnimalSex.Female, name: "Weiblich" },
  ]);
  const [searchedAnimalSex, setSearchedAnimalSex] = useState<string>("");
  const [isAnimalTypeOpen, setIsAnimalTypeOpen] = useState(false);
  const [isAnimalSexOpen, setAnimalSexOpen] = useState(false);
  useEffect(() => {
    (async () => {
      const foundAnimalTypes = await getAnimalTypes();
      foundAnimalTypes.unshift({ id: 0, name: "Alle Tierarten" });
      setAnimalType(foundAnimalTypes);
      // maybe outsource this to a global store?
      // zustand or mobx are pretty EZ to use.
      // get animals by search
      // const resSearch = await getAnimalsPaged(undefined, undefined, {
      //   search: "zeus",
      //   search_columns: ["post_title"],
      // });

      // const res = await getAnimalsPaged(currentPage, entriesPerPage);
      const res = await getAnimalsPaged(currentPage, 10);
      const animals = res.map((a) => new Animal(a));
      setAnimals(animals);
      calculateMaxPages(res._pagination.total || 1);
    })();
  }, []);

  const calculateMaxPages = (total: number) => {
    const maxPages = Math.ceil(total / entriesPerPage);
    setMaxPages(maxPages);
  };

  const buildQuery = async (
    animalType: number = searchedAnimalType,
    animalSex: string = searchedAnimalSex,
    pageNumber: number = 1
  ) => {
    if (pageNumber >= 1 && pageNumber <= maxPages) setCurrentPage(pageNumber);
    else return;

    const options: PostFilter = {};
    if (animalType !== undefined) setSearchedAnimalType(animalType);
    if (animalType !== 0) {
      options.shelterapp_animal_type = [animalType];
    }

    if (animalSex !== undefined) setSearchedAnimalSex(animalSex);
    if (animalSex !== "") {
      // options.filter["sex"] = animalSex;
    }

    console.info("query params", pageNumber, entriesPerPage, options);
    const res = await getAnimalsPaged(pageNumber, entriesPerPage, options);
    const animals = res.map((a) => new Animal(a));
    setAnimals(animals);
    calculateMaxPages(res._pagination.total || 1);
  };

  const getCardClass = (status?: AnimalStatus) => {
    if (!status) throw new Error("Status not set");
    const cardClass = getCardColorByAnimalStatus(status);
    return `card-${cardClass}`;
  };

  const getSelectItemName = (
    selectItems: (SelectItem | SelectItemString)[],
    value: string | number,
    defaultValue: string
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
              searchedAnimalType,
              "Alle Tierarten"
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
              {animalTypes.map(({ name, id }) => (
                <li
                  key={id}
                  onClick={() => {
                    setIsAnimalTypeOpen(false);
                    buildQuery(id);
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
              searchedAnimalSex,
              "Alle Geschlechter"
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
              {animalSex.map(({ name, id }) => (
                <li
                  key={id}
                  onClick={() => {
                    setAnimalSexOpen(false);
                    buildQuery(undefined, id);
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
      {animals.length === 0 && (
        <div className="text-center mt-20">
          <h1 className="text-4xl font-bold mb-4">Keine Tiere gefunden</h1>
          <button
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => buildQuery(0, "")}
          >
            Filter zurücksetzen
          </button>
        </div>
      )}
      <ul className="grid gap-8 animals mb-16">
        {animals.map(
          ({
            slug,
            id,
            name,
            breedOne,
            breedTwo,
            mainPictureFileUrl,
            dateOfAdmission,
            dateOfBirth,
            sex,
            cType,
            status,
            wasFound,
          }) => (
            <Link className="no-underline" to={`/${slug}`} key={id}>
              <li
                key={id}
                className={`p-5 border shadow max-w-72 rounded hover:shadow-xl cursor-pointer w-full ${getCardClass(
                  status
                )}`}
              >
                <div className="flex items-center flex-col ">
                  <div className="w-40 h-40 bg-gray-100 rounded-full relative flex flex-col items-center">
                    {mainPictureFileUrl && (
                      <img
                        className="w-32 h-32 object-cover rounded-full absolute top-4 left-4"
                        src={mainPictureFileUrl}
                        alt={""}
                      />
                    )}
                  </div>

                  {wasFound && (
                    <span
                      style={{ backgroundColor: "#f0ad4e" }}
                      className=" text-white py-1 px-6 rounded relative bottom-8 -mb-8"
                    >
                      Fundtier
                    </span>
                  )}
                  <h1 className="text-center font-bold uppercase">{name}</h1>
                  {breedOne && (
                    <span className="text-center text-gray-500 mb-2">
                      {!breedTwo ? breedOne : `${breedOne}, ${breedTwo}`}
                    </span>
                  )}
                  <hr className="w-11/12 mb-2" />
                  <span className="text-center text-gray-500">
                    {sex && <Gender sex={sex} />}
                    {cType && cType}
                  </span>
                  {dateOfBirth && (
                    <span className="text-center font-bold text-gray-500">
                      <BirthDate birthDate={dateOfBirth} />
                    </span>
                  )}
                </div>
                <div className="card-bottom flex items-center flex-col rounded-b mt-4 -m-5">
                  <h3 className="text-center font-extrabold text-white">
                    {germanStatus(status!)}
                  </h3>
                  {dateOfAdmission && (
                    <span className="text-center text-white">
                      {formatDate(dateOfAdmission)}
                    </span>
                  )}
                </div>
              </li>
            </Link>
          )
        )}
      </ul>
      {animals.length > 0 && (
        <nav className="flex justify-center">
          <ul className="flex items-center -space-x-px h-10 text-base">
            <li
              onClick={() => buildQuery(undefined, undefined, currentPage - 1)}
              className={`${
                currentPage === 1
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer hover:bg-gray-100 hover:text-gray-700"
              } flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white`}
            >
              <ArrowLeft />
            </li>
            {[...Array(maxPages)].map((_, index) => (
              <li
                onClick={() => {
                  if (currentPage !== index + 1)
                    buildQuery(undefined, undefined, index + 1);
                }}
                key={index}
                className={`${
                  currentPage === 1 + index
                    ? "cursor-not-allowed"
                    : "cursor-pointer hover:bg-gray-100 hover:text-gray-700"
                } flex items-center cursor-pointer justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white`}
              >
                {1 + index === currentPage ? (
                  <strong>{1 + index}</strong>
                ) : (
                  <span>{1 + index}</span>
                )}
              </li>
            ))}
            <li
              onClick={() => buildQuery(undefined, undefined, currentPage + 1)}
              className={`${
                currentPage === maxPages
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer hover:bg-gray-100 hover:text-gray-700"
              } flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white`}
            >
              <ArrowRight />
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
