import { AnimalStatus } from "../models/animalStatus";
enum CardColors {
  Green = "green",
  Orange = "orange",
  Red = "red",
  Black = "black",
}

const getCSSColorByCardColor = (status: AnimalStatus): string => {
  switch (status) {
    case AnimalStatus.New:
    case AnimalStatus.Searching:
      return "#5cb85c";
    case AnimalStatus.RequestStop:
    case AnimalStatus.Reserved:
      return "#f0ad4e";
    case AnimalStatus.Emergency:
      return "#d9534f";
    // case AnimalStatus.Adopted:
    // return "#333";
    // not set yet
    case AnimalStatus.FinalCare:
    case AnimalStatus.CourtOfGrace:
      // case AnimalStatus.Deceased:
      return "#aaaaaa";
    default:
      console.warn("Unknown status", status);
      return "#aaaaaa";
  }
};

const getCardColorByAnimalStatus = (status: AnimalStatus): CardColors => {
  switch (status) {
    case AnimalStatus.New:
    case AnimalStatus.Searching:
      return CardColors.Green;
    case AnimalStatus.RequestStop:
    case AnimalStatus.Reserved:
      return CardColors.Orange;
    case AnimalStatus.Emergency:
      return CardColors.Red;
    // case AnimalStatus.Adopted:
    // return CardColors.Black;
    // not set yet
    case AnimalStatus.FinalCare:
    case AnimalStatus.CourtOfGrace:
      // case AnimalStatus.Deceased:
      return CardColors.Black;
    default:
      console.warn("Unknown status", status);
      return CardColors.Black;
  }
};

const germanStatus = (status: AnimalStatus): string => {
  switch (status) {
    case AnimalStatus.New:
      return "Neu";
    case AnimalStatus.Searching:
      return "Suchend";
    case AnimalStatus.RequestStop:
      return "Anfrage gestoppt";
    case AnimalStatus.Emergency:
      return "Notfall";
    case AnimalStatus.Reserved:
      return "Reserviert";
    // case AnimalStatus.Adopted:
    // return "Vermittelt";
    case AnimalStatus.FinalCare:
      return "Endpflege";
    case AnimalStatus.CourtOfGrace:
      return "Gnadenhof";
    // case AnimalStatus.Deceased:
    // return "Verstorben";
    default:
      throw console.error("Unknown status", status);
  }
};

export { getCardColorByAnimalStatus, germanStatus, getCSSColorByCardColor };
