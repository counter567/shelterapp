import { AnimalSex } from "./animalSex";
import { AnimalSource } from "./animalSource";
import { AnimalStatus, getAnimalStatusByIndex } from "./animalStatus";
export class Animal {
  constructor(animalSource: AnimalSource) {
    const props = { ...animalSource.shelterapp_meta };
    Object.assign(this, props, {
      name: animalSource.title.rendered,
      cType: animalSource.cType ?? "",

      id: props.id,
      illnesses: props.illnesses?.split(",") ?? [],
      allergies: props.allergies?.split(",") ?? [],
      otherPictureFileUrls: props.otherPictureFileUrls?.split(",") ?? [],
      dateOfBirth: parseDate(props.dateOfBirth),
      dateOfAdmission: parseDate(props.dateOfAdmission),
      dateOfLeave: parseDate(props.dateOfLeave),
      dateOfDeath: parseDate(props.dateOfDeath),
      breedTwo: props.breedTwo ?? "",
      sex: props.sex === "0" ? AnimalSex.Male : AnimalSex.Female,
      status: getAnimalStatusByIndex(+props.status!),
      _public: parseBoolean(props._public!),
      isPublic: parseBoolean(props.isPublic!),
      wasFound: parseBoolean(props.wasFound!),
      isSuccessStory: parseBoolean(props.isSuccessStory!),
      isMissing: parseBoolean(props.isMissing!),
      isPrivateAdoption: parseBoolean(props.isPrivateAdoption!),
      donationCall: parseBoolean(props.donationCall!),
      castrated: parseBoolean(props.castrated!),
      successStory: parseBoolean(props.successStory!),
      missing: parseBoolean(props.missing!),
      privateAdoption: parseBoolean(props.privateAdoption!),
      isCastrated: parseBoolean(props.isCastrated!),
    });
  }

  toJson() {
    return Object.assign({}, this, {
      illnesses: this.illnesses?.join(","),
      allergies: this.allergies?.join(","),
      otherPictureFileUrls: this.otherPictureFileUrls?.join(","),
    });
  }

  id: string = "";
  name: string = "";
  dateOfBirth?: Date;
  dateOfAdmission?: Date;
  dateOfLeave?: Date;
  dateOfDeath?: Date;
  type?: string;
  breedOne?: string;
  breedTwo?: string;
  sex?: AnimalSex;
  color?: string;
  mainPictureFileUrl?: string;
  weight?: number;
  heightAtWithers?: number;
  circumferenceOfNeck?: number;
  lengthOfBack?: number;
  circumferenceOfChest?: number;
  bloodType?: string;
  chipNumber?: string;
  notes?: string;
  description?: string;
  internalNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  status?: AnimalStatus;
  _public?: boolean;
  isPublic?: boolean;
  wasFound?: boolean;
  isSuccessStory?: boolean;
  isMissing?: boolean;
  isPrivateAdoption?: boolean;
  donationCall?: boolean;
  castrated?: boolean;
  successStory?: boolean;
  missing?: boolean;
  privateAdoption?: boolean;
  isCastrated?: boolean;
  cType?: string;
  illnesses?: string[];
  allergies?: string[];
  otherPictureFileUrls?: string[];
}

function parseDate(dateString?: string) {
  if (!dateString) {
    return undefined;
  }
  const year = parseInt(dateString.substring(0, 4), 10);
  const month = parseInt(dateString.substring(4, 6), 10) - 1; // Monate sind von 0-11 in JavaScript
  const day = parseInt(dateString.substring(6, 8), 10);

  return new Date(year, month, day);
}

function parseBoolean(value: string) {
  return value === "1" ? true : false;
}
