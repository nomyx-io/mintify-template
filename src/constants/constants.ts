import { requiredRule, numberRule } from "./rules";

export enum Industries {
  CARBON_CREDIT = "carbon_credit",
  TOKENIZED_DEBT = "tokenized_debt",
  TRADE_FINANCE = "trade_finance",
}

export const industryOptions = [
  { label: "Carbon Credit", value: Industries.CARBON_CREDIT },
  { label: "Tokenized Debt", value: Industries.TOKENIZED_DEBT },
  { label: "Trade Finance", value: Industries.TRADE_FINANCE },
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
