"use client";
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import CreateNftDetails from "@/components/CreateNftDetails";
import NftRecordDetail from "../../components/NftRecordDetail";
import { getDashboardLayout } from "@/Layouts";
import { toast } from "react-toastify";
import { TransferDirection } from "antd/es/transfer";
import { Regex } from "@/utils/regex";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { KronosService } from "@/services/KronosService";
import { useWalletAddress } from "@/context/WalletAddressContext";
import { Form } from "antd";
import { usePageUnloadGuard } from "@/hooks/usePageUnloadGuard";
import BlockchainService from "@/services/BlockchainService";
import { CheckboxChangeEvent } from "antd/lib/checkbox/Checkbox";
import { File } from "parse";
import { parseUnits, ethers } from "ethers";
import { formatPrice } from "@/utils/currencyFormater";

const requiredRule = { required: true, message: `This field is required.` };
const alphaNumericRule = {
  required: true,
  pattern: Regex.alphaNumeric,
  message: "Only alphanumeric characters are allowed.",
};
const dateRule = {
  required: true,
  pattern: /^\d{2}\/\d{2}\/\d{4}$/,
  message: "Date must be in mm/dd/yyyy format.",
};
const numberRule = {
  required: true,
  pattern: Regex.numeric,
  message: "This field must be a number.",
};

