export const AnimalStatus = {
  New: "NEW",
  Searching: "SEARCHING",
  RequestStop: "REQUEST_STOP",
  Emergency: "EMERGENCY",
  Reserved: "RESERVED",
  Adopted: "ADOPTED",
  FinalCare: "FINAL_CARE",
  CourtOfGrace: "COURT_OF_GRACE",
  Deceased: "DECEASED",
} as const;
export type AnimalStatus = (typeof AnimalStatus)[keyof typeof AnimalStatus];

const statusValues = Object.values(AnimalStatus);
const getAnimalStatusByIndex = (index: number): AnimalStatus => {
  return statusValues[index];
};

export { getAnimalStatusByIndex };
