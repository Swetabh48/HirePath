"use client"; // <-- MUST be the very first line

import Image from "next/image";
import { cn, getTechLogos } from "@/lib/utils";
import { useEffect, useState } from "react";

type TechIconProps = {
  techStack: string[];
};

const DisplayTechIcons = ({ techStack }: TechIconProps) => {
  const [techIcons, setTechIcons] = useState<{ tech: string; url: string }[]>([]);

  useEffect(() => {
    const loadIcons = async () => {
      const icons = await getTechLogos(techStack);
      setTechIcons(icons);
    };
    loadIcons();
  }, [techStack]);

  if (!techIcons.length) return <div className="flex gap-2">Loading...</div>;

  return (
    <div className="flex flex-row">
      {techIcons.slice(0, 3).map(({ tech, url }, index) => (
        <div
          key={tech + index}
          className={cn(
            "relative group bg-dark-300 rounded-full p-2 flex items-center justify-center",
            index >= 1 && "-ml-3"
          )}
        >
          <span className="tech-tooltip">{tech}</span>
          <Image
            src={url}
            alt={tech}
            width={20}
            height={20}
            className="w-5 h-5"
            onError={() => {
              setTechIcons(prev =>
                prev.map(icon =>
                  icon.tech === tech ? { ...icon, url: "/tech.svg" } : icon
                )
              );
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default DisplayTechIcons;
