import { action, makeObservable, observable } from "mobx";
import { createContext } from "react";
import { BehaviorSubject } from "rxjs";
import { animalSex, animalStatus } from "../components/AnimalList";
import { Animal } from "../models/animal";
import { AnimalSex } from "../models/animalSex";
import { AnimalStatus } from "../models/animalStatus";
import {
  PostFilter,
  getAnimal,
  getAnimalTypes,
  getAnimalsPaged,
} from "../service/animalapi";

export const AuthInitialized = new BehaviorSubject<boolean>(false);

export interface AnimalFilter extends PostFilter {
  meta_status?: Array<AnimalStatus>;
  meta_sex?: AnimalSex;
  meta_age_max?: number;
  meta_age_min?: number;
  meta_was_found?: boolean;
  meta_missing?: boolean;
  meta_private_adoption?: boolean;
}
export interface AnimalFilterComputed extends PostFilter {
  meta_status?: AnimalStatus | AnimalStatus[];
  meta_sex?: AnimalSex | number;
}
export interface TypeData {
  id: number;
  name: string;
  count: number;
}

export class AnimalsStore {
  loading: boolean = false;
  animals: Animal[] = [];
  singleAnimal: Animal | null = null;
  currentPage = 1;
  maxPages = 1;
  postsPerPage = 10;
  filters: AnimalFilter = {};
  hideFilters = false;
  defaultTitle: string;

  typesData: TypeData[] = [];

  constructor() {
    this.defaultTitle = document.title;
    makeObservable(this, {
      loading: observable,
      setLoading: action,
      animals: observable,
      setAnimals: action,
      singleAnimal: observable,
      setSingleAnimal: action,
      currentPage: observable,
      setCurrentPage: action,
      maxPages: observable,
      setMaxPages: action,
      postsPerPage: observable,
      setPostsPerPage: action,
      filters: observable,
      setFilters: action,
      hideFilters: observable,
      setHideFilters: action,
      defaultTitle: observable,
      setDefaultTitle: action,
      typesData: observable,
      setTypesData: action,
    });
  }

  setLoading = (value: boolean) => {
    this.loading = value;
  };
  setAnimals = (value: Animal[]) => {
    this.animals = value;
  };

  setCurrentPage = (value: number) => {
    this.currentPage = value;
  };

  setFilters = (value: AnimalFilter) => {
    this.filters = value;
  };

  setDefaultTitle = (value: string) => {
    this.defaultTitle = value;
  };

  async fetchSingleAnimal(slug: string) {
    const animal = await getAnimal(slug);
    if (animal) {
      const foundAnimal = new Animal(animal);
      await foundAnimal.generateThumbnailsForVideos();
      this.setSingleAnimal(foundAnimal);
    }
  }

  setSingleAnimal(animal: Animal) {
    this.singleAnimal = animal;
  }

  async fetchCurrentAnimals() {
    this.setLoading(true);
    const res = await getAnimalsPaged(
      this.currentPage,
      this.postsPerPage,
      this.filterData
    );
    this.setAnimals(res?.map((animal) => new Animal(animal)) || []);
    this.setMaxPages(res?._pagination?.totalPages || 1);
    this.setLoading(false);
  }

  async fetchanimalByName(name: string) {
    // @TODO
  }

  // Pagination

  setPage(page: number) {
    if (page > this.maxPages || page < 1) {
      return;
    }
    this.setCurrentPage(page);
    this.fetchCurrentAnimals();
  }
  setMaxPages(maxPages: number) {
    this.maxPages = maxPages;
  }
  setPostsPerPage(postsPerPage: number) {
    this.postsPerPage = postsPerPage;
    this.fetchCurrentAnimals();
  }

  // Status

  fetchStatusData() {}

  setStatusData() {}

  // Types

  async fetchTypesData() {
    const typesStored = localStorage.getItem("sa.animal.types");
    if (typesStored !== null) {
      this.setTypesData(JSON.parse(typesStored), false);
    }
    const types = await getAnimalTypes();
    this.setTypesData(types);
  }

