import { Regex } from "@/utils/regex";

export const numberRule = {
  required: true,
  pattern: Regex.numericWithDecimal,
  message: "This field must be a number.",
};

export const requiredRule = { required: true, message: `This field is required.` };

export const alphaNumericRule = {
  required: true,
  pattern: Regex.alphaNumeric,
  message: "Only alphanumeric characters are allowed.",
};

export const walletAddressRule = {
  required: true,
  pattern: Regex.walletAddressRegex,
  message: "Invalid wallet address.",
};
