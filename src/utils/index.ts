import { toast } from "react-toastify";

const isAlphanumeric=(input: any)=> {
    return /^[a-zA-Z0-9]+$/.test(input);
}

const isAlphanumericAndSpace=(input: any)=> {
    return /^[a-zA-Z0-9 ]+$/.test(input);
}

const isEthereumAddress=(address: any)=> {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

const isNumeric=(input: any) => {
    return /^[0-9]+$/.test(input)
}

const isNumericWithM=(input: any) => {
    return /^[0-9]+m$/.test(input)
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

  const validateData = (data: any) => {
    if(!isAlphanumeric(data.nftTitle) || !maxChar(data.nftTitle,30)){
      toast.error('Invalid Nft Title.It must be alphanumeric and can contain max 30 characters.');
      return false;
    }
    if(!maxChar(data.description,256)){
      toast.error('Invalid description. It can contain max 256 characters ');
      return false;
    }
    if(!isAlphanumeric(data.loanId) || !maxChar(data.loanId,30)){
      toast.error('Invalid loan Id. It must be alphanumeric and can contain max 30 characters.');
      return false;
    }
    if(!isNumeric(data?.currentValue) || !maxChar(data?.currentValue,10)){
      toast.error('Invalid input in Current Value. It must be Numeric and can conatin maximum 10 characters.');
      return false;
    }
    if(!isNumeric(data.loanAmount) || !maxChar(data?.currentValue,9)){
      toast.error('Invalid input in Loan Origination Amount.It must be numeric and can contain max 10 characters.')
      return false
    }
    if(!isNumericWithM(data?.term) || !maxChar(data?.term,3)){
      toast.error('Invalid input in Term. It must be Numeric and can conatin max 3 characters followed by m ');
      return false;
    }
    if(!isNumeric(data?.ficoScore) || !maxChar(data?.ficoScore,3)){
      toast.error('Invalid input in Fico Score. It must be Numeric and can conatin max 3 characters ');
      return false;
    }
    if(!maxCharWithDecimal(data?.yields,2,3)){
      toast.error('Invalid input in Interest Rate. It must be Numeric and can conatin max 3 characters after decimal ');
      return false;
    }
    if(!maxCharWithDecimal(data.monthly,9,2)){
      toast.error('Invalid Monthly Payment.It must be numeric and can contain max 2 characters after decimal')
      return false
    }
    if(!maxCharWithDecimal(data.discount,2,2)){
      toast.error('Invalid Discount.It must be numeric and can contain max 2 characters after decimal')
      return false
    }
    if(!isNumeric(data?.location) || !maxChar(data?.location,3)){
      toast.error('Invalid input in Location. It must be Numeric and can conatin max 3 characters ');
      return false;
    }
    if(!maxCharWithDecimal(data.price,9,2)){
      toast.error('Invalid Pricing.It must be numeric and can contain max 2 characters after decimal')
      return false
    }
    if (!isEthereumAddress(data?.mintAddress)) {
      toast.error('Invalid Ethereum Wallet Address in Mint Address');
      return false;
    }

    return true;
  }

export {
    isNumeric,
    isNumericWithM,
    maxChar,
    isAlphanumeric,
    isAlphanumericAndSpace,
    isEthereumAddress,
    generateRandomString,
    validateData
}
