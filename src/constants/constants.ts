import { requiredRule, numberRule } from "./rules";

export enum Industries {
  CARBON_CREDIT = "carbon_credit",
  TOKENIZED_DEBT = "tokenized_debt",
  TRADE_FINANCE = "trade_finance",
}

export const industryOptions = [
  { label: "Carbon Credit", value: Industries.CARBON_CREDIT },
  { label: "Tokenized Debt", value: Industries.TOKENIZED_DEBT },
  { label: "Stock Pool", value: Industries.TRADE_FINANCE },
];

export const carbonCreditFields = [
  {
    label: "Existing Credits",
    name: "existingCredits",
    type: "text",
    placeHolder: "Enter Existing Carbon Credits Amount",
    rules: [requiredRule, numberRule],
  },
];

export const tokenizedDebtFields = [
  {
    label: "Debt Amount",
    name: "debtAmount",
    type: "text",
    placeHolder: "Enter Debt Amount",
    rules: [requiredRule, numberRule],
  },
];

export const tradeFinanceFields = [
  {
    label: "Trade Amount",
    name: "tradeAmount",
    type: "text",
    placeHolder: "Enter Trade Amount",
    rules: [requiredRule, numberRule],
  },
];

export const investmentTypeOptions = [
  { label: "Venture", value: "venture" },
  { label: "Private Equity", value: "private_equity" },
  { label: "Angel", value: "angel" },
  { label: "Seed", value: "seed" },
];

export const stageOptions = [
  { label: "Early", value: "early" },
  { label: "Growth", value: "growth" },
  { label: "Late", value: "late" },
  { label: "Pre-IPO", value: "pre_ipo" },
];

export const marketOptions = [
  { label: "US", value: "us" },
  { label: "EU", value: "eu" },
  { label: "Asia", value: "asia" },
  { label: "Global", value: "global" },
];

export const tradeFinanceStockInfoFields = [
  {
    label: "Type of Investment",
    name: "investmentType",
    type: "select",
    options: investmentTypeOptions,
    rules: [requiredRule],
    disabled: false,
    className: "",
  },
  {
    label: "Stage",
    name: "stage",
    type: "select",
    options: stageOptions,
    rules: [requiredRule],
    disabled: false,
    className: "",
  },
  {
    label: "Market",
    name: "market",
    type: "select",
    options: marketOptions,
    rules: [requiredRule],
    disabled: false,
    className: "",
  },
  {
    label: "Fund Size (In Millions)",
    name: "fundSize",
    type: "text",
    placeHolder: "Enter Fund Size",
    rules: [requiredRule, numberRule],
    prefix: "$",
    disabled: false,
    className: "",
  },
  {
    label: "Generation",
    name: "generation",
    type: "text",
    placeHolder: "Enter Generation",
    rules: [requiredRule],
    disabled: false,
    className: "",
  },
  {
    label: "Economics",
    name: "economics",
    type: "text",
    placeHolder: "Enter Economics",
    rules: [requiredRule],
    disabled: false,
    className: "",
  },
  {
    label: "Opening Date",
    name: "openingDate",
    type: "date",
    placeHolder: "Select Opening Date",
    rules: [requiredRule],
    disabled: false,
    className: "",
  },
  {
    label: "Closing Date",
    name: "closingDate",
    type: "date",
    placeHolder: "Select Closing Date",
    rules: [requiredRule],
    disabled: false,
    className: "",
  },
  {
    label: "Target Return (Gross)",
    name: "targetReturn",
    type: "text",
    placeHolder: "Enter Target Return",
    rules: [requiredRule],
    disabled: false,
    className: "",
  },
];

export const tradeFinanceDocumentationFields = [
  {
    label: "Sales Contract",
    name: "salesContract",
    type: "file",
    placeHolder: "Upload Sales Contract",
    rules: [requiredRule],
    disabled: false,
    className: "",
    options: undefined,
    prefix: "",
  },
  {
    label: "Bill of Lading",
    name: "billOfLading",
    type: "file",
    placeHolder: "Upload Bill of Lading",
    rules: [requiredRule],
    disabled: false,
    className: "",
    options: undefined,
    prefix: "",
  },
  {
    label: "Merchandise Insurance Certificate",
    name: "merchandiseInsurance",
    type: "file",
    placeHolder: "Upload Merchandise Insurance Certificate",
    rules: [requiredRule],
    disabled: false,
    className: "",
    options: undefined,
    prefix: "",
  },
  {
    label: "Purchase Order",
    name: "purchaseOrder",
    type: "file",
    placeHolder: "Upload Purchase Order",
    rules: [requiredRule],
    disabled: false,
    className: "",
    options: undefined,
    prefix: "",
  },
  {
    label: "Surveyor Certificate",
    name: "surveyorCertificate",
    type: "file",
    placeHolder: "Upload Surveyor Certificate",
    rules: [requiredRule],
    disabled: false,
    className: "",
    options: undefined,
    prefix: "",
  },
];
