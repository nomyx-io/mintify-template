"use client";
import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
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
import { Form } from "antd";
import { usePageUnloadGuard } from "@/hooks/usePageUnloadGuard";
import BlockchainService from "@/services/BlockchainService";
import { CheckboxChangeEvent } from "antd/lib/checkbox/Checkbox";
import { File } from "parse";
import { parseUnits } from "ethers";

export default function Details({ service }: {service: BlockchainService}) {
  const { isConnected } = useAccount();
  const router = useRouter();
  const { walletAddress } = useWalletAddress();
  const api = useMemo(() => KronosService(), []);
  const [preview, setPreview] = useState(false);
  const [nftData, setNftData] = useState({});
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [claimTopics, setClaimTopics] = useState<ClaimTopic[]>([]);

  // form fields
  // Details Group
  const [nftTitle, setNftTitle] = useState("");
  const [description, setDescription] = useState("")

  // Project Info Group
  const [projectId, setProjectId] = useState('');
  const [auditor, setAuditor] = useState(''); // what does this need to be? maybe don't need
  const [projectStartDate, setProjectStartDate] = useState("");
  const [mintAddress, setMintAddress] = useState<string | undefined>(walletAddress);
  const [country, setCountry] = useState(''); // maybe later
  const [state, setState] = useState(''); // maybe later
  const [registerId, setRegisterId] = useState("");
  const [registryURL, setRegistryURL] = useState(""); // come from the project?
  const [issuanceDate, setIssuanceDate] = useState("");
  const [ghgReduction, setGhgReduction] = useState("");
  const [useTranche, setUseTranche] = useState(false);
  const [trancheCutoff, setTrancheCutoff] = useState("");

  // Credit Info Group
  const [creditsPre2020, setCreditsPre2020] = useState(""); 
  const [credits2020, setCredits2020] = useState(""); 
  const [credits2021, setCredits2021] = useState(""); 
  const [credits2022, setCredits2022] = useState(""); 
  const [credits2023, setCredits2023] = useState(""); 
  const [credits2024, setCredits2024] = useState(""); 
  const [existingCredits, setExistingCredits] = useState(""); 
  const [estimatedEmissionsReduction, setEstimatedEmissionsReduction] = useState(""); // maybe don't need

  // Pricing Info Group
  const [price, setPrice] = useState("");
  const [totalPrice, setTotalPrice] = useState("");

  const [form] = Form.useForm();

  const listener = usePageUnloadGuard();

  const fetchProjects = useCallback(async () => {
    try {
      const projects = await api.getProjects();
      setProjectList(
        projects?.map((project) => ({
          id: project.id,
          title: project.attributes.title,
          description: project.attributes.description,
          logo: project.attributes.logo,
          coverImage: project.attributes.coverImage,
          registryURL: project.attributes.registryURL,
        })) || []
      );
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  }, [api]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  listener.onBeforeUnload = () => {
    console.log('onBeforeUnload');
    return true;
  };

  const handleInputValues = (
    inputName: string,
    e: ChangeEvent<HTMLInputElement> | CheckboxChangeEvent,
    inputValue?: string
  ) => {
    // Set state for all fields normally
    const name = inputName || e.target.name;
    const value = e.target?.value || inputValue;
    switch (name) {
      // Details Group
      case "nftTitle":
        setNftTitle(value);
        break;
      case "description":
        setDescription(value);
        break;

      // Project Info Group
      case "projectId":
        setProjectId(value);
        break;
      case "auditor":
        setAuditor(value);
        break;
      case "projectStartDate":
        setProjectStartDate(value);
        break;
      case "mintAddress":
        setMintAddress(value);
        break;
      case "country":
        setCountry(value);
        break;
      case "state":
        setState(value);
        break;
      case "registerId":
        setRegisterId(value);
        break;
      case "registryURL":
        setRegistryURL(value);
        break;
      case "issuanceDate":
        setIssuanceDate(value);
        break;
      case "ghgReduction":
        setGhgReduction(value);
        break;
      case "useTranche":
        setUseTranche(!useTranche);
        break;
      case "trancheCutoff":
        setTrancheCutoff(value);
        break;

      // Credit Info Group
      case "creditsPre2020":
        setCreditsPre2020(value);
        break;
      case "credits2020":
        setCredits2020(value);
        break;
      case "credits2021":
        setCredits2021(value);
        break;
      case "credits2022":
        setCredits2022(value);
        break;
      case "credits2023":
        setCredits2023(value);
        break;
      case "credits2024":
        setCredits2024(value);
        break;
      case "existingCredits":
        setExistingCredits(value);
        break;
      case "estimatedEmissionsReduction":
        setEstimatedEmissionsReduction(value);
        break;

      // Pricing Info Group
      case "price":
        setPrice(value);
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

  const onChange: TransferOnChange = (
    nextTargetKeys: string[],
    direction: TransferDirection,
    moveKeys: string[]
  ) => {
    setTargetKeys(nextTargetKeys);
  };

  const onSelectChange: TransferOnSelectChange = (
    sourceSelectedKeys: string[],
    targetSelectedKeys: string[]
  ) => {
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  const onScroll: TransferOnScroll = (
    direction: TransferDirection,
    e: React.SyntheticEvent<HTMLUListElement>
  ) => {
    console.log("direction:", direction);
    console.log("target:", e.target);
  };

  const handlePreview = () => { 
    const projectName = projectList.find((project) => project.id === projectId)?.title;
    setNftData({
      // details fields
      nftTitle,
      description,

      // project info fields
      projectId,
      projectName,
      auditor,      
      projectStartDate,
      mintAddress,
      country,
      state,
      registerId,
      registryURL,
      issuanceDate,
      ghgReduction,
      trancheCutoff,

      // credit info fields
      creditsPre2020,
      credits2020,
      credits2021,
      credits2022,
      credits2023,
      credits2024,
      existingCredits,
      estimatedEmissionsReduction,

      // pricing info fields
      price,

      // compliance fields
      targetKeys,
      claimTopics,
    });
    setPreview(true);
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

  const fieldGroups: NftDetailsInputFieldGroup[] = [
    {
      name: 'Details',
      fields: [
        {
          label: 'Title',
          name: 'nftTitle',
          dataType: 'text',
          placeHolder: 'Enter Token Title',
          defaultValue: nftTitle,
          value: nftTitle,
          rules: [requiredRule, alphaNumericRule, { max: 30 }],
        },
        {
          label: 'Description',
          name: 'description',
          dataType: 'text',
          placeHolder: 'Add a description for the NFT',
          defaultValue: description,
          value: description,
          rules: [{ ...requiredRule, max: 256 }],
        },
      ],
    },
    {
      name: 'Project Information',
      fields: [
        {
          label: 'Project ID',
          name: 'projectId',
          dataType: 'select',
          placeHolder: 'Select Project ID',
          defaultValue: projectId,
          value: projectId,
          rules: [requiredRule],
          options: projectList.map((project) => ({
            label: project.title,
            value: project.id,
          })),
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
          label: 'Project Start Date',
          name: 'projectStartDate',
          dataType: 'date',
          placeHolder: 'mm/dd/yyyy',
          defaultValue: projectStartDate,
          value: projectStartDate,
          rules: [requiredRule],
        },
        {
          label: 'Mint to',
          name: 'mintAddress',
          dataType: 'text',
          placeHolder: 'Enter Wallet Address',
          defaultValue: mintAddress || '',
          value: mintAddress || '',
          rules: [
            {
              required: true,
              pattern: Regex.ethereumAddress,
              message: 'This field must be an ethereum address.',
            },
          ],
        },
        {
          label: 'Country',
          name: 'country',
          dataType: 'text',
          placeHolder: 'Enter Country',
          defaultValue: country,
          value: country,
        },
        {
          label: 'State',
          name: 'state',
          dataType: 'text',
          placeHolder: 'Enter State',
          defaultValue: state,
          value: state,
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
          label: 'Registry Link',
          name: 'registryURL',
          dataType: 'text',
          placeHolder: 'Enter Registry URL',
          defaultValue: registryURL,
          value: registryURL,
          rules: [requiredRule],
        },
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
          label: 'GHG Reduction Type',
          name: 'ghgReduction',
          dataType: 'text',
          placeHolder: 'Enter GHG Reduction Type',
          defaultValue: ghgReduction,
          value: ghgReduction,
          rules: [requiredRule],
        },
        {
          label: 'Tranche Cutoff',
          name: 'useTranche',
          dataType: 'checkbox',
          defaultValue: useTranche,
          value: useTranche,
          className: 'col-span-2',
        },
        {
          label: 'Tranche Cutoff',
          name: 'trancheCutoff',
          dataType: 'text',
          placeHolder: 'Enter Tranche Cutoff',
          defaultValue: trancheCutoff,
          value: trancheCutoff,
          className: `${useTranche ? '' : 'hidden'}`,
        },
      ],
    },
    {
      name: 'Credit Info',
      fields: [
        {
          label: 'Pre 2020 Credits',
          name: 'creditsPre2020',
          dataType: 'text',
          placeHolder: 'Enter Pre 2020 carbon Issued Amount',
          defaultValue: creditsPre2020,
          value: creditsPre2020,
          rules: [requiredRule, numericRule],
        },
        {
          label: '2020 Project Credits',
          name: 'credits2020',
          dataType: 'text',
          placeHolder: 'Enter 2020 carbon Issued Amount',
          defaultValue: credits2020,
          value: credits2020,
          rules: [requiredRule, numericRule],
        },
        {
          label: '2021 Project Credits',
          name: 'credits2021',
          dataType: 'text',
          placeHolder: 'Enter 2021 carbon Issued Amount',
          defaultValue: credits2021,
          value: credits2021,
          rules: [requiredRule, numericRule],
        },
        {
          label: '2022 Project Credits',
          name: 'credits2022',
          dataType: 'text',
          placeHolder: 'Enter 2022 carbon Issued Amount',
          defaultValue: credits2022,
          value: credits2022,
          rules: [requiredRule, numericRule],
        },
        {
          label: '2023 Project Credits',
          name: 'credits2023',
          dataType: 'text',
          placeHolder: 'Enter 2023 carbon Issued Amount',
          defaultValue: credits2023,
          value: credits2023,
          rules: [requiredRule, numericRule],
        },
        {
          label: '2024 Project Credits',
          name: 'credits2024',
          dataType: 'text',
          placeHolder: 'Enter 2024 carbon Issued Amount',
          defaultValue: credits2024,
          value: credits2024,
          rules: [requiredRule, numericRule],
        },
        {
          label: 'Existing Credits',
          name: 'existingCredits',
          dataType: 'text',
          placeHolder: 'Enter Existing Carbon Credits Amount',
          defaultValue: existingCredits,
          value: existingCredits,
          rules: [requiredRule, numericRule],
        },
        {
          label: 'Estimated Annual Emissions Reduction',
          name: 'estimatedEmissionsReduction',
          dataType: 'text',
          placeHolder: 'ETA',
          defaultValue: estimatedEmissionsReduction,
          value: estimatedEmissionsReduction,
          rules: [requiredRule, numericRule],
        },
      ],
    },
    {
      name: 'Pricing Information',
      fields: [
        {
          label: 'Price per Credit',
          name: 'price',
          dataType: 'text',
          placeHolder: 'Enter Price per Credit',
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
        },
        {
          label: 'Total Price',
          name: 'totalPrice',
          dataType: 'text',
          placeHolder: 'Final Price',
          defaultValue: totalPrice,
          value: totalPrice,
          prefix: '$',
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
    const totalPrice = Number(price) * Number(existingCredits);
    setTotalPrice(`${totalPrice}`);
    form.setFieldValue('totalPrice', totalPrice);
  }, [price, existingCredits, form]);

  const getClaimTopics = async () => {
    const claims: Parse.Object[] | undefined = service && (await service.getClaimTopics());
    let data: ClaimTopic[] = [];
    if (claims) {
      claims.forEach((item: Parse.Object) => {
        data.push({
          key: `${parseInt(item.attributes.topic)}`,
          displayName: item.attributes.displayName as string,
          id: item.id as string,
          topic: item.attributes.topic as string,
        });
      });
      setClaimTopics(data);
    }
  };

  const getSettings = async () => {
    if (api && api.getSettings) {
      const settings: { defaultTokenImage: File; walletAddress?: string} =
        await api.getSettings();
      setMintAddress(settings.walletAddress);
    }
  };

  
  const handleBack = () => {
    setPreview(false);
  };

  const metadata = [
    // details fields
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
    // project info fields
    {
      key: 'projectId',
      attributeType: 1,
      value: projectId,
    },
    {
      key: 'auditor',
      attributeType: 1,
      value: auditor,
    },
    {
      key: 'projectStartDate',
      attributeType: 1,
      value: projectStartDate,
    },
    {
      key: 'mintAddress',
      attributeType: 1,
      value: mintAddress,
    },
    {
      key: 'country',
      attributeType: 1,
      value: country,
    },
    {
      key: 'state',
      attributeType: 1,
      value: state,
    },
    {
      key: 'registerId',
      attributeType: 1,
      value: registerId,
    },
    {
      key: 'registryURL',
      attributeType: 1,
      value: registryURL,
    },
    {
      key: 'issuanceDate',
      attributeType: 1,
      value: issuanceDate,
    },
    {
      key: 'ghgReduction',
      attributeType: 1,
      value: ghgReduction,
    },
    {
      key: 'trancheCutoff',
      attributeType: 1,
      value: trancheCutoff,
    },
    // credit info fields
    {
      key: 'creditsPre2020',
      attributeType: 1,
      value: creditsPre2020,
    },
    {
      key: 'credits2020',
      attributeType: 1,
      value: credits2020,
    },
    {
      key: 'credits2021',
      attributeType: 1,
      value: credits2021,
    },
    {
      key: 'credits2022',
      attributeType: 1,
      value: credits2022,
    },
    {
      key: 'credits2023',
      attributeType: 1,
      value: credits2023,
    },
    {
      key: 'credits2024',
      attributeType: 1,
      value: credits2024,
    },
    {
      key: 'existingCredits',
      attributeType: 1,
      value: existingCredits,
    },
    {
      key: 'estimatedEmissionsReduction',
      attributeType: 1,
      value: estimatedEmissionsReduction,
    },
    // pricing info fields
    {
      key: 'price',
      attributeType: 1,
      value: price,
    },
    // compliance fields
    {
      key: 'claimTopics',
      attributeType: 0,
      value: targetKeys ? targetKeys.join(',') : targetKeys,
    },
  ];

  const handleMint = async () => {
    if (!mintAddress) {
      // Handle the case where mintAddress is undefined
      console.error("Wallet address is not available.");
      return;
    }
  
    try {
      // Step 1: Mint the token and show a toast notification
      const mintingToast = toast.loading("Minting token...");
      const { tokenId, transactionHash } = await service.gemforceMint(metadata);
      toast.update(mintingToast, {
        render: `Token minted successfully. Transaction Hash: ${transactionHash}`,
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });
  
      // Step 2: Show a toast notification for calculating the price
      const totalPrice = parseUnits((Number(existingCredits) * Number(price)).toString(), 6);
      toast.info(`Calculated total price in USDC: ${totalPrice.toString()}`, { autoClose: 3000 });
  
      // Step 3: List the token and show a toast notification
      const listingToast = toast.loading("Listing token on the marketplace...");
      await service.listItem(
        mintAddress,           // Receiver of the sale funds (wallet address)
        tokenId,               // Token ID of the NFT
        totalPrice.toString(), // Price in wei (USDC with 6 decimals)
        true                   // Transfer the NFT to the marketplace
      );
      toast.update(listingToast, {
        render: `Token successfully listed with ID: ${tokenId}`,
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });
  
      // Step 4: Initialize carbon credits (directly passing existingCredits without conversion)
      const carbonCreditToast = toast.loading("Initializing carbon credits...");
      await service.initializeCarbonCredit(tokenId, existingCredits || "0");
      toast.update(carbonCreditToast, {
        render: `Carbon credits initialized for token ID: ${tokenId}`,
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });
  
      // Step 5: Reset form and states after success
      resetFormStates();
  
      // Final success notification with token ID
      toast.success(`Successfully minted NFT with Token ID: ${tokenId} and initialized ${existingCredits} carbon credits.`);
  
      return tokenId;
  
    } catch (e) {
      // Handle the error properly by ensuring 'e' is an instance of Error
      let errorMessage = "An error occurred during the minting/listing process.";
  
      if (e instanceof Error) {
        errorMessage = e.message;
      } else if (typeof e === "string") {
        errorMessage = e;
      }
  
      console.error(e);
  
      // Error handling toast notification
      toast.error(errorMessage);
    }
  };
  
  
  // Helper function to reset form states after successful minting
  const resetFormStates = () => {
    setNftTitle("");
    setDescription("");
    setProjectId("");
    setAuditor("");
    setProjectStartDate("");
    setMintAddress("");
    setCountry("");
    setState("");
    setRegisterId("");
    setRegistryURL("");
    setIssuanceDate("");
    setGhgReduction("");
    setTrancheCutoff("");
    setCreditsPre2020("");
    setCredits2020("");
    setCredits2021("");
    setCredits2022("");
    setCredits2023("");
    setCredits2024("");
    setExistingCredits("");
    setEstimatedEmissionsReduction("");
    setPrice("");
    setTargetKeys([]);
    setPreview(false);
  
    setTimeout(() => {
      form.resetFields();
    }, 500);
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
          targetKeys={targetKeys}
          selectedKeys={selectedKeys}
          handleInputValues={handleInputValues}
          handlePreview={handlePreview}
          onChange={onChange}
          onSelectChange={onSelectChange}
          onScroll={onScroll}
        />
      )}
    </>
  );
}
Details.getLayout = getDashboardLayout;
