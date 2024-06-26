import { AnimalSex } from "./animalSex";
import { AnimalSource } from "./animalSource";
import { AnimalStatus } from "./animalStatus";
export interface AnimalToFilterProps {
  sex?: string;
  type?: string;
  status?: AnimalStatus;
  dateOfBirth?: Date;
}

export class Animal implements AnimalToFilterProps {
  constructor(animalSource: AnimalSource) {
    const props = { ...animalSource.shelterapp_meta };
    Object.assign(this, props, {
      name: animalSource.title.rendered,
      id: animalSource.id,
      slug: animalSource.slug,

      illnesses: props.illnesses ?? [],
      allergies: props.allergies ?? [],
      otherPictureFileUrls: props.otherPictureFileUrls ?? [],
      dateOfBirth: parseDate(props.dateOfBirth),
      dateOfAdmission: parseDate(props.dateOfAdmission),
      dateOfLeave: parseDate(props.dateOfLeave),
      dateOfDeath: parseDate(props.dateOfDeath),
      breedTwo: props.breedTwo ?? "",
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

  // toJson() {
  //   return Object.assign({}, this, {
  //     illnesses: this.illnesses?.join(","),
  //     allergies: this.allergies?.join(","),
  //     otherPictureFileUrls: this.otherPictureFileUrls?.join(","),
  //   });
  // }

  id: string = "";
  slug: string = "";
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
  illnesses?: string[];
  allergies?: string[];
  otherPictureFileUrls?: {
    meta: ImageMetaData;
    url: string;
    thumbnailUrl: string;
  }[];

  getPersonalData() {
    const result = [];
    if (this.weight) result.push(`Gewicht: ${this.weight} kg`);
    if (this.heightAtWithers)
      result.push(`Widerristhöhe: ${this.heightAtWithers} cm`);
    if (this.circumferenceOfNeck)
      result.push(`Halsumfang: ${this.circumferenceOfNeck} cm`);
    if (this.lengthOfBack) result.push(`Rückenlänge: ${this.lengthOfBack} cm`);
    if (this.circumferenceOfChest)
      result.push(`Brustumfang: ${this.circumferenceOfChest} cm`);
    return result;
  }
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

export interface ImageMetaData {
  width: number;
  height: number;
  file: string;
  filesize: number;
  sizes: Sizes;
  image_meta: ImageMeta;
}

export interface Sizes {
  medium: ImageSize;
  large: ImageSize;
  thumbnail: ImageSize;
  medium_large: ImageSize;
  "1536x1536": ImageSize;
}

export interface ImageSize {
  file: string;
  width: number;
  height: number;
  "mime-type": string;
  filesize: number;
}

export interface ImageMeta {
  aperture: string;
  credit: string;
  camera: string;
  caption: string;
  created_timestamp: string;
  copyright: string;
  focal_length: string;
  iso: string;
  shutter_speed: string;
  title: string;
  orientation: string;
  keywords: any[];
}
