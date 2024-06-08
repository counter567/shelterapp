import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { Animal, AnimalToFilterProps } from "../models/animal";
import { AnimalSex } from "../models/animalSex";
import { getAllanimals, getAnimalTypes } from "../service/animalapi";
import { AnimalStatus } from "../models/animalStatus";
import { AnimalSource } from "../models/animalSource";
import { ageFilter, animalSex, animalStatus } from "../components/AnimalList";
import { AppProps } from "../App";

const keyAnimals = "local_animals";
const keyTypes = "local_animal_types";

const startOfDay = (date: Date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

const calculateDateThreshold = (monthsOffset = 0, yearsOffset = 0) => {
  const now = new Date();
  now.setMonth(now.getMonth() + monthsOffset);
  now.setFullYear(now.getFullYear() + yearsOffset);
  return startOfDay(now);
};

const sixMonthsOld = calculateDateThreshold(-6, 0);
const oneYearOld = calculateDateThreshold(0, -1);
const threeYearsOld = calculateDateThreshold(0, -3);
const fiveYearsOld = calculateDateThreshold(0, -5);

const getAgeFilter = (value: number, birthDate?: Date) => {
  if (
    !birthDate ||
    !(birthDate instanceof Date) ||
    isNaN(birthDate.getTime())
  ) {
    return false;
  }

  const normalizedBirthDate = startOfDay(birthDate);

  const today = startOfDay(new Date());

  switch (value) {
    case 0: // "Alter beliebig"
      return true;

    case 1: // "Bis 6 Monate"
      return (
        normalizedBirthDate >= sixMonthsOld && normalizedBirthDate <= today
      );

    case 2: // "Bis 12 Monate"
      return (
        normalizedBirthDate <= sixMonthsOld && normalizedBirthDate >= oneYearOld
      );

    case 3: // "1 bis 3 Jahre"
      return (
        normalizedBirthDate <= oneYearOld && normalizedBirthDate >= threeYearsOld
      );

    case 4: // "3 bis 5 Jahre"
      return (
        normalizedBirthDate <= threeYearsOld && normalizedBirthDate >= fiveYearsOld
      );

    case 5: // "Über 5 Jahre"
      return normalizedBirthDate >= fiveYearsOld;

    default:
      return false;
  }
};

interface FilterCriteria<T> {
  propName: keyof T;
  value: any;
  compare: "===" | "!==" | "<" | "<=" | ">" | ">=";
}
enum FilterCompare { "===", "!==","<","<=",">",">="}
type AnimalType = { id: number;name: string;}

interface DataContextType {
  getOriginalTitle: () => string;
  getTitle: () => string;
  getAnimalTypes: () => AnimalType[];
  getAnimalsPaged: () => Animal[];
  updateData: (newData: Animal[]) => void;
  filter: (criteria: FilterCriteria<AnimalToFilterProps>[]) => void;
  changePage: (newPage: number) => void;
  resetFilter: () => void;
  getAnimal: (slug: string) => Promise<Animal | undefined>;
  entriesPerPage: number;
  currentPage: number;
  maxPages: number;
  searchedAnimalAge?: number;
  searchedAnimalType?: number;
  searchedAnimalSex?: AnimalSex;
  searchedAnimalStatus?: AnimalStatus | number;
  ready: boolean;
  loaded: boolean;
}

const DataContext = createContext<DataContextType>({
  getOriginalTitle: () => document.title,
  getTitle: () => '',
  getAnimalTypes: () => [],
  getAnimalsPaged: () => [],
  updateData: () => {},
  filter: () => {},
  changePage: () => {},
  resetFilter: () => {},
  getAnimal: () => Promise.resolve(undefined),
  entriesPerPage: 10,
  currentPage: 1,
  maxPages: 1,
  searchedAnimalAge: undefined,
  searchedAnimalType: undefined,
  searchedAnimalSex: undefined,
  searchedAnimalStatus: undefined,
  ready: false,
  loaded: false,
});

export const AnimalProvider: React.FC<PropsWithChildren<{
  props?: AppProps;
}>> = ({
  children,
  props,
}) => {

  const [ready, setReady] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [title] = useState<string>(document.title);
  const [animals, setAnimals] = useState<Animal[]>(parseAnimalsFromLocalStorage());
  const [filterCriteria, setFilterCriteria] = useState<
    FilterCriteria<AnimalToFilterProps>[]
  >([]);
  const [entriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [maxPages, setMaxPages] = useState<number>(1);
  const [searchedAnimalType, setSearchedAnimalType] = useState<number>(0);
  const [searchedAnimalAge, setSearchedAnimalAge] = useState<number>(0);
  const [searchedAnimalStatus, setSearchedAnimalStatus] = useState<
    AnimalStatus | number
  >(0);
  const [searchedAnimalSex, setSearchedAnimalSex] = useState<AnimalSex>(
    AnimalSex.All
  );
  const [animalTypes, setAnimalTypes] = useState<
    {
      id: number;
      name: string;
    }[]
  >(parseAnimalTypesFromLocalStorage());

  useEffect(() => {
    const loadData = async () => {
      const [animals, foundAnimalTypes] = await Promise.all([loadAnimals(), getAnimalTypes()]);
      storeAnimalTypesToLocalStorage(foundAnimalTypes);
      setAnimalTypes(foundAnimalTypes);
      calculateMaxPages(animals.length);
      parseHashFilters();
      setLoaded(true);
    };

    // parsing the hash filters from url and applying filters.
    const parseHashFilters = () => {
      if(props && props.hideFilters){
        filter(initFiltersFromAppProps(props));
      } else {
        const url = new URL(window.location as any);
        const hash = url.hash;
        if (hash) {
          const criteria = hash.slice(1).split('&').map(c => {
            let [propName, serializedValue] = c.split('=');
            let [value, compare] = serializedValue.split('|') as [any, string];
            if(propName === 'type' || propName === 'dateOfBirth' || propName === 'status') {
              value = Number.isInteger(parseInt(value)) ? parseInt(value) : value;
            }
            return { propName, value, compare: FilterCompare[compare as any] };
          });
          filter(criteria as any[], false);
        }
      }
      setReady(true);
    }

    // Also listen to pop state so returning to an earlier filter is possible.
    window.addEventListener('popstate', parseHashFilters);
    // Also parse on entering the site.
    window.addEventListener('load', parseHashFilters);
    
    loadData();
    parseHashFilters();
  }, []);

  const loadAnimals = async () => {
    const animalSource = await getAllanimals();
    const animals = animalSource.map((animal) => new Animal(animal));
    calculateMaxPages(animals.length);
    localStorage.setItem(keyAnimals, JSON.stringify(animalSource));
    // filter([]);
    return animals;
  };

  const getAnimal = async (slug: string) => {
    if (animals.length === 0) {
      const loadedAnimals = await loadAnimals();
      return loadedAnimals.find((animal) => animal.slug === slug);
    } else return animals.find((animal) => animal.slug === slug);
  };

  const getAnimalsPaged = () => {
    const start = (currentPage - 1) * entriesPerPage;
    if (start >= animals.length || start < 0) {
      return [];
    }
    const end = Math.min(start + entriesPerPage, animals.length);
    const animalsPaged = animals.slice(start, end);
    return animalsPaged;
  };

  const hasValue = (value: any) => {
    return value !== undefined && value !== "" && value;
  };

  const updateProperties = (
    criteria: FilterCriteria<AnimalToFilterProps>[]
  ) => {
    criteria.forEach((criterion) => {
      const { propName, value } = criterion;
      if (propName === "sex") {
        setSearchedAnimalSex(value);
      }
      if (propName === "type") {
        setSearchedAnimalType(value);
      }
      if (propName === "dateOfBirth") {
        setSearchedAnimalAge(value);
      }
      if (propName === "status") {
        setSearchedAnimalStatus(value);
      }
    });
  };

  const resetFilter = () => {
    setCurrentPage(1);
    setSearchedAnimalSex(AnimalSex.All);
    setSearchedAnimalType(0);
    setSearchedAnimalAge(0);
    setSearchedAnimalStatus(0);
    filter([]);
  };

  const updateFilter = (criteria: FilterCriteria<AnimalToFilterProps>[], pushing = true) => {
    if (criteria.length === 0) {
      setFilterCriteria([]);
      return [];
    }
    const filterCriteriaCopy = [...filterCriteria];
    criteria.forEach((criterion) => {
      const { propName, value } = criterion;
      const found = filterCriteriaCopy.find((c) => c.propName === propName);
      const index = found ? filterCriteriaCopy.indexOf(found) : -1;
      if (index !== -1) {
        filterCriteriaCopy[index].value = value;
      } else {
        filterCriteriaCopy.push(criterion);
      }
    });
    setFilterCriteria(filterCriteriaCopy);
    
    // disable pushstate if hideFilters is set.
    if(pushing && !props?.hideFilters) {
      const url = new URL(window.location as any);
      url.hash = '#' + filterCriteriaCopy.map(c => `${c.propName}=${c.value}|${FilterCompare[c.compare]}`).join('&');
      window.history.pushState({}, '', url.toString());
    }

    return filterCriteriaCopy;
  };

  const filter = (criteria: FilterCriteria<AnimalToFilterProps>[], pushing = true) => {
    updateProperties(criteria);
    const filterCriteria = updateFilter(criteria, pushing);

    const animals = parseAnimalsFromLocalStorage();
    const animalTypes = parseAnimalTypesFromLocalStorage();
    const filtered = animals.filter((item) => {
      return filterCriteria.every((criterion) => {
        let { propName, compare, value } = criterion;
        if (propName === "type" && value !== undefined) {
          value =
            animalTypes.find((animal) => animal.id === value)?.name ||
            undefined;
        }
        if (propName === "sex" && value === AnimalSex.All) {
          return true;
        }
        if (propName === "dateOfBirth" && value !== undefined) {
          return getAgeFilter(value, item.dateOfBirth);
        }
        if (propName === "status" && value === 0) {
          return true;
        }
        if (propName === "donationCall" && value === 0) {
          return true;
        }
        if (!hasValue(value)) {
          return true;
        }
        const propValue = item[propName];
        if (!propValue) {
          return false;
        }
        switch (compare) {
          case "===":
            return propValue === value;
          case "!==":
            return propValue !== value;
          case "<":
            return propValue < value;
          case "<=":
            return propValue <= value;
          case ">":
            return propValue > value;
          case ">=":
            return propValue >= value;
          default:
            return false;
        }
      });
    });

    console.log(filterCriteria, filtered);

    setAnimals(filtered);
    setCurrentPage(1);
    calculateMaxPages(filtered.length);
  };

  const getTitle = () => {
    let newTitle = title;
    const order = [
      "type",
      "sex",
      "status",
      "dateOfBirth"
    ];
    filterCriteria.slice().sort((a,b)=> order.indexOf(a.propName) - order.indexOf(b.propName)).forEach((criterion) => {
      let { propName, compare, value } = criterion;
      if (propName === "type" && value !== undefined) {
        value = animalTypes.find((animal) => animal.id === value)?.name || undefined;
        if(value) {
          newTitle += ` - ${value}`;
        }
      }
      if (propName === "sex" && value != AnimalSex.All) {
        const entry = animalSex.filter(e => e.id == value).pop();
        if(entry) {
          newTitle += ` - ${entry?.name}`;
        }
      }
      if (propName === "dateOfBirth" && value !== undefined && value !== 0) {
        const entry = ageFilter.filter(e => e.id === value).pop();
        if(entry) {
          newTitle += ` - ${entry?.name}`;
        }
      }
      if (propName === "status" && value !== 0) {
        const entry = animalStatus.filter(e => e.id === value).pop();
        if(entry) {
          newTitle += ` - ${entry?.name}`;
        }
      }
    });
    return newTitle;
  }

  const changePage = (newPage: number) => {
    if (newPage < 1 || newPage > maxPages) {
      return;
    }
    setCurrentPage(newPage);
  };

  const calculateMaxPages = (total: number = 1) => {
    const maxPages = Math.ceil(total / entriesPerPage);
    setMaxPages(maxPages);
  };

  const updateData = (newData: Animal[]) => {
    setAnimals(newData);
    localStorage.setItem(keyAnimals, JSON.stringify(newData));
  };

  const getAnimalTypesLocal = () => {
    return animalTypes;
  }

  return (
    <DataContext.Provider
      value={{
        getOriginalTitle: () => title,
        getTitle,
        getAnimalTypes: getAnimalTypesLocal,
        getAnimalsPaged,
        updateData,
        filter,
        changePage,
        resetFilter,
        getAnimal,
        entriesPerPage,
        searchedAnimalAge,
        currentPage,
        maxPages,
        searchedAnimalType,
        searchedAnimalSex,
        searchedAnimalStatus,
        ready,
        loaded,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);

const parseAnimalsFromLocalStorage = () => {
  const data = localStorage.getItem(keyAnimals);
  if (data) {
    let parsed = JSON.parse(data) as AnimalSource[];
    const allAnimals = parsed.map((animal) => new Animal(animal));
    return allAnimals;
  }
  return [];
};

const parseAnimalTypesFromLocalStorage = () => {
  const data = localStorage.getItem(keyTypes);
  if (data) {
    let parsed = JSON.parse(data) as AnimalType[];
    return parsed;
  }
  return [];
};
const storeAnimalTypesToLocalStorage = (types: AnimalType[]) => {
  localStorage.setItem(keyTypes, JSON.stringify(types));
};


const initFiltersFromAppProps = (props: AppProps) => {
  const filters = [];
  if (props.type !== undefined && props.type!==-1) {
    filters.push({
      propName: "type",
      compare: "===",
      value: props.type,
    } as FilterCriteria<AnimalToFilterProps>);
  }
  if (props.status) {
    filters.push({
      propName: "status",
      compare: "===",
      value: props.status,
    } as FilterCriteria<AnimalToFilterProps>);
  }
  return filters;
}