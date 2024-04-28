import { calculateAge } from "../helper/calculateAge";

interface BirthDateProps {
  birthDate: Date;
}

const BirthDate = ({ birthDate }: BirthDateProps) => {
  const res = calculateAge(birthDate);
  const showMonths = res.months > 0 && res.years !== 0;
  return (
    <div>
      <span>
        {res.years} Jahre {showMonths && <span>{res.months} Monate</span>}
      </span>
    </div>
  );
};

export default BirthDate;
