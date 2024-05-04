import { useEffect, useState } from "react";
import ImageGallery from "react-image-gallery";
import { formatDate } from "../helper/dateFormat";
import {
  germanStatus,
  getCSSColorByCardColor,
} from "../helper/getCardColorByAnimalStatus";
import CakeIcon from "../icons/cake";
import { Animal } from "../models/animal";
import { getAnimal } from "../service/animalapi";
import "./AnimalDetail.css";
import BirthDate from "./Birthdate";
import Gender, { sexInGerman } from "./Gender";
import PayPalButton from "./PaypalButton";
import { useParams } from "react-router-dom";
import CheckIcon from "../icons/check";
import SectionList from "./SectionList";
import InfoIcon from "../icons/infoCircle";

const AnimalDetail = () => {
  const [animal, setAnimals] = useState<Animal>();
  const [idValue, setId] = useState<string>("");
  const { id } = useParams<{ id: string }>();
  if (idValue !== id) setId(id!);

  useEffect(() => {
    (async () => {
      const animalSource = await getAnimal(idValue);
      if (animalSource) {
        // @TODO: Need fallback if not found!
        setAnimals(new Animal(animalSource));
      }
    })();
  }, [idValue]);

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
    otherPictureFileUrls,
    illnesses,
  } = animal;
  return (
    <div>
      <div className="ml:flex">
        <div className="p-4 mr-4 flex flex-col size-max:sm:min-w-full sm:min-w-[320px]">
          <div className="flex items-center flex-col mb-8">
            <div className="image bg-gray-100 rounded-full relative flex flex-col items-center">
              {mainPictureFileUrl && (
                <img
                  className="object-cover rounded-full absolute"
                  src={mainPictureFileUrl}
                  alt={name}
                />
              )}
            </div>
          </div>
          {dateOfAdmission && (
            <span className="text-center mb-2">
              seit {formatDate(dateOfAdmission)}
            </span>
          )}
          <span
            className="rounded-lg mb-8 text-white py-3 font-bold text-center"
            style={{ backgroundColor: getCSSColorByCardColor(status!) }}
          >
            {germanStatus(status!)}
          </span>
          <h1 className="font-bold text-xl mb-2">Eigenschaften</h1>
          {dateOfBirth && (
            <span className="mb-2 flex items-center">
              <CakeIcon className="mr-2" />{" "}
              <BirthDate birthDate={dateOfBirth} />
            </span>
          )}
          {animal.getPersonalData().length > 0 && (
            <SectionList className="mb-4" values={animal.getPersonalData()}>
              <InfoIcon className="mr-2" />
            </SectionList>
          )}
          <SectionList
            className="mb-4"
            heading="Krankheiten"
            values={illnesses}
          >
            <CheckIcon className="mr-2" stroke="lightgreen" />
          </SectionList>
          {/*<SectionList className="mb-4" heading="Hinweis" values={[notes!]}>
            <InfoIcon className="mr-2" />
          </SectionList>
          <SectionList className="mb-4" heading="Wir danken" values={donators}>
            <HeartIcon className="mr-2" stroke="red" fill="red" />{" "}
          </SectionList> */}
          <PayPalButton name={name!} />
        </div>
        <div className="p-4 w-full">
          <h1 className="font-bold mb-2 text-5xl w-full">{name}</h1>
          <span className="text-3xl">
            {sex && <Gender sex={sex} />} {sexInGerman(sex!)}, {cType} (
            {breedOne && (
              <span className="text-center text-gray-500 mb-2">
                {!breedTwo ? breedOne : `${breedOne}, ${breedTwo}`}
              </span>
            )}
            )
          </span>
          {description && (
            <div className="bg-neutral-100 mt-2 mb-4 border rounded-lg padding p-4 text-xl">
              {description}
            </div>
          )}
          {otherPictureFileUrls && otherPictureFileUrls.length > 0 && (
            <div className="mb-8 max-[50vw] m-auto">
              {/* <div className="date mb-2 flex items-center">
              <CalendarIcon className="mr-1" />{" "}
              <span className="font-bold mr-1">13.11.2023</span>vor 4 Monaten
            </div> */}
              <ImageGallery
                items={
                  otherPictureFileUrls?.map((data) => ({
                    original: data.url,
                    thumbnail: data.thumbnailUrl,
                  })) ?? []
                }
                showThumbnails={true}
                lazyLoad={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimalDetail;
