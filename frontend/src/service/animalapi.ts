import { requestData } from "./requestData";

let animalTypeMap = new Map<number, string>();

const animals = async () => {
  const allAnimals = await requestData("/wp/v2/shelterapp_animals");
  allAnimals.forEach(
    (animal: { shelterapp_animal_type: number[]; cType: string }) =>
      (animal.cType = animal.shelterapp_animal_type
        .map((nr) => animalTypeMap.get(nr))
        .join(", "))
  );
  return allAnimals;
};

const animalTypes = async () => {
  const allTypes = await requestData("/wp/v2/shelterapp_animal_type");
  allTypes.forEach((type: { id: number; name: string }) => {
    animalTypeMap.set(type.id, type.name);
  });
};

export { animals, animalTypes };
