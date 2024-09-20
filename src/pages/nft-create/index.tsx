"use client";
import React, { use, useEffect, useState } from "react";
import CreateNftDetails from "@/components/CreateNftDetails";
import NftRecordDetail from "../../components/NftRecordDetail";
import { getDashboardLayout } from "@/Layouts";
import { toast } from "react-toastify";
import { TransferDirection } from "antd/es/transfer";
import { Regex } from "@/utils";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { KronosService } from "@/services/KronosService";
import { useWalletAddress } from "@/context/WalletAddressContext";
import { calculateMonthlyLoanPayment } from "@/utils";
import { Form } from "antd";

export default function Details({ service }: any) {
  const { isConnected } = useAccount();
  const router = useRouter();
  const { walletAddress } = useWalletAddress();
  const api = KronosService();
  const [preview, setPreview] = useState(false);
  const [nftData, setNftData] = useState();
  const [claimTopics, setClaimTopics] = useState<any[]>([]);

  // form fields
  const [nftTitle, setNftTitle] = useState("");
  const [description, setDescription] = useState("");
  const [registerId, setRegisterId] = useState("");
  const [trancheCutoff, setTrancheCutoff] = useState("");
  const [carbonAmount, setCarbonAmount] = useState("");
  const [mintAddress, setMintAddress] = useState(walletAddress);
  const [frozen, setFrozen] = useState(false);
  
  const [issuanceDate, setIssuanceDate] = useState("");
  const [issuingEntity, setIssuingEntity] = useState("");
  const [projectName, setProjectName] = useState("");
  const [auditor, setAuditor] = useState("");
  const [useLocation, setUseLocation] = useState(false);
  const [location, setLocation] = useState("");

  const [price, setPrice] = useState("");
  const [useDiscount, setUseDiscount] = useState(false);
  const [discount, setDiscount] = useState("");
  const [finalPrice, setFinalPrice] = useState("");

  const [defaultTokenImageUrl, setDefaultTokenImageUrl] = useState("");

  const [form] = Form.useForm();

  const handleInputValues = (e: any, inputName: string) => {
    // Set state for all fields normally
    const name = inputName || e.target.name;
    const value = e.target.value;
    switch (name) {
      case "nftTitle":
        setNftTitle(value);
        break;
      case "description":
        setDescription(value);
        break;
      case "registerId":
        setRegisterId(value);
        break;
      case "trancheCutoff":
        setTrancheCutoff(value);
        break;
      case "carbonAmount":
        setCarbonAmount(value);
        break;
      case "mintAddress":
        setMintAddress(value);
        break;
      case "freeze":
        setFrozen(!frozen);
        break;
      
      case "issuanceDate":
        setIssuanceDate(value);
        break;
      case "issuingEntity":
        setIssuingEntity(value);
        break;
      case "projectName":
        setProjectName(value);
        break;
      case "auditor":
        setAuditor(value);
        break;
      case "useLocation":
        setUseLocation(!useLocation);
        break;
      case "location":
        setLocation(value);
        break;

      case "price":
        setPrice(value);
        break;
      case "useDiscount":
        setUseDiscount(!useDiscount);
        break;
      case "discount":
        setDiscount(value);
        break;

      default:
        break;

      }
  };

  // Update the mintAddress state when the walletAddress context value changes
  useEffect(() => {
    setMintAddress(walletAddress);
  }, [walletAddress]);

  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const onChange = (
    nextTargetKeys: string[],
    direction: TransferDirection,
    moveKeys: string[]
  ) => {
    setTargetKeys(nextTargetKeys);
  };

  const onSelectChange = (
    sourceSelectedKeys: string[],
    targetSelectedKeys: string[]
  ) => {
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  const onScroll = (
    direction: TransferDirection,
    e: React.SyntheticEvent<HTMLUListElement>
  ) => {
    console.log("direction:", direction);
    console.log("target:", e.target);
  };

  const handlePreviewFunc = () => {
    const freeze = JSON.stringify(frozen);
    handlePreview({
      nftTitle,
      description,
      registerId,
      trancheCutoff,
      carbonAmount,
      mintAddress,
      freeze,
      issuanceDate,
      issuingEntity,
      projectName,
      auditor,      
      location,
      price,
      discount,
      targetKeys,
      defaultTokenImageUrl,
    });
  };

  const requiredRule = { required: true, message: `This field is required.` };
  const alphaNumericRule = {
    pattern: Regex.alphaNumeric,
    message: `This field must be alphanumeric.`,
  };
  const numericRule = {
    pattern: Regex.numeric,
    message: `This field must be numeric only.`,
  };

  const fieldGroups = [
    {
      name: '',
      fields: [
        {
          label: 'NFT Title',
          name: 'nftTitle',
          dataType: 'text',
          placeHolder: 'Enter Loan ID.Total Amount(Yield)',
          defaultValue: nftTitle,
          value: nftTitle,
          rules: [requiredRule, alphaNumericRule, { max: 30 }],
          gridSpan: 2,
        },
        {
          label: 'Description',
          name: 'description',
          dataType: 'text',
          placeHolder: 'Add a description for the NFT',
          defaultValue: description,
          value: description,
          rules: [{ ...requiredRule, max: 256 }],
          gridSpan: 2,
        },
        {
          label: 'Registry ID',
          name: 'registerId',
          dataType: 'text',
          placeHolder: 'Enter Registry ID',
          defaultValue: registerId,
          value: registerId,
          rules: [requiredRule, alphaNumericRule],
        },
        {
          label: 'Tranche Cutoff',
          name: 'trancheCutoff',
          dataType: 'text',
          placeHolder: 'Enter Tranche Cutoff',
          defaultValue: trancheCutoff,
          value: trancheCutoff,
          rules: [requiredRule],
        },
        {
          label: 'Carbon Amount',
          name: 'carbonAmount',
          dataType: 'text',
          placeHolder: 'Enter Total Carbon Issued Amount',
          defaultValue: carbonAmount,
          value: carbonAmount,
          prefix: '$',
          rules: [
            requiredRule,
            {
              pattern: Regex.maxCharWithDecimal(9, 2),
              message:
                'Please enter a value with up to 9 digits and 2 decimal places.',
            },
          ],
        },
        {
          label: 'Mint to',
          name: 'mintAddress',
          dataType: 'text',
          placeHolder: 'Enter Wallet Address',
          defaultValue: mintAddress,
          value: mintAddress,
          rules: [
            {
              required: true,
              pattern: Regex.ethereumAddress,
              message: 'This field must be an ethereum address.',
            },
          ],
          gridSpan: 2,
        },
        {
          label: 'Freeze',
          name: 'freeze',
          dataType: 'checkbox',
          placeHolder: 'Freeze',
          defaultValue: frozen,
          value: frozen,
          rules: [requiredRule],
          className: 'col-span-2',
        },
      ],
    },
    {
      name: 'Issuance Information',
      fields: [
        {
          label: 'Issuance Date',
          name: 'issuanceDate',
          dataType: 'date',
          placeHolder: 'mm/dd/yyyy',
          defaultValue: issuanceDate,
          value: issuanceDate,
          rules: [requiredRule],
        },
        {
          label: 'Issuing Entity',
          name: 'issuingEntity',
          dataType: 'text',
          placeHolder: 'Enter Issuing Entity',
          defaultValue: issuingEntity,
          value: issuingEntity,
          rules: [requiredRule],
        },
        {
          label: 'Project/Site Name',
          name: 'projectName',
          dataType: 'text',
          placeHolder: 'Enter Project/Site Name',
          defaultValue: projectName,
          value: projectName,
          rules: [requiredRule],
        },
        {
          label: 'Auditor',
          name: 'auditor',
          dataType: 'text',
          placeHolder: 'Enter Auditor',
          defaultValue: auditor,
          value: auditor,
          rules: [requiredRule],
        },
        {
          label: 'Use Location of Issuance',
          name: 'useLocation',
          dataType: 'checkbox',
          placeHolder: 'Use Location',
          defaultValue: useLocation,
          value: useLocation,
          className: 'col-span-2',
        },
        {
          label: 'Location of Issuance',
          name: 'location',
          dataType: 'text',
          placeHolder: 'Location of Issuance (first three letters of zip)',
          defaultValue: location,
          value: location,
          rules: useLocation ? [requiredRule, numericRule, { max: 3 }] : [],
          className: `${useLocation ? '' : 'hidden'}`,
        },
      ],
    },
    {
      name: 'Pricing Information',
      fields: [
        {
          label: 'Price',
          name: 'price',
          dataType: 'text',
          placeHolder: 'Price',
          defaultValue: price,
          value: price,
          prefix: '$',
          rules: [
            requiredRule,
            {
              pattern: Regex.maxCharWithDecimal(9, 2),
              message:
                'Please enter a value with up to 9 digits and 2 decimal places.',
            },
          ],
          gridSpan: 2,
        },
        {
          label: 'Use Discount',
          name: 'useDiscount',
          dataType: 'checkbox',
          placeHolder: 'Use Discount',
          defaultValue: useDiscount,
          value: useDiscount,
          className: 'col-span-2',
        },
        {
          label: 'Discount',
          name: 'discount',
          dataType: 'text',
          placeHolder: 'Enter Percent Discount',
          defaultValue: discount,
          value: discount,
          prefix: '%',
          rules: [
            {
              pattern: Regex.maxCharWithDecimal(2, 2),
              message:
                'Please enter a value with up to 2 digits and 2 decimal places.',
            },
          ],
          className: `${useDiscount ? '' : 'hidden'}`,
        },
        {
          label: 'Final Price',
          name: 'finalPrice',
          dataType: 'text',
          placeHolder: 'Final Price',
          defaultValue: finalPrice,
          value: finalPrice,
          prefix: '$',
          rules: useDiscount ? [
            requiredRule,
            {
              pattern: Regex.maxCharWithDecimal(9, 2),
              message:
                'Please enter a value with up to 9 digits and 2 decimal places.',
            },
          ] : [],
          className: `${useDiscount ? '' : 'hidden'}`,
          disabled: true,
        },
      ],
    },
  ];

  useEffect(() => {
    getClaimTopics();
    getSettings();
  }, [service]);

  useEffect(() => {
    !isConnected && router.push("/login");
  }, []);

  useEffect(() => {
    console.log('price:', price);
    const finalDiscount = useDiscount ? Number(discount) : 0;
    const finalPrice = Number(price) - (Number(price) * Number(finalDiscount)) / 100;
    setFinalPrice(`${finalPrice}`);
    form.setFieldValue('finalPrice', finalPrice);
    console.log('finalPrice:', finalPrice);
  }, [price, discount, useDiscount, form]);

  const getClaimTopics = async () => {
    const claims = service && (await service.getClaimTopics());
    let data: any = [];
    if (claims) {
      claims.forEach((item: any) => {
        data.push({
          key: parseInt(item.attributes.topic),
          displayName: item.attributes.displayName,
          id: item.id,
          topic: item.attributes.topic,
        });
      });
      setClaimTopics(data);
    }
  };

  const getSettings = async () => {
    if (api && api.getSettings) {
      const settings: any = await api.getSettings();
      setDefaultTokenImageUrl(settings.defaultTokenImage?.url() || "");
      setMintAddress(settings.walletAddress);
    }
  };

  const handlePreview = (data: any) => {
    setNftData(data);
    setPreview(true);
  };
  
  const handleBack = () => {
    setPreview(false);
  };

  const metadata = [
    {
      key: 'nftTitle',
      attributeType: 1,
      value: nftTitle,
    },
    {
      key: 'description',
      attributeType: 1,
      value: description,
    },
    {
      key: 'registerId',
      attributeType: 1,
      value: registerId,
    },
    {
      key: 'trancheCutoff',
      attributeType: 1,
      value: trancheCutoff,
    },
    {
      key: 'carbonAmount',
      attributeType: 1,
      value: carbonAmount,
    },
    {
      key: 'mintAddress',
      attributeType: 1,
      value: mintAddress,
    },
    {
      key: 'frozen',
      attributeType: 1,
      value: frozen,
    },
    {
      key: 'issuanceDate',
      attributeType: 1,
      value: issuanceDate,
    },
    {
      key: 'issuingEntity',
      attributeType: 1,
      value: issuingEntity,
    },
    {
      key: 'projectName',
      attributeType: 1,
      value: projectName,
    },
    {
      key: 'auditor',
      attributeType: 1,
      value: auditor,
    },
    {
      key: 'location',
      attributeType: 1,
      value: location,
    },
    {
      key: 'price',
      attributeType: 1,
      value: price,
    },
    {
      key: 'discount',
      attributeType: 1,
      value: discount,
    },
    {
      key: 'image',
      attributeType: 1,
      value: defaultTokenImageUrl || '',
    },
    {
      key: 'claimTopics',
      attributeType: 0,
      value: targetKeys ? targetKeys.join(',') : targetKeys,
    },
  ];
  const handleMint = async () => {
    toast.promise(
      async () => {
        try {
          await service.llmint(metadata).then(() => {
            setNftTitle("");
            setDescription("");
            setRegisterId("");
            setTrancheCutoff("");
            setCarbonAmount("");
            setMintAddress("");
            setIssuanceDate("");
            setIssuingEntity("");
            setProjectName("");
            setAuditor("");
            setLocation("");
            setPrice("");
            setDiscount("");
            setTargetKeys([]);
            setPreview(false);
            setFrozen(false);
            setTimeout(() => {
              form.resetFields();
            }, 500);
          });
        } catch (e) {
          console.log(e);
          throw e;
        }
      },
      {
        pending: "Minting Nft...",
        success: "Successfully minted Nft to " + mintAddress,
        error: {
          render({ data }: any) {
            return (
              <div>{data?.reason || "An error occurred while minting Nft"}</div>
            );
          },
        },
      }
    );
  };

  return (
    <>
      {preview ? (
        <NftRecordDetail
          data={nftData}
          handleBack={handleBack}
          handleMint={handleMint}
        />
      ) : (
        <CreateNftDetails
          claimTopics={claimTopics}
          fieldGroups={fieldGroups}
          form={form}
          image={defaultTokenImageUrl}
          targetKeys={targetKeys}
          selectedKeys={selectedKeys}
          handleInputValues={handleInputValues}
          handlePreviewFunc={handlePreviewFunc}
          onChange={onChange}
          onSelectChange={onSelectChange}
          onScroll={onScroll}
        />
      )}
    </>
  );
}
Details.getLayout = getDashboardLayout;
