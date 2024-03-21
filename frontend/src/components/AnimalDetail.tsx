import ImageGallery from "react-image-gallery";
import CakeIcon from "../icons/cake";
import CalendarIcon from "../icons/calendar";
import CheckIcon from "../icons/check";
import HeartIcon from "../icons/heart";
import InfoIcon from "../icons/infoCircle";
import MenIcon from "../icons/men";
import "./AnimalDetail.css";
import PayPalButton from "./PaypalButton";
import SectionList from "./SectionList";

const first = {
  name: "Andrea",
  kind: "Europäisch Kurzhaar",
  type: "Katze",
  gender: "female",
  age: "14 Jahre 7 Monate",
  since: "seit 10.03.2024",
  need: "Notfall",
  hints: ["Schlachtfreies Zuhause", "keine Einzelhaltung"],
  found: true,
  donators: ["Hans Peter", "Hans Peter 2", "Hans Peter 3"],
  properties: ["Freigänger", "kastriert", "gechipt", "geimpft"],
  image:
    "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8Mnx8fGVufDB8fHx8fA%3D%3D",
};

const images = [
  {
    original: "https://picsum.photos/id/1018/1000/600/",
    thumbnail: "https://picsum.photos/id/1018/250/150/",
  },
  {
    original: "https://picsum.photos/id/1015/1000/600/",
    thumbnail: "https://picsum.photos/id/1015/250/150/",
  },
  {
    original: "https://picsum.photos/id/1019/1000/600/",
    thumbnail: "https://picsum.photos/id/1019/250/150/",
  },
];

const AnimalDetail = () => {
  const {
    age,
    gender,
    image,
    kind,
    name,
    need,
    since,
    hints,
    donators,
    type,
    properties,
  } = first;
  return (
    <div>
      <h1 className="text-center md:text-left md:pl-16 text-blue-800 font-bold py-12 text-5xl w-full  bg-gradient-to-r from-cyan-500 to-blue-500">
        {name}
      </h1>
      <div className="max-w-screen-md md:flex mx-8">
        <div className="p-4 flex flex-col size-max:sm:min-w-full sm:min-w-[320px]">
          <div className="flex items-center flex-col mb-8">
            <div className="image bg-gray-100 rounded-full relative flex flex-col items-center">
              <img
                className="object-cover rounded-full absolute"
                src={image}
                alt={name}
              />
            </div>
          </div>
          {since && <span className="text-center mb-2">{since}</span>}
          <span
            className="rounded-lg mb-8 text-white py-3 font-bold text-center"
            style={{ backgroundColor: "#d9534f" }}
          >
            {need}
          </span>
          <span className="mb-2 flex items-center">
            <CakeIcon className="mr-2" /> {age}
          </span>
          <SectionList
            className="mb-4"
            heading="Eigenschaften"
            values={properties}
          >
            <CheckIcon className="mr-2" stroke="lightgreen" />
          </SectionList>
          <SectionList className="mb-4" heading="Hinweis" values={hints}>
            <InfoIcon className="mr-2" />
          </SectionList>
          <SectionList className="mb-4" heading="Wir danken" values={donators}>
            <HeartIcon className="mr-2" stroke="red" fill="red" />{" "}
          </SectionList>
          <PayPalButton name={name} />
        </div>
        <div className="p-4">
          <h1 className="font-bold mb-2 text-5xl w-full">{name}</h1>
          <span className="text-3xl">
            <MenIcon className="mr-2" size={20} /> {gender},{type} ({kind})
          </span>
          <div className="bg-neutral-100 mt-2 mb-4 border rounded-lg padding p-4 text-xl">
            Some freitext weil ich noch keine Prop dafür hatte
          </div>
          <div className="mb-8">
            <div className="date mb-2 flex items-center">
              <CalendarIcon className="mr-1" />{" "}
              <span className="font-bold mr-1">13.11.2023</span>vor 4 Monaten
            </div>
            <ImageGallery items={images} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalDetail;