  setTypesData(typeData: TypeData[], store = true) {
    this.typesData = typeData//.filter((e) => e.count > 0);
    if (store) {
      localStorage.setItem("sa.animal.types", JSON.stringify(typeData));
    }
  }

  // Filter

  get filterData() {
    const filters: AnimalFilterComputed = {
      ...(this.filters as any),
    };
    // fill meta_status
    if (this.filters.meta_status && this.filters.meta_status.length > 0) {
      filters.meta_status = this.filters.meta_status as AnimalStatus[];
    } else {
      filters.meta_status = Object.values(AnimalStatus);
    }
    if (
      this.filters.shelterapp_animal_type &&
      this.filters.shelterapp_animal_type.length > 0
    ) {
      filters.shelterapp_animal_type = this.filters.shelterapp_animal_type;
    } else {
      filters.shelterapp_animal_type = undefined;
    }

    return filters;
  }

  setFilter<T extends keyof AnimalFilter>(
    filter: T,
    value: AnimalFilter[T],
    store = true,
    refresh = true,
  ) {
    this.setCurrentPage(1);
    if (value === undefined) {
      const currentFilter = JSON.parse(JSON.stringify(this.filters));
      delete currentFilter[filter];
      this.setFilters(currentFilter);
    } else {
      const currentFilter = JSON.parse(JSON.stringify(this.filters));
      currentFilter[filter] = value;
      this.setFilters(currentFilter);
    }
    if (store) {
      if(refresh) {
        this.fetchCurrentAnimals();
      }
      if (!this.hideFilters) {
        const url = new URL(window.location as any);
        url.hash =
          "#" +
          Object.keys(this.filters)
            .filter((c) => !!c)
            .map((c) => `${c}=${(this.filters as any)[c]}`)
            .join("&");
        window.history.pushState({}, "", url.toString());
      }
    }
  }

  loadFiltersFromURL() {
    if (!this.hideFilters) {
      const hash = new URL(window.location as any).hash;
      hash
        .slice(1)
        .split("&")
        .forEach((c) => {
          let [propName, value] = c.split("=") as [string, any];
          if (propName === "meta_age_max" || propName === "meta_age_min") {
            value = Number.isInteger(parseInt(value)) ? parseInt(value) : value;
          } else if (
            propName === "meta_status"
            ) {
            value = value.split(",").filter((it: string) => it !== '' )
          } else if (propName === "shelterapp_animal_type") {
            value = value.split(",").filter((it: string) => it !== '' ).map((it: string) => parseInt(it))
          }
          const currentFilter = JSON.parse(JSON.stringify(this.filters));
          (currentFilter as any)[propName] = value;
          this.setFilters(currentFilter);
        });
    }
  }

  resetFilter() {
    this.setFilters({ meta_status: Object.values(AnimalStatus) });
    this.fetchCurrentAnimals();
  }

  setHideFilters(hideFilters: boolean) {
    this.hideFilters = hideFilters;
  }

  // Title

  get title() {
    let newTitle = this.defaultTitle;

    if (this.filters.shelterapp_animal_type) {
      const value =
        this.typesData.find(
          (type) =>
            this.filters.shelterapp_animal_type?.find(
              (it) => it === type.id
            ) !== undefined
        )?.name || undefined;
      if (value) {
        newTitle += ` - ${value}`;
      }
    }
    if (this.filters.meta_sex) {
      const entry = animalSex.find((e) => e.id === this.filters.meta_sex);
      if (entry) {
        newTitle += ` - ${entry?.name}`;
      }
    }
    if (this.filters.meta_status) {
      const combined = this.filters.meta_status
        .map((it: AnimalStatus) => animalStatus.find((e) => e.id === it)?.name)
        .join(",");
      if (combined) {
        newTitle += ` - ${combined}`;
      }
    }
    /*
        if (propName === "status" && value !== 0) {
            const entry = animalStatus.filter(e => e.id === value).pop();
            if(entry) {
            newTitle += ` - ${entry?.name}`;
            }
        }
        */
    return newTitle;
  }
}

export const AnimalsStoreInstance = new AnimalsStore();
export const AnimalsStoreContext = createContext(AnimalsStoreInstance);
export default AnimalsStoreContext;
