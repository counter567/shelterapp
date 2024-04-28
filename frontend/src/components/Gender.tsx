import GenderIcon from "../icons/gender";
import MenIcon from "../icons/men";
import WomenIcon from "../icons/women";
import { AnimalSex } from "../models/animalSex";

interface GenderProps {
  sex: AnimalSex;
}

const Gender = ({ sex }: GenderProps) => {
  if (sex === AnimalSex.Female) {
    return <WomenIcon />;
  }
  if (sex === AnimalSex.Male) {
    return <MenIcon />;
  }

  return <GenderIcon />;
};

export default Gender;

const sexInGerman = (sex: AnimalSex) => {
  if (sex === AnimalSex.Female) {
    return "Weiblich";
  }
  if (sex === AnimalSex.Male) {
    return "Männlich";
  }

  return "";
};

export { sexInGerman };
