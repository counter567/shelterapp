import { AnimalSource } from "../models/animalSource";
import { requestData } from "./requestData";

const getAnimalsPaged = async (page = 1, perPage = 10) => {
  return requestData<AnimalSource[]>("/wp/v2/shelterapp_animals", {
    page: page,
    per_page: perPage,
  });
};

const getAllanimals = async (perPage = 10) => {
  let page = 1;
  const animals = [] as AnimalSource[];
  while (true) {
    const res = await getAnimalsPaged(page, perPage);
    animals.push(...res);
    if (res._pagination.totalPages === page) {
      break;
    }
    page++;
  }
  return animals;
}

const getAnimal = async (id: number) => {
  return requestData<AnimalSource>(`/wp/v2/shelterapp_animals/${id}`);
};
export { getAnimalsPaged, getAnimal, getAllanimals };
