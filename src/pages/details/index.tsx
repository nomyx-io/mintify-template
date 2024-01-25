"use client"
import React, { useEffect, useState } from 'react'
import CreateNftDetails from '@/components/CreateNftDetails'
import PreviewNftDetails from '@/components/PreviewNftDetails'
import { getDashboardLayout } from '@/Layouts'
import { toast } from 'react-toastify'
import { TransferDirection } from 'antd/es/transfer'
import {Regex} from '@/utils'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import {LenderLabAPI} from "@/services/api";
import { useWalletAddress } from '@/context/WalletAddressContext';

export default function Details({ service }: any) {
  const {isConnected} = useAccount();
  const router = useRouter();
  const { walletAddress } = useWalletAddress();
  const api = LenderLabAPI();
  const [preview, setPreview] = useState(false);
  const [nftData, setNftData] = useState();
  const [claimTopics, setClaimTopics] = useState<any[]>([]);
  const [nftTitle, setNftTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loanId, setLoanId] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [term, setTerm] = useState("");
  const [ficoScore, setFicoScore] = useState("");
  const [yields, setYields] = useState("");
  const [monthly, setMonthly] = useState("");
  const [discount, setDiscount] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [mintAddress, setMintAddress] = useState(walletAddress);
  const [currentValue, setCurrentValue] = useState("");
  const [originationDate, setOriginationDate] = useState("");
  const [frozen, setFrozen] = useState(false);
  const [defaultTokenImageUrl, setDefaultTokenImageUrl] = useState("");
  
  const handleInputValues = (e: any) => {
    const name = e.target.name;
    const value = e.target.value;
    switch (name) {
      case "nftTitle":
        setNftTitle(value)
        break;
      case "description":
        setDescription(value)
        break;
      case "loanId":
        setLoanId(value)
        break;
      case "loanAmount":
        setLoanAmount(value)
        break;
      case "term":
        setTerm(value)
        break;
      case "fico":
        setFicoScore(value)
        break;
      case "yields":
        setYields(value)
        break;
      case "monthly":
        setMonthly(value)
        break;
      case "discount":
        setDiscount(value)
        break;
      case "location":
        setLocation(value)
        break;
      case "price":
        setPrice(value)
        break;
      case "mintAddress":
        setMintAddress(value)
        break;
      case "currentValue":
        setCurrentValue(value)
        break;
      case "originationDate":
        setOriginationDate(value)
        break;

      default:
        break;
    }
  }

    // Update the mintAddress state when the walletAddress context value changes
    useEffect(() => {
        setMintAddress(walletAddress);
    }, [walletAddress]);

  interface RecordType {
    key: string;
    title: string;
    description: string;
  }

  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const onChange = (nextTargetKeys: string[], direction: TransferDirection, moveKeys: string[]) => {
    setTargetKeys(nextTargetKeys);
  };

  const onSelectChange = (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => {
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  const onScroll = (direction: TransferDirection, e: React.SyntheticEvent<HTMLUListElement>) => {
    console.log('direction:', direction);
    console.log('target:', e.target);
  };

  const handlePreviewFunc = () => {
    const freeze = JSON.stringify(frozen);
    handlePreview({ nftTitle, description, loanId, loanAmount, term, ficoScore, yields, monthly, discount, location, price, mintAddress, targetKeys, defaultTokenImageUrl, originationDate, currentValue, freeze});
  }

  const requiredRule = {required: true, message: `This field is required.` };
  const alphaNumericRule = {pattern:Regex.alphaNumeric, message: `This field must be alphanumeric.`};
  const numericRule = {pattern:Regex.numeric, message: `This field must be numeric only.`};

  const fields = [
    {label: 'NFT Title', name: 'nftTitle', dataType: 'text', placeHolder: 'Enter Loan ID.Total Amount(Yield)', defaultValue: nftTitle, value: nftTitle, rules:[requiredRule, alphaNumericRule, {max: 30}] },
    {label: 'Description', name: 'description', dataType: 'text', placeHolder: 'Add a description for the NFT', defaultValue: description, value: description, rules:[{...requiredRule, max: 256}] },
    { 
      value: [
        { label: '', name: 'loanId', dataType: 'text', placeHolder: 'Enter Loan ID', defaultValue: loanId, value: loanId, rules:[requiredRule, alphaNumericRule] },
        { label: '', name: 'currentValue', dataType: 'text', placeHolder: 'Enter Current Value', defaultValue: currentValue, value: currentValue, prefix: '$', rules:[requiredRule, {pattern:Regex.maxCharWithDecimal(10, 2), message:"Please enter a value with up to 10 digits and 2 decimal places."}] },
      ]
    },
    { 
      value: [
        { label: '', name: 'originationDate', dataType: 'date', placeHolder: 'Enter Loan Origination Date', defaultValue: originationDate, value: originationDate, rules:[requiredRule] },
        { label: '', name: 'loanAmount', dataType: 'text', placeHolder: 'Enter Loan Origination Amount', defaultValue: loanAmount, value: loanAmount, prefix: '$', rules:[requiredRule, {pattern:Regex.maxCharWithDecimal(9, 2), message:"Please enter a value with up to 9 digits and 2 decimal places."}] },
      ]
    },
    {
      value: [
        { label: '', name: 'term', dataType: 'text', placeHolder: 'Enter Term', defaultValue: term, value: term, prefix: 'M', rules:[requiredRule, numericRule, {max: 3}] },
        { label: '', name: 'fico', dataType: 'text', placeHolder: 'Enter FICO Score', defaultValue: ficoScore, value: ficoScore, rules:[requiredRule, numericRule, {max: 3}] },
      ]
    },
    {
      value: [
        { label: '', name: 'yields', dataType: 'text', placeHolder: 'Enter Interest Rate', defaultValue: yields, value: yields, prefix: '%', rules:[requiredRule, {pattern:Regex.maxCharWithDecimal(2, 3), message:"Please enter a value with up to 2 digits and 3 decimal places."}] },
        { label: '', name: 'monthly', dataType: 'text', placeHolder: 'Enter Monthly Payment', defaultValue: monthly, value: monthly, prefix: '$', rules:[requiredRule, {pattern:Regex.maxCharWithDecimal(9, 2), message:"Please enter a value with up to 9 digits and 2 decimal places."}] },
      ]
    },
    {
      value: [
        { label: '', name: 'discount', dataType: 'text', placeHolder: 'Enter Discount Coupan (%age off)', defaultValue: discount, value: discount, prefix: '%', rules:[requiredRule, {pattern:Regex.maxCharWithDecimal(2, 2), message:"Please enter a value with up to 2 digits and 2 decimal places."}] },
        { label: '', name: 'location', dataType: 'text', placeHolder: 'Location of Issuance (first three letters of zip)', defaultValue: location, value: location, rules:[requiredRule, numericRule, {max: 3}] },
      ]
    },
      { label: 'Mint to', name: 'mintAddress', dataType: 'text', placeHolder: 'Enter Wallet Address', defaultValue: mintAddress, value: mintAddress, rules:[{required: true, pattern:Regex.ethereumAddress, message: "This field must be an ethereum address."}] },
      { label: 'Pricing', name: 'price', dataType: 'text', placeHolder: 'Price', defaultValue: price, value: price, prefix: '$', rules:[requiredRule, {pattern:Regex.maxCharWithDecimal(9, 2), message:"Please enter a value with up to 9 digits and 2 decimal places."}] }
  ];

  useEffect(() => {
    getClaimTopics();
    getSettings();
  }, [service])

  useEffect(() => {
    !isConnected && router.push('/login')
  }, [])

  const getClaimTopics = async () => {
    const claims =  service && await service.getClaimTopics()
    let data: any = []
    if (claims) {
      claims.forEach((item: any) => {
        data.push({ key: parseInt(item.attributes.topic), displayName: item.attributes.displayName, id: item.id, topic: item.attributes.topic })
      });
      setClaimTopics(data);
    }
  }

    const getSettings = async () => {
      if(api && api.getSettings){
          const settings:any =  await api.getSettings()
          setDefaultTokenImageUrl(settings.defaultTokenImage?.url()||"");
          setMintAddress(settings.walletAddress);
      }
    }

  const handlePreview = (data: any) => {
    setNftData(data);
    setPreview(true);
  }
  const handleBack = () => {
    setPreview(false)
  }

  const handleFreeze = () => {
    setFrozen(!frozen)
  }

  const metadata = [
    {
        key: "nftTitle",
        attributeType: 1,
        value: nftTitle,
    },
    {
        key: "description",
        attributeType: 1,
        value: description,
    },
    {
        key: "loanId",
        attributeType: 1,
        value: loanId,
    },
    {
        key: "currentValue",
        attributeType: 1,
        value: currentValue,
    },
    {
        key: "loanAmount",
        attributeType: 1,
        value: loanAmount,
    },
    {
        key: "originationDate",
        attributeType: 1,
        value: originationDate,
    },
    {
        key: "term",
        attributeType: 1,
        value: term,
    },

    {
        key: "ficoScore",
        attributeType: 1,
        value: ficoScore,
    },
    {
        key: "monthly",
        attributeType: 1,
        value: monthly,
    },
    {
        key: "discount",
        attributeType: 1,
        value: discount,
    },
    {
        key: "location",
        attributeType: 1,
        value: location,
    },
    {
        key: "price",
        attributeType: 1,
        value: price,
    },
    {
        key: "image",
        attributeType: 1,
        value: defaultTokenImageUrl,
    },
    {
        key: "yields",
        attributeType: 1,
        value: yields,
    },
    {
        key: "claimTopics",
        attributeType: 0,
        value: targetKeys ? targetKeys.join(',') : targetKeys,
    },
    {
        key: "mintAddress",
        attributeType: 1,
        value: mintAddress,
    },
    {
        key: "frozen",
        attributeType: 1,
        value: frozen
    }
];
const handleMint = async () => {
    toast.promise(
        async () => {
            try{
                await service.llmint(metadata, defaultTokenImageUrl).then(()=>{
                    setNftTitle("")
                    setDescription("")
                    setLoanId("")
                    setLoanAmount("")
                    setTerm("")
                    setFicoScore("")
                    setYields("")
                    setMonthly("")
                    setDiscount("")
                    setLocation("")
                    setPrice("")
                    setOriginationDate("")
                    setCurrentValue("")
                    setTargetKeys([])
                    setPreview(false)
                });
            }catch(e){
                console.log(e);
                throw e;
            }

        },
    {
        pending: 'Minting Nft...',
        success: 'Successfully minted Nft to ' + mintAddress,
        error: {
            render({data}: any){
              return <div>{data?.reason || 'An error occurred while minting Nft'}</div>
            }
          }
    });
}
  
  return (
    <>

      {
        preview ?
          <PreviewNftDetails 
            data={nftData} 
            handleBack={handleBack}
            handleMint={handleMint}
          />
          :
          <CreateNftDetails 
            claimTopics={claimTopics} 
            fields={fields}
            frozen={frozen}
            image={defaultTokenImageUrl}
            targetKeys={targetKeys}
            selectedKeys={selectedKeys}
            handleInputValues={handleInputValues}
            handlePreviewFunc={handlePreviewFunc}
            onChange={onChange}
            onSelectChange={onSelectChange}
            onScroll={onScroll}
            handleFreeze={handleFreeze}
          />
      }

    </>
  )
}
Details.getLayout = getDashboardLayout;
