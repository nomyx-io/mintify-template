const Regex = {
  alphaNumeric: /^[a-zA-Z0-9]+$/,
  alphaNumericAndSpace: /^[a-zA-Z0-9 ]+$/,
  ethereumAddress: /^0x[a-fA-F0-9]{40}$/,
  numeric: /^[0-9]+$/,
  maxChar: (char: number) => new RegExp(`^.{1,${char}}$`),
  maxCharWithDecimal: (char: number, dec: number) => new RegExp(`^\\d{1,${char}}(\\.\\d{1,${dec}})?$`)
};

const isAlphanumeric=(input: any)=> {
    return Regex.alphaNumeric.test(input);
}

const isAlphanumericAndSpace=(input: any)=> {
    return Regex.alphaNumericAndSpace.test(input);
}

const isEthereumAddress=(address: any)=> {
    return Regex.ethereumAddress.test(address);
}

const isNumeric=(input: any) => {
    return Regex.numeric.test(input);
}

const maxChar = (input: any, char: number) => {
    const regex = new RegExp(`^.{1,${char}}$`)
    return regex.test(input)
}

const maxCharWithDecimal = (input: any, char: number, dec: number) => {
    const regex = new RegExp(`^\\d{1,${char}}(\\.\\d{1,${dec}})?$`)
    return regex.test(input)
}

const generateRandomString=(length: number)=> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
    return result;
  }

/**
 * calculates the monthly payment for the specified principal amount, loan term, and interest rate. This should be used
 * for estimaiton purposes only, and does not reflect the actual monthly payment amount.
 * @param principalAmount
 * @param loanTerm
 * @param loanInterestRate
 */
const calculateMonthlyLoanPayment = (principalAmount: number, loanTermInMonths: number, loanInterestRate: number): number => {
    // Convert annual interest rate to monthly rate
    const monthlyInterestRate: number = loanInterestRate / 12 / 100;

    // Convert loan term from years to months
    const numberOfPayments: number = loanTermInMonths;

    // Calculate monthly payment using the amortization formula
    const monthlyPayment: number =
        (principalAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
        (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

    return monthlyPayment;
}

export {
    isNumeric,
    maxChar,
    isAlphanumeric,
    isAlphanumericAndSpace,
    isEthereumAddress,
    generateRandomString,
    calculateMonthlyLoanPayment,
    Regex
}
