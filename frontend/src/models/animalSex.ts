export const AnimalSex = {
  Male: "MALE",
  Female: "FEMALE",
  All: "ALL",
} as const;
export type AnimalSex = (typeof AnimalSex)[keyof typeof AnimalSex];
