import { useMemo, useState } from "react";
import { useContext } from "react";

import { Button, Form, GetProp, Input, message, Modal, Select, UploadProps, Checkbox } from "antd";
import { Rule } from "antd/es/form";
import { Trash } from "iconsax-react";
import { FormFinishInfo } from "rc-field-form/es/FormContext";
import { toast } from "react-toastify";

import { industryOptions, Industries } from "@/constants/constants";
import { UserContext } from "@/context/UserContext";
import BlockchainService from "@/services/BlockchainService";
import { CustomerService } from "@/services/CustomerService";
import DfnsService from "@/services/DfnsService";
import { WalletPreference } from "@/utils/constants";

const TRADE_DEAL_DEFAULT_INTEREST_RATE = 0;
const TRADE_DEAL_DEFAULT_VABB_VABI_RATIO = 1;

import ImageBoxFormItem from "../molecules/ImageBox";

interface CreateProjectModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onCreateSuccess?: () => void;
}

interface FormValues {
  logoUpload: UploadProps;
  coverImageUpload: UploadProps;
  title: string;
  description: string;
  industryTemplate: Industries;
  additionalFields?: AddedField[];
}

interface AddedField {
  fieldName: string;
  fieldType: string;
}

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export default function CreateProjectModal({ open, setOpen, onCreateSuccess }: CreateProjectModalProps) {
  const [form] = Form.useForm();
  const [addFieldForm] = Form.useForm();
  const [addedFields, setAddedFields] = useState<AddedField[]>([]);
  const { walletPreference, dfnsToken, user } = useContext(UserContext);
  const requiredRule = { required: true, message: "This field is required." };
  const uniqueRule: Rule = ({ getFieldValue }) => ({
    validator(_, value: string) {
      if (
        value &&
        (addedFields.some((field) => field.fieldName.toLowerCase() === value.toLowerCase()) || STANDARD_FIELDS.includes(value.toLowerCase()))
      ) {
        return Promise.reject(new Error("Field name must be unique!"));
      }
      return Promise.resolve();
    },
  });
  const fieldOptions = [
    { label: "Text", value: "text" },
    { label: "Number", value: "number" },
    { label: "Date", value: "date" },
  ];

  const STANDARD_FIELDS = ["title", "description", "date", "mint to", "project", "price"];

  const api = useMemo(() => CustomerService(), []);

  const capitalizeEveryWord = (str: string) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  function handleModalCancel() {
    setOpen(false);
  }

  function handleRemoveField(index: number) {
    const newFields = addedFields.filter((_, i) => i !== index);
    setAddedFields(newFields);
    form.setFieldsValue({ additionalFields: newFields });
  }

  const onFormFinish = async (name: string, { values, forms }: FormFinishInfo) => {
    if (name === "addFieldForm") {
      const { createProjectForm } = forms;
      const fieldValues: AddedField[] = createProjectForm.getFieldValue("additionalFields") || [];

      const newFieldValues = [...fieldValues, values as AddedField];
      createProjectForm.setFieldsValue({ additionalFields: newFieldValues });
      setAddedFields(newFieldValues);
      addFieldForm.resetFields();
    }
    if (name === "createProjectForm") {
      const savePromise = saveProject(values as FormValues);
      toast.promise(savePromise, {
        success: "Project saved successfully!",
        error: "Failed to save project!",
      });

      if (await savePromise) {
        onCreateSuccess && onCreateSuccess();
      }

      form.setFieldsValue({});
      setOpen(false);
    }
  };
  async function saveProject(values: FormValues) {
    if (!values?.logoUpload?.fileList) {
      toast.error("Please upload a logo");
      return Promise.reject();
    }
    if (!values?.coverImageUpload?.fileList) {
      toast.error("Please upload a cover image");
      return Promise.reject();
    }

    const project: {
      title: string;
      description: string;
      industryTemplate: Industries;
      logo: string;
      coverImage: string;
      fields: string;
      tradeDealId?: number;
    } = {
      title: values.title,
      description: values.description,
      industryTemplate: values.industryTemplate,
      logo: await getBase64(values.logoUpload.fileList[0].originFileObj as FileType),
      coverImage: await getBase64(values.coverImageUpload.fileList[0].originFileObj as FileType),
      fields: JSON.stringify(
        values.additionalFields?.map((field) => {
          return {
            name: field.fieldName,
            type: field.fieldType,
            key: field.fieldName.replaceAll(" ", "_").toLowerCase(),
          };
        })
      ),
    };

    try {
      let projectResult;

      if (values.industryTemplate === Industries.TRADE_FINANCE) {
        try {
          let tradeDealId: number | undefined;
          const symbol = values.title.substring(0, 5).toUpperCase(); // symbol (first 5 chars of title)
          const tradeDealName = values.title.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 32);
          const vabbAddress = "0x0000000000000000000000000000000000000000";
          const vabiAddress = "0x0000000000000000000000000000000000000000";
          const usdcAddress = process.env.NEXT_PUBLIC_HARDHAT_USDC_ADDRESS || "";

          if (walletPreference === WalletPreference.MANAGED) {
            // DFNS Wallet Flow
            const walletId = user?.walletId;
            const safeDfnsToken = dfnsToken || "";
            console.log("🧪 DFNS Token:", safeDfnsToken);

            if (!walletId || !safeDfnsToken) {
              throw new Error("Missing wallet credentials for DFNS transactions");
            }

            const createToastId = toast.loading("Creating trade deal via DFNS...");
            let extractedTradeDealId;
            try {
              const tradeDealResult = await DfnsService.dfnsCreateTradeDeal(
                walletId,
                safeDfnsToken,
                tradeDealName, // Use sanitized name
                symbol,
                TRADE_DEAL_DEFAULT_INTEREST_RATE,
                TRADE_DEAL_DEFAULT_VABB_VABI_RATIO,
                [],
                vabbAddress,
                vabiAddress,
                usdcAddress,
                400 // TODO: Hardcoded fundingTarget for now
              );

              if (tradeDealResult.error) {
                throw new Error(tradeDealResult.error);
              }

              extractedTradeDealId = tradeDealResult.completeResponse.tradeDealId;
              if (!extractedTradeDealId && extractedTradeDealId !== 0) {
                throw new Error("Failed to extract trade deal ID from DFNS response");
              }
              tradeDealId = extractedTradeDealId;

              toast.update(createToastId, {
                render: "Trade deal created successfully",
                type: "success",
                isLoading: false,
                autoClose: 2000,
              });
            } catch (error) {
              toast.update(createToastId, {
                render: "Failed to create trade deal",
                type: "error",
                isLoading: false,
                autoClose: 2000,
              });
              throw error;
            }

            const activateToastId = toast.loading("Activating trade deal via DFNS...");
            try {
              const activateResult = await DfnsService.dfnsActivateTradeDeal(walletId, safeDfnsToken, extractedTradeDealId);
              if (activateResult.error) {
                throw new Error(activateResult.error);
              }
              toast.update(activateToastId, {
                render: "Trade deal activated successfully",
                type: "success",
                isLoading: false,
                autoClose: 2000,
              });
            } catch (error) {
              toast.update(activateToastId, {
                render: "Failed to activate trade deal",
                type: "error",
                isLoading: false,
                autoClose: 2000,
              });
              throw error;
            }
          } else {
            // Private Wallet Flow
            const blockchainService = BlockchainService.getInstance();
            if (!blockchainService) {
              throw new Error("Blockchain service not available");
            }

            const createToastId = toast.loading("Creating trade deal...");

            try {
              const result = await blockchainService.createTradeDeal(
                tradeDealName, // Use sanitized name
                symbol,
                TRADE_DEAL_DEFAULT_INTEREST_RATE,
                TRADE_DEAL_DEFAULT_VABB_VABI_RATIO,
                [],
                vabbAddress,
                vabiAddress,
                usdcAddress,
                400000000 // TODO: Hardcoded fundingTarget for now
              );

              console.log("Trade Deal Created - TX Receipt:", result.receipt);
              console.log("Trade Deal ID Extracted:", result.tradeDealId);

              if (!result.tradeDealId) {
                throw new Error("Trade deal ID extraction failed.");
              }

              tradeDealId = result.tradeDealId;

              toast.update(createToastId, {
                render: "Trade deal created successfully",
                type: "success",
                isLoading: false,
                autoClose: 2000,
              });

              const activateToastId = toast.loading("Activating trade deal...");

              try {
                await blockchainService.activateTradeDeal(result.tradeDealId);
                toast.update(activateToastId, {
                  render: "Trade deal activated successfully",
                  type: "success",
                  isLoading: false,
                  autoClose: 2000,
                });
              } catch (error) {
                toast.update(activateToastId, {
                  render: "Failed to activate trade deal",
                  type: "error",
                  isLoading: false,
                  autoClose: 2000,
                });
                throw error;
              }
            } catch (error) {
              toast.update(createToastId, {
                render: "Failed to create trade deal",
                type: "error",
                isLoading: false,
                autoClose: 2000,
              });
              throw error;
            }
          }

          if (!tradeDealId && tradeDealId !== 0) {
            throw new Error("Failed to obtain trade deal ID");
          }

          // Create project with tradeDealId
          project.tradeDealId = tradeDealId;
          projectResult = await api.createProject(project);
        } catch (error) {
          console.error("Error in trade deal creation:", error);
          toast.error("Failed to create trade deal: " + (error as Error).message);
          throw error;
        }
      } else {
        // For non-trade finance projects, just create the project
        projectResult = await api.createProject(project);
      }

      return projectResult;
    } catch (error) {
      console.error("Error in saveProject:", error);
      throw error;
    }
  }

  return (
    <Modal
      open={open}
      title="Create New Project"
      onCancel={handleModalCancel}
      width={640}
      footer={[
        <Button
          key="back"
          className="w-[292px] text-nomyx-text-light dark:text-nomyx-text-dark hover:!bg-nomyx-dark1-light hover:dark:!bg-nomyx-dark1-dark"
          onClick={handleModalCancel}
        >
          Cancel
        </Button>,
        <Button
          key="submit"
          className="w-[292px] bg-nomyx-blue-light hover:!bg-nomyx-dark1-light hover:dark:!bg-nomyx-dark1-dark"
          onClick={form.submit}
        >
          Create Project
        </Button>,
      ]}
      destroyOnClose
      modalRender={(dom) => <Form.Provider onFormFinish={onFormFinish}>{dom}</Form.Provider>}
    >
      <Form form={form} name="createProjectForm" layout="vertical">
        <div className="flex flex-col">
          <div className="flex w-full gap-5">
            <ImageBoxFormItem label="Logo" name="logoUpload" className="min-w-40" />
            <ImageBoxFormItem label="Cover Image" name="coverImageUpload" className="w-full" />
          </div>
          <Form.Item rules={[requiredRule]} label="Title" name="title">
            <Input placeholder="Add Project Title" />
          </Form.Item>
          <Form.Item rules={[requiredRule]} label="Industry Template" name="industryTemplate">
            <Select placeholder="Select Industry" options={industryOptions} />
          </Form.Item>
          <Form.Item rules={[requiredRule]} label="Description" name="description">
            <Input.TextArea placeholder="Add Project Description" autoSize={{ minRows: 3, maxRows: 5 }} />
          </Form.Item>
          <Form.Item name="additionalFields" noStyle />
        </div>
      </Form>
      <span className="">Add Token Metadata</span>
      <div className="flex flex-col p-2 gap-2 pb-4 mb-6 border rounded-md border-nomyx-dark1-dark dark:border-nomyx-gray4-dark">
        <p className="text-xs">
          Gemforce tokens come with some standard fields to be set upon minting a token. Any additional data fields that need to be associated with a
          token can be specified below.
        </p>
        <p className="text-xs">
          Included fields: {STANDARD_FIELDS.map((field, index) => capitalizeEveryWord(field) + (index === STANDARD_FIELDS.length - 1 ? "" : ", "))}
        </p>
        <Form name="addFieldForm" form={addFieldForm} className="flex gap-2">
          <Form.Item name="fieldName" className="grow" rules={[requiredRule, uniqueRule]}>
            <Input placeholder="Field Name" />
          </Form.Item>
          <Form.Item name="fieldType" className="grow" rules={[requiredRule]}>
            <Select placeholder="Field Type" options={fieldOptions} />
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" className="w- bg-nomyx-blue-light hover:!bg-nomyx-dark1-light hover:dark:!bg-nomyx-dark1-dark">
              Add
            </Button>
          </Form.Item>
        </Form>

        {addedFields?.length > 0 && (
          <div>
            <h3>Added Fields:</h3>
            <table className="w-full text-left rounded-lg">
              <thead>
                <tr>
                  <th className="px-4 py-2">Field Name</th>
                  <th className="px-4 py-2">Field Type</th>
                </tr>
              </thead>
              <tbody>
                {addedFields.map((field, index) => (
                  <tr key={index} className="border rounded-lg border-nomyx-gray1-light dark:border-nomyx-gray4-dark">
                    <td className="px-4 py-2">{field.fieldName}</td>
                    <td className="px-4 py-2">{field.fieldType}</td>
                    <td className="px-4 py-2">
                      <button onClick={() => handleRemoveField(index)} className="text-red-500 hover:text-red-700">
                        <Trash className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
}
