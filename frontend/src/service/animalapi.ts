import { Animal } from "../models/animal";
import { AnimalSource } from "../models/animalSource";
import { requestData } from "./requestData";

export interface PostFilter {
  context?: "view" | "embed" | "edit";
  search?: string;
  search_columns?: ("post_title" | "post_content" | "post_excerpt")[];
  after?: string;
  before?: string;
  modified_after?: string;
  modified_before?: string;
  author?: number[];
  author_exclude?: number[];
  exclude?: number[];
  include?: number[];
  offset?: number;
  order?: "asc" | "desc";
  orderby?:
    | "author"
    | "date"
    | "id"
    | "include"
    | "modified"
    | "parent"
    | "relevance"
    | "slug"
    | "title";
  slug?: string;
  status?: "publish" | "future" | "draft" | "pending" | "private";
  shelterapp_animal_type?: number[];
  shelterapp_animal_type_exclude?: number[];
  shelterapp_animal_allergies?: number[];
  shelterapp_animal_allergies_exclude?: number[];
  shelterapp_animal_illness?: number[];
  shelterapp_animal_illness_exclude?: number[];
  tags?: number[];
  tags_exclude?: number[];
  sticky?: boolean;
  _fields?: string[];
  _embed?: boolean;
  tax_relation?: "AND" | "OR";
  filter?: any;
}

// to filter use refference: https://developer.wordpress.org/rest-api/reference/posts/
const getAnimalsPaged = async (
  page = 1,
  perPage = 10,
  filter: PostFilter = {}
) => {
  return requestData<AnimalSource[]>("/wp/v2/shelterapp_animals", {
    page: page,
    per_page: perPage,
    ...filter,
  });
};

const getAllanimals = async (perPage = 10) => {
  let page = 1;
  const animalsSource = [] as AnimalSource[];
  while (true) {
    const res = await getAnimalsPaged(page, perPage);
    animalsSource.push(...res);
    if (res._pagination.totalPages === page) {
      break;
    }
    page++;
  }
  return animalsSource;
};

const getAnimal = async (slug: string) => {
  const animals = getAnimalsPaged(1, 1, { slug: slug });
  return (await animals).pop();
};
export interface SelectItem {
  id: number;
  name: string;
}

export interface SelectItemString {
  id: string;
  name: string;
}
const getAnimalTypes = async () => {
  const response = await requestData<SelectItem[]>(
    "/wp/v2/shelterapp_animal_type"
  );
  return response.map((item) => ({ id: item.id, name: item.name }));
};

export { getAnimalsPaged, getAnimal, getAllanimals, getAnimalTypes };
