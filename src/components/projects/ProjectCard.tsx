import { Card } from "antd";
import Image from "next/image";

interface ProjectCardProps {
  project: Project;
  onProjectClick: (project: Project) => void;
}

function DataRow({ children }: { children?: React.ReactNode }) {
  return <div className="flex flex-col sm:flex-row sm:gap-2">{children}</div>;
}

function DataKey({ children }: { children?: React.ReactNode }) {
  return <div className="flex shrink-0 items-center w-36 h-10">{children}</div>;
}

function DataValue({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex grow overflow-hidden items-center rounded h-10 pl-3 py-1 pr-2 bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark text-nomyx-text-light dark:text-nomyx-text-dark ${
        className || ""
      }`}
    >
      {children}
    </div>
  );
}

export default function ProjectCard({
  project,
  onProjectClick,
}: ProjectCardProps) {
  const themeStyle =
    "bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark border-nomyx-gray4-light dark:border-nomyx-gray4-dark text-nomyx-text-light dark:text-nomyx-text-dark";

  return (
    <Card className={themeStyle}>
      <div className="flex w-full h-32 relative">
        <Image
          src={project.coverImage?.url()}
          alt={project.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="gap-2 mt-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold">{project.title}</h2>
          <span
            className="text-nomyx-blue-light hover:!text-nomyx-main1-light cursor-pointer"
            onClick={() => onProjectClick(project)}
          >
            View Details
          </span>
        </div>
        <p className="text-sm line-clamp-2">{project.description}</p>
      </div>
      <div className="flex flex-col gap-1 mt-5">
        <DataRow>
          <DataKey>Total Tokens</DataKey>
          <DataValue>{project.totalTokens}</DataValue>
        </DataRow>
        <DataRow>
          <DataKey>Total Token Value</DataKey>
          <DataValue>
            $ {Intl.NumberFormat("en-US").format(project.totalValue)}
          </DataValue>
        </DataRow>
      </div>
    </Card>
  );
}
