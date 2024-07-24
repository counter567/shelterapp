import { AnimalSource } from "../models/animalSource";
import { AnimalFilterComputed, TypeData } from "../stores/animals";
import { RequestResponseWithPagination, requestData } from "./requestData";

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
  meta_order?: "ASC" | "DESC";
  meta_orderby?: string;
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

const cache = new Map<string, RequestResponseWithPagination & AnimalSource[]>();

// to filter use refference: https://developer.wordpress.org/rest-api/reference/posts/
const getAnimalsPaged = async (
  page = 1,
  perPage = 10,
  filter: AnimalFilterComputed = {},
) => {
  let CacheEntry = cache.get(JSON.stringify({ page, perPage, filter }));
  if (CacheEntry) {
    return CacheEntry;
  }
  const options = {
    page: page,
    per_page: perPage,
    ...filter,
  } as any;
  if (filter.meta_status) {
    options.meta_status = JSON.stringify(filter.meta_status);
  }
  if (!options.shelterapp_animal_type) {
    delete options.shelterapp_animal_type;
  }
  const response = await requestData<AnimalSource[]>(
    "/wp/v2/shelterapp_animals",
    options
  );
  cache.set(JSON.stringify({ page, perPage, filter }), response);
  return response;
};

/*const getAllanimals = async (perPage = 10) => {
  let page = 1;
  const animalsSource = [] as AnimalSource[];
  while (true) {
    const res = await getAnimalsPaged(page, perPage, {
      meta_status: [
        AnimalStatus.New,
        AnimalStatus.Searching,
        AnimalStatus.RequestStop,
        AnimalStatus.Emergency,
        AnimalStatus.Reserved,
        AnimalStatus.FinalCare,
        AnimalStatus.CourtOfGrace,
      ],
    });
    animalsSource.push(...res);
    if (res._pagination.totalPages === page) {
      break;
    }
    page++;
  }
  return animalsSource;
};*/

const getAnimal = async (slug: string) => {
  const animals = getAnimalsPaged(1, 1, { slug: slug });
  return (await animals).pop();
};
export interface SelectItem {
  id: number;
  name: string;
}

const getAnimalTypes = async () => {
  const response = await requestData<TypeData[]>(
    "/wp/v2/shelterapp_animal_type"
  );
  return response.map((item) => ({
    id: item.id,
    name: item.name,
    count: item.count,
  })) as TypeData[];
};

export { getAnimal, getAnimalTypes, getAnimalsPaged };
