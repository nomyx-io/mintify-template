
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
  placeHolder: string;
  defaultValue: string | number | boolean;
  value: string | number | boolean;
  rules?: rule[],
  gridSpan?: number;
  className?: string;
  disabled?: boolean;
  prefix?: string;
}

interface NftRecordDetailField {
  label: string;
  name: string;
}

type rule = any;

type TransferOnChange = (targetKeys: string[], direction: TransferDirection, moveKeys: string[]) => void;
type TransferOnSelectChange = (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => void;
type TransferOnScroll = (direction: TransferDirection, e: React.SyntheticEvent<HTMLUListElement>) => void;