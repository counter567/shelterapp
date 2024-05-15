import { Link } from "react-router-dom";
import { formatDate } from "../helper/dateFormat";
import {
  germanStatus,
  getCardColorByAnimalStatus,
} from "../helper/getCardColorByAnimalStatus";
import { Animal } from "../models/animal";
import { AnimalStatus } from "../models/animalStatus";
import BirthDate from "./Birthdate";
import Gender from "./Gender";

interface AnimalCardProps {
  animal: Animal;
}

const AnimalCard = ({
  animal: {
    slug,
    id,
    name,
    breedOne,
    breedTwo,
    mainPictureFileUrl,
    dateOfAdmission,
    dateOfBirth,
    sex,
    type,
    status,
    wasFound,
  },
}: AnimalCardProps) => {
  const getCardClass = (status?: AnimalStatus) => {
    if (!status) throw new Error("Status not set");
    const cardClass = getCardColorByAnimalStatus(status);
    return `card-${cardClass}`;
  };
  return (
    <li
      key={id}
      className={`pt-5 border shadow rounded hover:shadow-xl cursor-pointer ${getCardClass(
        status
      )}`}
    >
      <Link className="no-underline" to={`/${slug}`} key={id}>
        <div className="flex items-center flex-col">
          <div className="w-40 h-40 bg-gray-100 rounded-full relative -z-10 flex flex-col items-center mx-5">
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
              className=" text-white h-8 py-1 px-6 rounded relative bottom-8 -z-10 -mb-8"
            >
              Fundtier
            </span>
          )}
          <h1 className="text-center font-bold uppercase min-h-[22px]">
            {name}
          </h1>
          {breedOne && (
            <span className="text-center text-gray-500 mb-2">
              {!breedTwo ? breedOne : `${breedOne}, ${breedTwo}`}
            </span>
          )}
          <hr className="w-11/12 mb-2" />
          <span className="text-center text-gray-500">
            {sex && <Gender sex={sex} />}
            {type && type}
          </span>
          {dateOfBirth && (
            <span className="text-center font-bold text-gray-500">
              <BirthDate birthDate={dateOfBirth} />
            </span>
          )}
          <div className="card-bottom flex items-center w-full relative  flex-col rounded-b mt-4">
            <h3 className="text-center font-extrabold text-white">
              {germanStatus(status!)}
            </h3>
            {dateOfAdmission && (
              <span className="text-center text-white">
                {formatDate(dateOfAdmission)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
};

export default AnimalCard;
