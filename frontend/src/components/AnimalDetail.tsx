import { useContext, useEffect, useState } from "react";
import ImageGallery from "react-image-gallery";
import { useNavigate, useParams } from "react-router-dom";
import { formatDate } from "../helper/dateFormat";
import {
  germanStatus,
  getCSSColorByCardColor,
} from "../helper/getCardColorByAnimalStatus";
import CakeIcon from "../icons/cake";
import CheckIcon from "../icons/check";
import InfoIcon from "../icons/infoCircle";
import { Animal } from "../models/animal";
import "./AnimalDetail.css";
import BirthDate from "./Birthdate";
import Gender from "./Gender";
import PayPalButton from "./PaypalButton";
import SectionList from "./SectionList";
import { useData } from "../stores/animalStore";
import { getPaypalAdress } from "../service/config-helper";
import { observer } from "mobx-react-lite";
import AnimalsStoreContext, { AnimalsStore } from "../stores/animals";
import { getRouterBasePath } from "../service/url-helper";

interface AnimalDetailProps {
  animalStoreContext: React.Context<AnimalsStore>;
}

const AnimalDetail = observer(({ animalStoreContext}: AnimalDetailProps) => {
  const animalStore = useContext(animalStoreContext);
  
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  function navigateBack(){
    window.history.length > 1 ? window.history.back() : navigate(getRouterBasePath()+"/");
  }

  useEffect(() => {
    if(id) {
      animalStore.fetchSingleAnimal(id).finally(() => {
        if(!animalStore.singleAnimal) {
          navigate(getRouterBasePath()+"/");
        }
      });
    }
  }, [id]);

  useEffect(() => {
    if(animalStore.singleAnimal) {
      document.title = `${animalStore.defaultTitle} - ${animalStore.singleAnimal.name} - ${animalStore.singleAnimal.type} - ${!breedTwo ? breedOne : `${breedOne}, ${breedTwo}`}`;
    } else {
      document.title = animalStore.defaultTitle;
    }
    return () => {
      document.title = animalStore.defaultTitle;
    }
  });

  if (!animalStore.singleAnimal) return <></>;

  const {
    name,
    breedOne,
    breedTwo,
    mainPictureFileUrl,
    dateOfAdmission,
    dateOfBirth,
    sex,
    type,
    status,
    wasFound, // not used in detail
    description,
    otherPictureFileUrls,
    illnesses,
  } = animalStore.singleAnimal;

  return (
    <div>
      <div className="my-4">
        <button
          onClick={navigateBack}
          className="text-white bg-blue-700 text-sm px-5 py-2.5 rounded-lg"
        >
          Zurück
        </button>
      </div>
      <div className="ml:flex">
        <div className="p-4 mr-4 flex flex-col size-max:sm:min-w-full sm:min-w-[320px]">
          <div className="flex items-center flex-col mb-8">
            <div className="flex items-center relative w-full justify-center sm:my-[46%] py-4 my-[40%]">
              <div className="aspect-square bg-gray-100 w-full rounded-full flex flex-col items-center absolute"></div>
              {mainPictureFileUrl && (
                <img
                  className="w-full object-cover absolute rounded-full p-4 aspect-square"
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
          {animalStore.singleAnimal.getPersonalData().length > 0 && (
            <SectionList className="mb-4" values={animalStore.singleAnimal.getPersonalData()}>
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
          <PayPalButton name={name!} adress={getPaypalAdress()} />
        </div>
        <div className="p-4 w-full">
          <h1 className="font-bold mb-2 text-5xl w-full">{name}</h1>
          <span className="text-3xl">
            {sex && <Gender sex={sex} />} {type}, (
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
});

export default AnimalDetail;
