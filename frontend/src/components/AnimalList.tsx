import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../helper/dateFormat";
import {
  germanStatus,
  getCardColorByAnimalStatus,
} from "../helper/getCardColorByAnimalStatus";
import { Animal } from "../models/animal";
import { AnimalStatus } from "../models/animalStatus";
import { getAllanimals, getAnimalsPaged } from "../service/animalapi";
import "./AnimalList.css";
import BirthDate from "./Birthdate";
import Gender from "./Gender";

export default function AnimalList() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  useEffect(() => {
    (async () => {
      // maybe outsource this to a global store?
      // zustand or mobx are pretty EZ to use.

      // get animals by search
      const resSearch = await getAnimalsPaged(undefined, undefined, {
        search: 'zeus',
        search_columns: ['post_title'],
      });
      console.log(resSearch);

      // get animals by taxonomy (shelterapp_animal_type, shelterapp_animal_illness, shelterapp_animal_allergies)
      const resCats = await getAnimalsPaged(undefined, undefined, {
        shelterapp_animal_type: [3], // this is the ID of the 'Cat' term
      });
      console.log(resCats);

      // get all animals
      const resAll = await getAllanimals(50);
      console.log(resAll);
      console.log(resAll.length);

      const res = await getAnimalsPaged();
      const animals = res.map((a) => new Animal(a));
      setAnimals(animals);
    })();
  }, []);

  const getCardClass = (status?: AnimalStatus) => {
    if (!status) throw new Error("Status not set");
    const cardClass = getCardColorByAnimalStatus(status);
    return `card-${cardClass}`;
  };

  return (
    <div>
      <ul className="grid gap-8 animals">
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
                className={`p-5 border shadow w-72 rounded hover:shadow-xl cursor-pointer w-full ${getCardClass(
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
    </div>
  );
}
