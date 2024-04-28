import { AnimalSource } from "../models/animalSource";
import { requestData } from "./requestData";

let animalTypeMap = new Map<number, string>();

const allAnimals = async (): Promise<AnimalSource[]> => {
  let allAnimals = await requestData<AnimalSource[]>(
    "/wp/v2/shelterapp_animals"
  );
  allAnimals.map(async (animal) => await setCType(animal));
  return allAnimals;
};

const setCType = async (animalSource: AnimalSource) => {
  await animalTypes();
  if (animalSource.shelterapp_animal_type === undefined) return animalSource;
  animalSource.cType = animalSource.shelterapp_animal_type
    .map((nr) => animalTypeMap.get(nr))
    .join(", ");
};

const getAnimal = async (id: number): Promise<AnimalSource> => {
  let animal = await requestData<AnimalSource>(
    `/wp/v2/shelterapp_animals/${id}`
  );
  await setCType(animal);
  return animal;
};
interface SelectItem {
  id: number;
  name: string;
}
const animalTypes = async () => {
  if (animalTypeMap.size > 0) return;
  console.log("animalTypes");
  const allTypes = await requestData<SelectItem[]>(
    "/wp/v2/shelterapp_animal_type"
  );
  allTypes.forEach((type: { id: number; name: string }) => {
    animalTypeMap.set(type.id, type.name);
  });
  return allTypes;
};

export { allAnimals, animalTypes, getAnimal };
