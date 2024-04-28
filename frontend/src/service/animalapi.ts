import { AnimalSource } from "../models/animalSource";
import { requestData } from "./requestData";

const allAnimals = async (): Promise<AnimalSource[]> => {
  return requestData<AnimalSource[]>("/wp/v2/shelterapp_animals");
};

const getAnimal = async (id: number): Promise<AnimalSource> => {
  return requestData<AnimalSource>(`/wp/v2/shelterapp_animals/${id}`);
};
export { allAnimals, getAnimal };
