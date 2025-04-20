import { Eye } from "iconsax-react";
import Image from "next/image";

import { formatPrice } from "./currencyFormater";

function formatTitle(label: string) {
  return label
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/\b\w/g, (c) => c.toUpperCase()); // Capitalize first letter of each word
}

export const projectColumns: any = (onProjectClick: (project: Project) => void) => [
  {
    title: "Title",
    align: "left",
    sorter: {
      compare: (a: Project, b: Project) => a.title.localeCompare(b.title),
      multiple: 1,
    },
    width: 300,
    render: (project: Project) => (
      <div className="flex items-center">
        <div className="flex justify-center items-center pr-4 border-r">
          <Eye className="text-xl cursor-pointer hover:text-blue-500" onClick={() => onProjectClick(project)} />
        </div>
        <div className="w-10 h-10 relative rounded overflow-hidden flex-shrink-0 ml-4">
          <Image src={project.logo?.url() || "/default-image.png"} alt={project.title} fill className="object-cover" />
        </div>
        <h2 className="ml-4 font-semibold">{project.title}</h2>
      </div>
    ),
  },
  {
    dataIndex: "description",
    title: formatTitle("description"),
    align: "left",
    width: 400,
    ellipsis: true,
  },
  {
    title: formatTitle("totalTokens"),
    dataIndex: "totalTokens",
    width: 150,
    sorter: (a: any, b: any) => a.totalTokens - b.totalTokens,
  },
  {
    title: formatTitle("totalValue"),
    dataIndex: "totalValue",
    width: 300,
    render: (totalValue: number) => formatPrice(totalValue, "USD"),
    sorter: (a: any, b: any) => a.totalValue - b.totalValue,
  },
];
