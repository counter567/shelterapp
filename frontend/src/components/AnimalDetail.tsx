import { useEffect, useState } from "react";
import { formatDate } from "../helper/dateFormat";
import {
  getCSSColorByCardColor,
  germanStatus,
} from "../helper/getCardColorByAnimalStatus";
import CakeIcon from "../icons/cake";
import CalendarIcon from "../icons/calendar";
import { Animal } from "../models/animal";
import { allAnimals } from "../service/animalapi";
import "./AnimalDetail.css";
import BirthDate from "./Birthdate";
import Gender, { sexInGerman } from "./Gender";
import PayPalButton from "./PaypalButton";

const AnimalDetail = () => {
  const [animal, setAnimals] = useState<Animal>();
  useEffect(() => {
    (async () => {
      const res = await allAnimals();
      const animals = res.map((a) => new Animal(a));
      setAnimals(animals[0]);
    })();
  }, []);

  if (!animal) return <></>;

  const {
    name,
    breedOne,
    breedTwo,
    mainPictureFileUrl,
    dateOfAdmission,
    dateOfBirth,
    sex,
    cType,
    status,
    wasFound, // not used in detail
    description,
  } = animal;
  return (
    <div>
      <h1 className="text-center md:text-left md:pl-16 text-blue-800 font-bold py-12 text-5xl w-full  bg-gradient-to-r from-cyan-500 to-blue-500">
        {name}
      </h1>
      <div className="max-w-screen-md md:flex mx-8">
        <div className="p-4 flex flex-col size-max:sm:min-w-full sm:min-w-[320px]">
          <div className="flex items-center flex-col mb-8">
            <div className="image bg-gray-100 rounded-full relative flex flex-col items-center">
              <img
                className="object-cover rounded-full absolute"
                src={mainPictureFileUrl}
                alt={name}
              />
            </div>
          </div>
          {dateOfAdmission && (
            <span className="text-center mb-2">
              {formatDate(dateOfAdmission)}
            </span>
          )}
          <span
            className="rounded-lg mb-8 text-white py-3 font-bold text-center"
            style={{ backgroundColor: getCSSColorByCardColor(status!) }}
          >
            {germanStatus(status!)}
          </span>
          {dateOfBirth && (
            <span className="mb-2 flex items-center">
              <CakeIcon className="mr-2" />{" "}
              <BirthDate birthDate={dateOfBirth} />
            </span>
          )}
          {/* <SectionList
            className="mb-4"
            heading="Eigenschaften"
            values={properties}
          >
            <CheckIcon className="mr-2" stroke="lightgreen" />
          </SectionList>
          <SectionList className="mb-4" heading="Hinweis" values={hints}>
            <InfoIcon className="mr-2" />
          </SectionList>
          <SectionList className="mb-4" heading="Wir danken" values={donators}>
            <HeartIcon className="mr-2" stroke="red" fill="red" />{" "}
          </SectionList> */}
          <PayPalButton name={name!} />
        </div>
        <div className="p-4">
          <h1 className="font-bold mb-2 text-5xl w-full">{name}</h1>
          <span className="text-3xl">
            {sex && <Gender sex={sex} />} {sexInGerman(sex!)}, {cType} (
            {breedOne && (
              <span className="text-center text-gray-500 mb-2">
                {!breedTwo ? breedOne : `${breedOne}, ${breedTwo}`}
              </span>
            )}
            )
            {/* <MenIcon className="mr-2" size={20} /> {gender},{type} ({kind}) */}
          </span>
          {description && (
            <div className="bg-neutral-100 mt-2 mb-4 border rounded-lg padding p-4 text-xl">
              {description}
            </div>
          )}
          <div className="mb-8">
            <div className="date mb-2 flex items-center">
              <CalendarIcon className="mr-1" />{" "}
              <span className="font-bold mr-1">13.11.2023</span>vor 4 Monaten
            </div>
            {/* <ImageGallery items={images} /> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalDetail;