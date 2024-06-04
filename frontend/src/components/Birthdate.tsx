import { calculateAge } from "../helper/calculateAge";

interface BirthDateProps {
  birthDate: Date;
}

const BirthDate = ({ birthDate }: BirthDateProps) => {
  const { months, years } = calculateAge(birthDate);
  return (
    <div>
      <span>
        {years !== 0 && <span>{years} Jahre</span>}{" "}
        {months !== 0 && <span>{months} Monate</span>}
      </span>
    </div>
  );
};

export default BirthDate;
