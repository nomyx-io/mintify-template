import { Eye } from "iconsax-react";
import Image from "next/image";

import { formatPrice } from "./currencyFormater";

export const projectColumns: any = (onProjectClick: (project: Project) => void) => [
  {
    title: "Title",
    align: "left",
    sorter: {
      compare: (a: Project, b: Project) => a.title.localeCompare(b.title),
      multiple: 1,
    },
    width: 300,
    render: (project: Project) => {
      return (
        <div className="flex items-center">
          <div className="flex justify-center items-center pr-4 border-r">
            {/* Eye Icon triggers onProjectClick */}
            <Eye className="text-xl cursor-pointer hover:text-blue-500" onClick={() => onProjectClick(project)} />
          </div>
          <div className="w-10 h-10 relative rounded overflow-hidden flex-shrink-0 ml-4">
            <Image src={project.logo?.url() || "/default-image.png"} alt={project.title} fill className="object-cover" />
          </div>
          <h2 className="ml-4 font-semibold">{project.title}</h2>
        </div>
      );
    },
  },
  {
    dataIndex: "description",
    title: "Description",
    align: "left",
    width: 400,
    ellipsis: true,
    // No sorter for Description
  },
  {
    title: "Total Tokens",
    dataIndex: "totalTokens",
    width: 150,
    sorter: (a: any, b: any) => a.totalTokens - b.totalTokens,
  },
  {
    title: "Total Token Value",
    dataIndex: "totalValue",
    width: 300,
    render: (totalValue: number) => {
      formatPrice(totalValue, "USD");
    },
    sorter: (a: any, b: any) => a.totalValue - b.totalValue,
  },
];
