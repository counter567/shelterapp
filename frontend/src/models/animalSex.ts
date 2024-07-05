export const AnimalSex = {
  Male: "MALE",
  Female: "FEMALE",
  Divers: "DIV",
  Gruppe: "GROUP",
  All: "ALL",
} as const;
export type AnimalSex = (typeof AnimalSex)[keyof typeof AnimalSex];
