interface Window {
  ethereum?: import("ethers").providers.ExternalProvider;
}

interface Metadata {
  key: string;
  attributeType: number;
  value: string;
}

interface ClaimTopic {
  key: string;
  displayName: string;
  id: string;
  topic: string;
}

interface NftDetailsInputField {
  id?: string;
  label: string;
  name: string;
  type: string;
  placeHolder?: string;
  defaultValue?: string | number | boolean;
  value?: string | number | boolean;
  rules?: import("antd").FormRule[];
  className?: string;
  disabled?: boolean;
  prefix?: string;
  onSearch?: (value: string) => void;
  options?: { label: string; value: string }[];
}

interface DataSource {
  id: string;
  createdAt: string;
  active?: boolean;
}

interface TableData {
  headerImage: ReactElement | string;
  label: string;
  tableData: DataSource[];
  columns: TableColumnType<DataSource>[];
}

type TransferOnChange = (targetKeys: string[], direction: TransferDirection, moveKeys: string[]) => void;
type TransferOnSelectChange = (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => void;
type TransferOnScroll = (direction: TransferDirection, e: React.SyntheticEvent<HTMLUListElement>) => void;

interface GraphValues {
  labels: string[];
  values: number[];
}

interface MintedToken {
  id: string;
  _createdAt: string;
  _amount: string;
  _originationDate: string;
  _currentValue: string;
  _loanId: string;
  _tokenId: string;
}

interface Events {
  [key: string]: {
    data: TokenEvent[];
  };
}

interface TokenEvent {
  name: string;
  description?: string;
  value: number;
}

interface Project {
  id: string;
  title: string;
  description: string;
  logo: Parse.File;
  coverImage: Parse.File;
  totalTokens: number;
  totalValue: number;
  createdAt: Date;
  industryTemplate?: string;
  tradeDealId?: number;
  projectInfo: string;
  totalDepositAmount?: number;
  isWithdrawn?: boolean;
}

interface ProjectSaveData {
  title: string;
  description: string;
  logo: string;
  coverImage: string;
}
