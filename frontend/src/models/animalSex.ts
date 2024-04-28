export const AnimalSex = {
  Male: "MALE",
  Female: "FEMALE",
} as const;
export type AnimalSex = (typeof AnimalSex)[keyof typeof AnimalSex];
