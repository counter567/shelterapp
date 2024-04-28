import { AnimalSource } from "../models/animalSource";
import { requestData } from "./requestData";

let animalTypeMap = new Map<number, string>();

type Endpoints = "shelterapp_animals" | "shelterapp_animal_type";

const allAnimals = async (): Promise<AnimalSource[]> => {
  await animalTypes();
  let allAnimals = await requestData("/wp/v2/shelterapp_animals");
  allAnimals.forEach(
    (animal: { shelterapp_animal_type: number[]; cType: string }) => {
      animal.cType = animal.shelterapp_animal_type
        .map((nr) => animalTypeMap.get(nr))
        .join(", ");
      return animal;
    }
  );
  return allAnimals;
};

const animalTypes = async () => {
  console.log("animalTypes");
  const allTypes = await requestData("/wp/v2/shelterapp_animal_type");
  allTypes.forEach((type: { id: number; name: string }) => {
    animalTypeMap.set(type.id, type.name);
  });
  return allTypes;
};

const getData = (endPoint: Endpoints) => {
  return requestData(`/wp/v2/${endPoint}`);
};

export { allAnimals, animalTypes };
