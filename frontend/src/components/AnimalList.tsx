import "./AnimalList.css";

const first = {
  name: "Karl Heinz",
  kind: "Europäisch Kurzhaar",
  type: "Katze",
  gender: "female",
  age: "14 Jahre 7 Monate",
  since: "seit 10.03.2024",
  need: "Notfall",
  found: true,
  image:
    "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8Mnx8fGVufDB8fHx8fA%3D%3D",
};

const animals = [
  first,
  {
    ...first,
    image:
      "https://images.unsplash.com/photo-1534351450181-ea9f78427fe8?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    ...first,
    image:
      "https://images.unsplash.com/photo-1608096299210-db7e38487075?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8N3x8fGVufDB8fHx8fA%3D%3D",
  },
  {
    ...first,
    image:
      "https://images.unsplash.com/photo-1617129724623-84f1d2fd78f3?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8OHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    ...first,
    image:
      "https://images.unsplash.com/photo-1534351450181-ea9f78427fe8?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    ...first,
    image:
      "https://images.unsplash.com/photo-1608096299210-db7e38487075?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8N3x8fGVufDB8fHx8fA%3D%3D",
  },
  {
    ...first,
    image:
      "https://images.unsplash.com/photo-1617129724623-84f1d2fd78f3?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8OHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    ...first,
    image:
      "https://images.unsplash.com/photo-1534351450181-ea9f78427fe8?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    ...first,
    image:
      "https://images.unsplash.com/photo-1608096299210-db7e38487075?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8N3x8fGVufDB8fHx8fA%3D%3D",
  },
  {
    ...first,
    image:
      "https://images.unsplash.com/photo-1617129724623-84f1d2fd78f3?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8OHx8fGVufDB8fHx8fA%3D%3D",
  },
];

export default function AnimalList() {
  const randomClass = () => {
    const classes = ["card-orange", "card-red", "card-green"];
    return classes[Math.floor(Math.random() * classes.length)];
  };

  const randomBoolean = () => {
    return Math.random() < 0.25;
  };

  return (
    <div>
      <ul className="grid gap-8 animals">
        {animals.map(
          ({ name, kind, image, gender, type, age, since, need }) => (
            <li
              key={name}
              className={`p-5 border shadow w-72 rounded hover:shadow-xl cursor-pointer ${randomClass()}`}
            >
              <div className="flex items-center flex-col ">
                <div className="w-40 h-40 bg-gray-100 rounded-full relative flex flex-col items-center">
                  <img
                    className="w-32 h-32 object-cover rounded-full absolute top-4 left-4"
                    src={image}
                    alt={name}
                  />
                </div>
                {randomBoolean() && (
                  <span
                    style={{ backgroundColor: "#f0ad4e" }}
                    className=" text-white py-1 px-6 rounded relative bottom-8 -mb-8"
                  >
                    Fundtier
                  </span>
                )}
                <h1 className="text-center font-bold uppercase">{name}</h1>
                <span className="text-center text-gray-500 mb-2">{kind}</span>
                <hr className="w-11/12 mb-2" />
                <span className="text-center text-gray-500">
                  {gender} {type}
                </span>
                <span className="text-center font-bold text-gray-500">
                  {age}
                </span>
              </div>
              <div className="card-bottom flex items-center flex-col rounded-b mt-4 -m-5">
                <h3 className="text-center font-extrabold text-white">
                  {need}
                </h3>
                <span className="text-center text-white">{since}</span>
              </div>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
