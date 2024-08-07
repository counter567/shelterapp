import "./Ribbon.css";

type RibbonColor = "blue" | "red" | "yellow" | "green" | "purple";

interface RibbonProps {
  text: string;
  color?: RibbonColor;
  cssClass?: string;
}

const Ribbon = ({ text, color = "blue", cssClass = "" }: RibbonProps) => {
  return (
    <div className={`animal-card-ribbon z-10 relative flex justify-end ${cssClass}`}>
      <aside
        className={`font-bold tracking-wide ribbon text-white text-right ml-8 ${color}`}
      >
        {text}
      </aside>
    </div>
  );
};

export default Ribbon;
