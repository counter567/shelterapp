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
import { getRouterBasePath } from "../service/url-helper";

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
      className={`flex flex-col border shadow rounded hover:shadow-xl cursor-pointer ${getCardClass(
        status
      )}`}
    >
      {/* Before this was a link! behold! */}
      <a className="no-underline flex-auto flex flex-col" href={`${getRouterBasePath()}/${slug}`} key={id}>
        <div className="flex items-center flex-col flex-auto overflow-hidden">
          <div className="flex items-center justify-center h-44 pt-4">
            <div className="aspect-square bg-gray-100 w-40 rounded-full flex flex-col items-center absolute"></div>
            {mainPictureFileUrl && (
              <img
                className="w-40 object-cover absolute rounded-full p-4 aspect-square"
                src={mainPictureFileUrl}
                alt={""}
              />
            )}
          </div>
          {wasFound && (
            <span
              style={{ backgroundColor: "#f0ad4e" }}
              className=" text-white h-8 py-1 px-6 rounded relative bottom-8 -mb-8"
            >
              Fundtier
            </span>
          )}
          <h1 className="text-center font-bold uppercase min-h-[22px] grow">
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
      </a>
    </li>
  );
};

export default AnimalCard;
