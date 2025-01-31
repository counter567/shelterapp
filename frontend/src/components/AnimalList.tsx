import { observer } from "mobx-react-lite";
import { useContext, useEffect } from "react";
import { germanStatus } from "../helper/getCardColorByAnimalStatus";
import { AnimalSex } from "../models/animalSex";
import { AnimalStatus, statusValues } from "../models/animalStatus";
import { AnimalsStore } from "../stores/animals";
import AgeSelect from "./AgeSelect";
import AnimalCard from "./AnimalCard";
import "./AnimalList.css";
import DropDown from "./DropDown";
import MultiSelectDropDown from "./MultiSelectDropDown";
import Pagination from "./Pagination";
import TrippleValueDropdown from "./TrippleValueDropdown";

export const animalSex = [
  { id: AnimalSex.All, name: "Alle Geschlechter" },
  { id: AnimalSex.Male, name: "Männlich" },
  { id: AnimalSex.Female, name: "Weiblich" },
  { id: AnimalSex.Divers, name: "Divers" },
  { id: AnimalSex.Gruppe, name: "Gruppe" },
];

export const animalStatus: { id: string | number; name: string }[] =
  statusValues.map((status) => ({
    id: status,
    name: germanStatus(status),
  }));
export const ageFilter = [
  { id: 0, name: "Alter beliebig" },
  { id: 1, name: "Bis 6 Monate" },
  { id: 2, name: "Von 6 bis 12 Monate" },
  { id: 3, name: "1 bis 3 Jahre" },
  { id: 4, name: "3 bis 5 Jahre" },
  { id: 5, name: "Über 5 Jahre" },
];

export const animalSort = [
  { id: "DATE_OF_ADMISSION_ASC", name: "Aufnahmedatum aufsteigend" },
  { id: "DATE_OF_ADMISSION_DSC", name: "Aufnahmedatum absteigend" },
  { id: "DATE_OF_BIRTH_DSC", name: "Alter aufsteigend" },
  { id: "DATE_OF_BIRTH_ASC", name: "Alter absteigend" }
]

interface AnimalListProps {
  hideFilters?: boolean;
  animalStoreContext: React.Context<AnimalsStore>;
}

export default observer(function AnimalList({
  animalStoreContext,
  hideFilters = false,
}: AnimalListProps) {
  const animalStore = useContext(animalStoreContext);

  useEffect(() => {
    animalStore.setHideFilters(hideFilters);
    document.title = animalStore.title;
    return () => {
      animalStore.setHideFilters(false);
      document.title = animalStore.defaultTitle;
    };
  }, [animalStore, hideFilters]);

  useEffect(() => {
    animalStore.loadFiltersFromURL();
    animalStore.fetchCurrentAnimals();
    animalStore.fetchTypesData();
  }, []);

  return (
    <div>
      {!animalStore.hideFilters && (
        <>
          <div className="mb-4 dropdown-buttons gap-y-4 gap-x-4 items-center justify-center">
            <MultiSelectDropDown
              items={animalStatus}
              value={animalStore.filters.meta_status || []}
              callback={(value) =>
                animalStore.setFilter(
                  "meta_status",
                  value?.map((it) => it as AnimalStatus)
                )
              }
            />
            <MultiSelectDropDown
              items={animalStore.typesData}
              value={animalStore.filters.shelterapp_animal_type || []}
              defaultValue={[]}
              callback={(value) =>
                animalStore.setFilter(
                  "shelterapp_animal_type",
                  value as number[]
                )
              }
            />
            <DropDown
              items={animalSex}
              value={animalStore.filters.meta_sex || "ALL"}
              callback={(value) =>
                animalStore.setFilter(
                  "meta_sex",
                  value === "ALL" ? undefined : value
                )
              }
            />

            <AgeSelect
              value={[
                animalStore.filters.meta_age_max || 0,
                animalStore.filters.meta_age_min || 0,
              ]}
              defaultValue={[
                animalStore.filters.meta_age_max || 0,
                animalStore.filters.meta_age_min || 0,
              ]}
              callback={(value: [number, number]) => {
                animalStore.setFilter(
                  "meta_age_max",
                  value[0] === 0 ? undefined : value[0],
                  true,
                  false
                );
                animalStore.setFilter(
                  "meta_age_min",
                  value[1] === 0 ? undefined : value[1],
                  true,
                  false
                );
                animalStore.fetchCurrentAnimals();
              }}
            />
          </div>
          <div className="mb-4 dropdown-buttons gap-y-4 gap-x-4 items-center justify-center">
            <TrippleValueDropdown
              value={animalStore.filters.meta_missing}
              label="Wird vermisst"
              callback={(value) => animalStore.setFilter("meta_missing", value)}
            />

            <TrippleValueDropdown
              value={animalStore.filters.meta_was_found}
              label="Wurde Gefunden"
              callback={(value) =>
                animalStore.setFilter("meta_was_found", value)
              }
            />

            <TrippleValueDropdown
              value={animalStore.filters.meta_private_adoption}
              label="Fremdvermittlung"
              callback={(value) =>
                animalStore.setFilter("meta_private_adoption", value)
              }
            />
            <DropDown
              items={animalSort}
              value={animalStore.orderBy}
              callback={(value) =>
                animalStore.setOrderBy(value)
              }
            />
          </div>
        </>
      )}
      <Pagination
        currentPage={animalStore.currentPage}
        maxPages={animalStore.maxPages}
        onPageChange={(page) => {
          animalStore.setPage(page);
        }}
      ></Pagination>
      <ul className="flex justify-center gap-4 animals mb-12 flex-wrap items-stretch">
        {animalStore.animals?.map((animal) => (
          <AnimalCard key={animal.id} animal={animal} properties={animalStore.properties}/>
        ))}
      </ul>
      {!animalStore.loading && animalStore.animals.length === 0 && (
        <div className="text-center mt-20">
          <h1 className="text-4xl font-bold mb-4">Keine Tiere gefunden</h1>
          <button
            className="button font-normal"
            onClick={() => animalStore.resetFilter()}
          >
            Filter zurücksetzen
          </button>
        </div>
      )}
      {animalStore.loading && animalStore.animals.length === 0 && (
        <div className="text-center mt-20">
          <h1 className="text-4xl font-bold mb-4">Lade ...</h1>
        </div>
      )}

      <Pagination
        currentPage={animalStore.currentPage}
        maxPages={animalStore.maxPages}
        onPageChange={(page) => {
          animalStore.setPage(page);
        }}
      ></Pagination>
    </div>
  );
});
