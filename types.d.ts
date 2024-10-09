interface Window {
  ethereum?: import('ethers').providers.ExternalProvider;
}

interface ClaimTopic {
  key: string;
  displayName: string;
  id: string;
  topic: string;
}

interface NftDetailsInputFieldGroup {
  name: string;
  fields: NftDetailsInputField[];
}

interface NftDetailsInputField {
  label: string;
  name: string;
  dataType: string;
  placeHolder?: string;
  defaultValue?: string | number | boolean;
  value?: string | number | boolean;
  rules?: import('antd').FormRule[];
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

interface NftRecordDetailFieldGroup {
  name: string;
  fields: NftRecordDetailField[];
}

interface NftRecordDetailField {
  label: string;
  name: string;
}

type TransferOnChange = (targetKeys: string[], direction: TransferDirection, moveKeys: string[]) => void;
type TransferOnSelectChange = (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => void;
type TransferOnScroll = (direction: TransferDirection, e: React.SyntheticEvent<HTMLUListElement>) => void;

interface PortfolioPerformance {
  labels: string[],
  initialValues: number[],
  assetValues: number[],
  accruedValues: number[],
  yieldClaimedTill: number[]
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

interface KPIs {
  totalAssets: number | undefined;
  totalDeliquent: number;
  totalAccruedValue: number;
  totalAssetValue: number;
  totalInitialValue: number;
  totalYieldClaimed: number;
}

interface Events {
  [key: string]: {
    data: KronosEvent[]
  }
}

interface KronosEvent {
  name: string;
  description?: string;
  value: number;
}

interface Project {
  id: string;
  title: string;
  description: string;
  registryURL: string;
  logo: Parse.File;
  coverImage: Parse.File;
  totalTokens: number;
  totalCarbon: number;
}
