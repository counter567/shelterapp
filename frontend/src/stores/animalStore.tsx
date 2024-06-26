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
import { get } from "http";

const key = "local_animals";

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
    Object.prototype.toString.call(birthDate) !== "[object Date]" ||
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
        normalizedBirthDate > sixMonthsOld && normalizedBirthDate <= oneYearOld
      );

    case 3: // "1 bis 3 Jahre"
      return (
        normalizedBirthDate > oneYearOld && normalizedBirthDate <= threeYearsOld
      );

    case 4: // "3 bis 5 Jahre"
      return (
        normalizedBirthDate > threeYearsOld &&
        normalizedBirthDate <= fiveYearsOld
      );

    case 5: // "Über 5 Jahre"
      return normalizedBirthDate <= fiveYearsOld;

    default:
      return false;
  }
};

interface FilterCriteria<T> {
  propName: keyof T;
  value: any;
  compare: "===" | "!==" | "<" | "<=" | ">" | ">=";
}

interface DataContextType {
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
}

const DataContext = createContext<DataContextType>({
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
});

export const AnimalProvider: React.FC<PropsWithChildren<{}>> = ({
  children,
}) => {
  const [animals, setAnimals] = useState<Animal[]>([]);
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
  >([]);
  useEffect(() => {
    const loadData = async () => {
      const localData = parseFromLocalStorage();
      if (localData && localData.length > 0) {
        setAnimals(localData);
        calculateMaxPages(localData.length);
        await loadAnimals();
      } else {
        try {
          await loadAnimals();
        } catch (error) {
          console.error("Fehler beim Fetchen der Daten:", error);
        }
      }

      const foundAnimalTypes = await getAnimalTypes();
      setAnimalTypes(foundAnimalTypes);
    };

    loadData();
  }, []);

  const loadAnimals = async () => {
    const animalSource = await getAllanimals();
    const animals = animalSource.map((animal) => new Animal(animal));
    setAnimals(animals);
    calculateMaxPages(animals.length);
    localStorage.setItem(key, JSON.stringify(animalSource));
    return animals;
  };

  const getAnimal = async (slug: string) => {
    if (animals.length === 0) {
      const loadedAnimals = await loadAnimals();
      return loadedAnimals.find((animal) => animal.slug === slug);
    } else return animals.find((animal) => animal.slug === slug);
  };

  const parseFromLocalStorage = () => {
    const data = localStorage.getItem(key);
    if (data) {
      let parsed = JSON.parse(data) as AnimalSource[];
      const allAnimals = parsed.map((animal) => new Animal(animal));
      allAnimals.forEach((item) => {
        if (item.dateOfBirth) item.dateOfBirth = new Date(item.dateOfBirth);
        if (item.dateOfAdmission)
          item.dateOfAdmission = new Date(item.dateOfAdmission);
        if (item.dateOfLeave) item.dateOfLeave = new Date(item.dateOfLeave);
        if (item.dateOfDeath) item.dateOfDeath = new Date(item.dateOfDeath);
      });
      return allAnimals;
    }
    return [];
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

  const updateFilter = (criteria: FilterCriteria<AnimalToFilterProps>[]) => {
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
    return filterCriteriaCopy;
  };

  const filter = (criteria: FilterCriteria<AnimalToFilterProps>[]) => {
    updateProperties(criteria);
    const filterCriteria = updateFilter(criteria);
    const animals = parseFromLocalStorage();
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
    setAnimals(filtered);
    setCurrentPage(1);
    calculateMaxPages(filtered.length);
  };

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
    console.info("Updating data");
    setAnimals(newData);
    localStorage.setItem(key, JSON.stringify(newData));
  };

  return (
    <DataContext.Provider
      value={{
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
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