export default function Details({ service }: { service: BlockchainService }) {
  const { isConnected } = useAccount();
  const router = useRouter();
  const { walletAddress } = useWalletAddress();
  const api = useMemo(() => KronosService(), []);
  const [preview, setPreview] = useState(false);
  const [nftData, setNftData] = useState({});
  const [projectList, setProjectList] = useState<
    { id: string; title: string; startDate: string }[]
  >([]);
  const [claimTopics, setClaimTopics] = useState<ClaimTopic[]>([]);
  const [projectId, setProjectId] = useState("");
  const [mintAddress, setMintAddress] = useState<string | undefined>(
    walletAddress
  );
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  const [form] = Form.useForm();

  const listener = usePageUnloadGuard();

  const fetchProjects = useCallback(async () => {
    try {
      const projects = await api.getProjects();
      setProjectList(
        projects?.map((project) => ({
          id: project.id,
          title: project.attributes.title,
          startDate: project.createdAt.toLocaleDateString(),
        })) || []
      );
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  }, [api]);

  const [fieldGroups, setFieldGroups] = useState<NftDetailsInputFieldGroup[]>([
    {
      name: "Details",
      fields: [
        {
          label: "Title",
          name: "nftTitle",
          dataType: "text",
          placeHolder: "Enter Token Title",
          defaultValue: "",
          value: "",
          rules: [requiredRule, alphaNumericRule, { max: 30 }],
        },
        {
          label: "Description",
          name: "description",
          dataType: "text",
          placeHolder: "Add a description for the NFT",
          defaultValue: "",
          value: "",
          rules: [{ ...requiredRule, max: 256 }],
        },
        {
          label: "Project",
          name: "projectId",
          dataType: "select",
          placeHolder: "Select Project ID",
          defaultValue: "",
          value: "",
          rules: [requiredRule],
          options: projectList.map((project) => ({
            label: project.title,
            value: project.id,
          })),
        },
        {
          label: "Project Start Date",
          name: "projectStartDate",
          dataType: "text",
          placeHolder: "mm/dd/yyyy",
          value: formValues.projectStartDate,
          disabled: true,
        },
        {
          label: "Mint to",
          name: "mintAddress",
          dataType: "text",
          placeHolder: "Enter Wallet Address",
          defaultValue: "",
          value: "",
          rules: [
            {
              required: true,
              pattern: Regex.ethereumAddress,
              message: "This field must be an ethereum address.",
            },
          ],
        },
        {
          label: "Price",
          name: "price",
          dataType: "text",
          placeHolder: "Price",
          defaultValue: "",
          value: "",
          prefix: "$",
        },
      ],
    },
  ]);

  const fetchProjectMetadata = useCallback(
    async (projectId: string) => {
      try {
        const projectsMetadata = await api.getProjectMetadata(projectId);

        // Check if there is valid metadata
        if (projectsMetadata?.metadata?.length > 0) {
          const additionalFields = projectsMetadata.metadata.map(
            (field: any) => {
              // Define validation rules based on field type
              let rules = [requiredRule]; // Default rule to make field required

              // switch (field.type) {
              //   case "string":
              //     rules.push(alphaNumericRule);
              //     break;
              //   case "date":
              //     rules.push(dateRule);
              //     break;
              //   case "number":
              //     rules.push(numberRule);
              //     break;
              //   case "select":
              //     //rules.push(requiredRule); // Ensure required rule for select fields
              //     break;
              //   default:
              //     break;
              // }

              return {
                id: "metadata_" + field.name.replace(/\s+/g, "").toLowerCase(),
                label: field.name,
                name: field.name.replace(/\s+/g, "").toLowerCase(),
                dataType: field.type,
                placeHolder: `Enter ${field.name}`,
                defaultValue: "", // Default value for new fields
                value: "", // Initial empty value
                rules,
              };
            }
          );
          // Remove additional fields before concatenating the new fields
          setFieldGroups((prevFieldGroups) => {
            return prevFieldGroups.map((group) => {
              if (group.name === "Details") {
                return {
                  ...group,
                  fields: group.fields.filter(
                    (field) => !field.id?.startsWith("metadata_") // Remove fields related to metadata
                  ),
                };
              }
              return group;
            });
          });

          // Concatenate additional fields to the existing `Details` fields
          setFieldGroups((prevFieldGroups) => {
            return prevFieldGroups.map((group) => {
              if (group.name === "Details") {
                return {
                  ...group,
                  fields: [...group.fields, ...additionalFields],
                };
              }
              return group;
            });
          });
        } else {
          // Remove additional fields if no metadata is found
          setFieldGroups((prevFieldGroups) => {
            return prevFieldGroups.map((group) => {
              if (group.name === "Details") {
                return {
                  ...group,
                  fields: group.fields.filter(
                    (field) => !field.id?.startsWith("metadata_") // Remove fields related to metadata
                  ),
                };
              }
              return group;
            });
          });
        }
      } catch (error) {
        console.error("Failed to fetch metadata:", error);
      }
    },
    [api]
  );

  // useEffect(() => {
  //   if (router.query.projectId) {
  //     setProjectId(router.query.projectId as string);
  //     setProjectStartDate(
  //       projectList.find((project) => project.id === router.query.projectId)
  //         ?.startDate || ""
  //     );
  //     form.setFieldsValue({ projectId: router.query.projectId });
  //   }
  // }, [router.query.projectId, projectList, form]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  listener.onBeforeUnload = () => {
    return true;
  };

  const handleInputValues = (
    inputName: string,
    e: ChangeEvent<HTMLInputElement> | CheckboxChangeEvent,
    inputValue?: string
  ) => {
    const name = inputName || e.target.name;

    if (typeof name !== "string") {
      return; // Prevent further execution if name is not a string
    }

    const value = e.target?.value || inputValue;

    // Update the value in the formValues object directly
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value, // Dynamically update the relevant field
    }));

    // If specific logic is needed, like for projectId
    if (name === "projectId") {
      const projectDate = projectList.find(
        (project) => project.id === value
      )?.startDate;

      setFormValues((prevValues) => {
        const updatedValues = { ...prevValues, projectStartDate: projectDate };
        return updatedValues;
      });

      fetchProjectMetadata(value);
    }
  };

  useEffect(() => {
    if (projectList.length > 0) {
      setFieldGroups((prevFieldGroups) =>
        prevFieldGroups.map((group) => {
          if (group.name === "Details") {
            return {
              ...group,
              fields: group.fields.map((field) => {
                // Update options for projectId
                if (field.name === "projectId") {
                  return {
                    ...field,
                    options: projectList.map((project) => ({
                      label: project.title,
                      value: project.id,
                    })),
                  };
                }
                // Set value for projectStartDate
                if (field.name === "projectStartDate") {
                  return {
                    ...field,
                    value: formValues.projectStartDate || "", // Use the value from formValues
                  };
                }
                return field;
              }),
            };
          }
          return group;
        })
      );
    }
  }, [projectList, formValues.projectStartDate]); // Re-run when projectList or projectStartDate changes

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
  ) => {};

  const handlePreview = () => {
    // Find project name dynamically from the project list
    const projectName = projectList.find(
      (project) => project.id === formValues.projectId
    )?.title;

    setFieldGroups((prevFieldGroups) => {
      return prevFieldGroups.map((group) => {
        if (group.name === "Details") {
          return {
            ...group,
            fields: group.fields.map((field) => {
              if (field.name === "projectId") {
                // Replace projectId with projectName in fieldGroups
                return {
                  ...field,
                  value: projectName || "", // Set the value to projectName
                  name: "projectName",
                };
              }
              return field;
            }),
          };
        }
        return group;
      });
    });

    // Prepare the base structure of nftData
    const updatedNftData: Record<string, any> = {};

    // Loop through the formValues to dynamically set the fields
    Object.keys(formValues).forEach((key) => {
      if (key === "price" || key === "totalPrice") {
        // Format price and totalPrice
        updatedNftData[key] = formValues[key]
          ? `${formatPrice(parseFloat(formValues[key]), "USD")}`
          : "";
      } else if (key === "targetKeys") {
        // Handle targetKeys array (e.g., claimTopics)
        updatedNftData["claimTopics"] = formValues[key]
          ? formValues[key].join(",")
          : "";
      } else if (key === "projectId") {
        // Special case for projectId to add projectName dynamically
        updatedNftData[key] = formValues[key];
        updatedNftData["projectName"] = projectName;
      } else {
        // Default case, just add the field as is
        updatedNftData[key] = formValues[key];
      }
    });
    // Set the dynamic nftData object
    setNftData(updatedNftData);
    // Optionally, set preview state to true
    setPreview(true);
  };

  useEffect(() => {
    getClaimTopics();
  }, [service]);

  useEffect(() => {
    !isConnected && router.push("/login");
  }, []);

  // useEffect(() => {
  //   const projectDate = projectList.find(
  //     (project) => project.id === projectId
  //   )?.startDate;
  //   setProjectStartDate(projectDate || "");
  //   form.setFieldsValue({ projectStartDate: projectDate });
  // }, [projectId, projectList, form]);

  const getClaimTopics = async () => {
    const claims: Parse.Object[] | undefined =
      service && (await service.getClaimTopics());
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

  const handleBack = () => {
    setFieldGroups((prevFieldGroups) => {
      return prevFieldGroups.map((group) => {
        if (group.name === "Details") {
          return {
            ...group,
            fields: group.fields.map((field) => {
              if (field.name === "projectName") {
                // Replace projectId with projectName in fieldGroups
                return {
                  ...field,
                  value: formValues.projectId || "", // Set the value to projectId
                  name: "projectId",
                };
              }
              return field;
            }),
          };
        }
        return group;
      });
    });
    setPreview(false);
  };

  const generateMetadata = (
    fieldGroups: NftDetailsInputFieldGroup[],
    formValues: Record<string, any>
  ) => {
    // Create an empty array to store the generated metadata
    const metadataFields: any = [];

    // Loop through each field group
    fieldGroups.forEach((group) => {
      group.fields.forEach((field) => {
        // Get the field value from the formValues object
        const value = formValues[field.name];

        // Skip if the value is empty or undefined
        if (value || value === 0) {
          const metadataField = {
            key: field.name,
            attributeType: 1, // Default attribute type; adjust if needed based on field data type
            value,
          };

          // Add the metadata field to the metadata array
          metadataFields.push(metadataField);
        }
      });
    });
    const claimsTopics = {
      key: "claimTopics",
      attributeType: 0,
      value: targetKeys ? targetKeys.join(",") : targetKeys,
    };
    // push claim topics
    metadataFields.push(claimsTopics);
    return metadataFields;
  };

  const metadata = generateMetadata(fieldGroups, formValues);

  // Utility function to add a delay
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const handleMint = async () => {
    if (!formValues.mintAddress) {
      toast.error("Wallet address is not available.");
      return;
    }

    try {
      // Step 1: Mint the token
      const mintingToast = toast.loading("Minting token...");
      const { tokenId, transactionHash } = await service.gemforceMint(metadata);
      toast.update(mintingToast, {
        render: `Token minted successfully. Transaction Hash: ${transactionHash}`,
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });

      // Add delay before proceeding to the next step
      await sleep(3000); // 3-second delay

      // Step 2: Initialize carbon credits
      const carbonCreditToast = toast.loading("Initializing carbon credits...");
      await service.initializeCarbonCredit(
        tokenId,
        formValues?.existingCredits || "0"
      );
      toast.update(carbonCreditToast, {
        render: `Carbon credits initialized for token ID: ${tokenId}`,
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });

      // Add another delay before listing the token
      await sleep(3000); // 3-second delay

      // Step 3: Calculate price and list the token
      const usdcPrice = ethers.parseUnits(formValues?.price, 6);
      toast.info(`Calculated total price in USDC: ${formValues?.price}`, {
        autoClose: 3000,
      });

      const listingToast = toast.loading("Listing token on the marketplace...");
      await service.listItem(
        formValues.mintAddress, // Receiver of the sale funds
        tokenId, // Token ID of the NFT
        usdcPrice, // Price in wei (USDC with 6 decimals)
        true // Transfer the NFT to the marketplace
      );
      toast.update(listingToast, {
        render: `Token successfully listed with ID: ${tokenId}`,
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });

      // Step 4: Reset form and states after success
      resetFormStates();

      toast.success(
        `Successfully minted NFT with Token ID: ${tokenId} and initialized ${formValues?.existingCredits} carbon credits.`
      );
      return tokenId;
    } catch (e) {
      let errorMessage =
        "An error occurred during the minting/listing process.";
      if (e instanceof Error) {
        errorMessage = e.message;
      } else if (typeof e === "string") {
        errorMessage = e;
      }
      console.error(e);
      toast.error(errorMessage);
    }
  };

  // Helper function to reset form states after successful minting
  const resetFormStates = () => {
    setProjectId("");
    setMintAddress("");
    setTargetKeys([]);
    setPreview(false);
    // remove the metadata fields on form reset
    setFieldGroups((prevFieldGroups) => {
      return prevFieldGroups.map((group) => {
        if (group.name === "Details") {
          return {
            ...group,
            fields: group.fields.filter(
              (field) => !field.id?.startsWith("metadata_") // Remove fields related to metadata
            ),
          };
        }
        return group;
      });
    });

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
          fieldGroups={fieldGroups}
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
