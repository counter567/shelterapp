import { AnimalStatus } from "../models/animalStatus";
enum CardColors {
  Green = "green",
  Orange = "orange",
  Red = "red",
}

const getCSSColorByCardColor = (status: AnimalStatus): string => {
  const color = getCardColorByAnimalStatus(status);
  switch (color) {
    case CardColors.Green:
      return "#5cb85c";
    case CardColors.Orange:
      return "#f0ad4e";
    case CardColors.Red:
      return "#d9534f";
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
    // not set yet
    case AnimalStatus.FinalCare:
    case AnimalStatus.Adopted:
    case AnimalStatus.CourtOfGrace:
    case AnimalStatus.Deceased:
    default:
      throw console.error("Unknown status", status);
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
    case AnimalStatus.Adopted:
      return "Vermittelt";
    case AnimalStatus.FinalCare:
      return "Endpflege";
    case AnimalStatus.CourtOfGrace:
      return "Gnadenhof";
    case AnimalStatus.Deceased:
      return "Verstorben";
    default:
      throw console.error("Unknown status", status);
  }
};

export { getCardColorByAnimalStatus, germanStatus, getCSSColorByCardColor };
