import { PropsWithChildren } from "react";

export interface SectionListProps extends PropsWithChildren {
  heading: string;
  values?: string[];
  className?: string;
}

const SectionList = ({
  heading,
  values,
  className,
  children,
}: SectionListProps) => {
  const hasValues = values !== undefined && values.length > 0;
  if (hasValues)
    return (
      <section className={className ?? ""}>
        <h2 className="text-xl font-bold mb-2">{heading}</h2>
        <ul>
          {values.map((value) => (
            <li key={value} className="flex items-center">
              {children} {value}
            </li>
          ))}
        </ul>
      </section>
    );
  else return null;
};

export default SectionList;
