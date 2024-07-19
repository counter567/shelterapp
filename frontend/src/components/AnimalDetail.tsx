import { observer } from "mobx-react-lite";
import { useContext, useEffect } from "react";
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
import { getPaypalAdress } from "../service/config-helper";
import { getRouterBasePath } from "../service/url-helper";
import { AnimalsStore } from "../stores/animals";
import "./AnimalDetail.css";
import BirthDate from "./Birthdate";
import Gender from "./Gender";
import PayPalButton from "./PaypalButton";
import SectionList from "./SectionList";
import { AnimalStatus } from "../models/animalStatus";

interface AnimalDetailProps {
  animalStoreContext: React.Context<AnimalsStore>;
}

const AnimalDetail = observer(({ animalStoreContext }: AnimalDetailProps) => {
  const animalStore = useContext(animalStoreContext);

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  function navigateBack() {
    window.history.length > 1
      ? window.history.back()
      : navigate(getRouterBasePath() + "/");
  }

  useEffect(() => {
    if (id) {
      animalStore.fetchSingleAnimal(id).finally(() => {
        if (!animalStore.singleAnimal) {
          navigate(getRouterBasePath() + "/");
        }
      });
    }
  }, [id, animalStore, navigate]);

  useEffect(() => {
    if (animalStore.singleAnimal) {
      document.title = `${animalStore.defaultTitle} - ${
        animalStore.singleAnimal.name
      } - ${animalStore.singleAnimal.type} - ${
        !breedTwo ? breedOne : `${breedOne}, ${breedTwo}`
      }`;
    } else {
      document.title = animalStore.defaultTitle;
    }
    return () => {
      document.title = animalStore.defaultTitle;
    };
  });

  if (!animalStore.singleAnimal) return <></>;

  const {
    name,
    breedOne,
    breedTwo,
    mainPictureFileUrl,
    dateOfAdmission,
    dateOfDeath,
    dateOfLeave,
    dateOfBirth,
    sex,
    type,
    status,
    description,
    otherPictureFileUrls,
    illnesses,
  } = animalStore.singleAnimal;

  return (
    <div>
      <div className="my-4">
        <button onClick={navigateBack} className="button font-normal">
          Zurück
        </button>
      </div>
      <div className="ml:flex">
        <div className="animal-detail-left p-4 mr-4 flex flex-col size-max:sm:min-w-full sm:min-w-[320px]">
          <div className="flex items-center flex-col mb-8">
            <div className="animal-detail-image-container flex items-center relative w-full justify-center py-[50%]">
              <div className="animal-detail-image-border aspect-square bg-gray-100 w-full rounded-full flex flex-col items-center absolute"></div>
              {mainPictureFileUrl && (
                <img
                  className="animal-detail-image w-full object-cover absolute rounded-full p-4 aspect-square"
                  src={mainPictureFileUrl}
                  alt={name}
                />
              )}
            </div>
          </div>
          {status === AnimalStatus.Adopted && dateOfLeave && (
            <span className="animal-detail-date text-center mb-2">
              seit {formatDate(dateOfLeave)}
            </span>
          )}
          {status === AnimalStatus.Deceased && dateOfDeath && (
            <span className="animal-detail-date text-center mb-2">
              seit {formatDate(dateOfDeath)}
            </span>
          )}
          {status !== AnimalStatus.Deceased &&
            status !== AnimalStatus.Adopted &&
            dateOfAdmission && (
              <span className="animal-detail-date text-center mb-2">
                seit {formatDate(dateOfAdmission)}
              </span>
            )}
          <span
            className="animal-detail-status rounded-lg mb-8 text-white py-3 font-bold text-center"
            style={{ backgroundColor: getCSSColorByCardColor(status!) }}
          >
            {germanStatus(status!)}
          </span>
          <h1 className="animal-detail-props font-bold text-xl mb-2">Eigenschaften</h1>
          {dateOfBirth && (
            <span className="animal-detail-props-birthdate mb-2 flex items-center">
              <CakeIcon className="mr-2" />{" "}
              <BirthDate birthDate={dateOfBirth} />
            </span>
          )}
          {animalStore.singleAnimal.getPersonalData().length > 0 && (
            <SectionList
              className="animal-detail-props-personaldata mb-4"
              values={animalStore.singleAnimal.getPersonalData()}
            >
              <InfoIcon className="mr-2" />
            </SectionList>
          )}
          <SectionList
            className="animal-detail-illnesses mb-4"
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
          <PayPalButton name={name!} adress={getPaypalAdress()} className="animal-detail-donate" />
        </div>
        <div className="animal-detail-right p-4 w-full">
          <h1 className="animal-detail-name font-bold mb-2 text-5xl w-full">{name}</h1>
          <span className="animal-detail-info text-3xl">
            {sex && <Gender sex={sex} />} {type}, (
            {breedOne && (
              <span className="animal-detail-breed text-center text-gray-500 mb-2">
                {!breedTwo ? breedOne : `${breedOne}, ${breedTwo}`}
              </span>
            )}
            )
          </span>
          {description && (
            <div className="animal-detail-description bg-neutral-100 mt-2 mb-4 border rounded-lg padding p-4 text-xl">
              {description}
            </div>
          )}
          {otherPictureFileUrls && otherPictureFileUrls.length > 0 && (
            <div className="animal-detail-galery-container mb-8 max-[50vw] m-auto">
              {/* <div className="date mb-2 flex items-center">
              <CalendarIcon className="mr-1" />{" "}
              <span className="font-bold mr-1">13.11.2023</span>vor 4 Monaten
            </div> */}
              <ImageGallery
                items={
                  otherPictureFileUrls?.map((data) => ({
                    original: data.url,
                    thumbnail: data.thumbnailUrl,
                    renderItem: data.isVideo
                      ? (item) => {
                          return (
                            <video
                              className="px-[56px] w-full"
                              controls={true}
                              autoPlay={false}
                              loop={true}
                            >
                              <source src={data.url} type="video/mp4" />
                            </video>
                          );
                        }
                      : undefined,
                    renderThumbInner: data.isVideo
                      ? () => {
                          return <img alt="" src={data.thumbnailUrl} />;
                        }
                      : undefined,
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
