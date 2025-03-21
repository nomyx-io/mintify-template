import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";

import { Card, Form, FormInstance, Radio, FormRule } from "antd";
import { useRouter } from "next/router";

import {
  Industries,
  carbonCreditFields,
  tradeFinanceFields,
  tokenizedDebtFields,
  tradeFinanceStockInfoFields,
  tradeFinanceDocumentationFields,
} from "@/constants/constants";
import { requiredRule, numberRule, alphaNumericRule, walletAddressRule } from "@/constants/rules";
import { CustomerService } from "@/services/CustomerService";
import { Regex } from "@/utils/regex";

import VariableFormInput from "../atoms/VariableFormInput";

interface NftDetailsInputField {
  label: string;
  name: string;
  type: string;
  placeHolder?: string;
  rules?: FormRule[];
  disabled?: boolean;
  prefix?: string;
  options?: { label: string; value: string }[];
  className?: string;
}

interface NftDetailsFormProps {
  form: FormInstance;
  onFinish: (values: any) => void;
}

const NftDetailsForm = ({ form, onFinish }: NftDetailsFormProps) => {
  const api = useMemo(() => CustomerService(), []);

  const router = useRouter();

  const [projectId, setProjectId] = useState(router.query.projectId as string);
  const [projectList, setProjectList] = useState<
    {
      id: string;
      title: string;
      startDate: string;
      fields: string;
      industryTemplate: string;
      tradeDealId?: number;
    }[]
  >([]);

  const [registeredUserList, setRegisteredUserList] = useState<{ walletAddress: string; email: string }[]>([]);

  const [additionalFields, setAdditionalFields] = useState<NftDetailsInputField[]>([]);
  const [mintToType, setMintToType] = useState<"registered" | "new">("registered");

  Form.useWatch((values) => {
    if (values.projectId && values.projectId !== projectId) {
      setProjectId(values.projectId);
    }
  }, form);

  const fetchProjects = useCallback(async () => {
    try {
      const projects = await api.getProjects();
      setProjectList(
        projects?.map((project) => ({
          id: project.id,
          title: project.attributes.title,
          startDate: project.createdAt.toLocaleDateString(),
          fields: project.attributes.fields,
          industryTemplate: project.attributes.industryTemplate,
          tradeDealId: project.attributes.tradeDealId,
        })) || []
      );
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  }, [api]);

  const fetchRegisteredUsers = useCallback(async () => {
    try {
      const users = await api.getIdentityRegisteredUser();
      setRegisteredUserList(
        users?.users.map((user: any) => ({
          walletAddress: user.walletAddress,
          email: user.email,
        })) || []
      );
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  }, [api]);

  useEffect(() => {
    fetchProjects();
    fetchRegisteredUsers();
  }, [fetchProjects, fetchRegisteredUsers]);

  const [showTradeFinanceFields, setShowTradeFinanceFields] = useState(false);

  useEffect(() => {
    const project = projectList.find((project) => project.id === projectId);
    if (project) {
      const projectFields = project.fields;
      const projectStartDate = project.startDate;
      if (projectStartDate) {
        form.setFieldsValue({
          projectStartDate,
          projectId,
          tradeDealId: project.tradeDealId,
        });
      }

      let fields: NftDetailsInputField[] = [];
      if (projectFields) {
        fields = JSON.parse(projectFields).map((field: any) => ({
          label: field.name,
          name: field.key,
          type: field.type,
        }));
      }

      // Set showTradeFinanceFields based on the project's industry template
      setShowTradeFinanceFields(project.industryTemplate === Industries.TRADE_FINANCE);

      switch (project.industryTemplate) {
        case Industries.CARBON_CREDIT:
          fields = [...fields, ...carbonCreditFields];
          break;
        case Industries.TOKENIZED_DEBT:
          break;
        case Industries.TRADE_FINANCE:
          fields = [...fields, ...tradeFinanceFields];
          break;
        default:
          break;
      }

      setAdditionalFields(fields);
    }
  }, [form, projectId, projectList]);

  const handleMintToChange = (e: any) => {
    setMintToType(e.target.value);
  };

  return (
    <Card
      title={<span className="text-nomyx-text-light dark:text-nomyx-text-dark">Token Details</span>}
      className="bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark border-nomyx-gray4-light dark:border-nomyx-gray4-dark"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => onFinish({ ...values, industryTemplate: projectList.find((p) => p.id === projectId)?.industryTemplate })}
      >
        <div className="flex flex-col divide-y divide-[#484848]">
          <div className="grid grid-cols-2 first:pt-0 gap-x-4 pt-6">
            <p className="col-span-2 font-bold pb-6">Details</p>
            <VariableFormInput
              type="text"
              name="nftTitle"
              label="Title"
              placeholder="Enter Token Title"
              rules={[requiredRule, alphaNumericRule, { max: 30 }]}
            />
            <VariableFormInput
              type="text"
              name="description"
              label="Description"
              placeholder="Add a description for the NFT"
              rules={[requiredRule, { max: 256 }]}
            />
            <VariableFormInput
              type="select"
              name="projectId"
              label="Project"
              placeholder="Select Project"
              rules={[requiredRule]}
              options={
                projectList.map((project) => ({
                  label: project.title,
                  value: project.id,
                })) || []
              }
            />
            <VariableFormInput type="text" name="projectStartDate" label="Project Start Date" placeholder="mm/dd/yyyy" disabled={true} />
            <div className="flex flex-col">
              <Form.Item label="Mint To" required>
                <Radio.Group onChange={handleMintToChange} value={mintToType}>
                  <Radio value="registered">Registered Identity</Radio>
                  <Radio value="new">New Address</Radio>
                </Radio.Group>
              </Form.Item>
              {mintToType === "registered" && (
                <VariableFormInput
                  type="select"
                  name="mintAddress"
                  label=""
                  placeholder="Enter Wallet Address"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                  options={
                    registeredUserList.map((user) => ({
                      label: user.email,
                      value: user.walletAddress,
                    })) || []
                  }
                />
              )}
              {mintToType === "new" && (
                <VariableFormInput type="text" name="mintAddress" label="" placeholder="Enter Wallet Address" rules={[walletAddressRule]} />
              )}
            </div>
            <VariableFormInput type="text" name="price" label="Price" placeholder="Enter Price" rules={[requiredRule, numberRule]} prefix="$" />
          </div>

          {/* Stock Information Section for Trade Finance */}
          {showTradeFinanceFields && (
            <div className="grid grid-cols-2 first:pt-0 gap-x-4 pt-6">
              <p className="col-span-2 font-bold pb-6">Stock Information</p>
              {tradeFinanceStockInfoFields.map((field, index) => (
                <VariableFormInput
                  key={`stock-info-${index}`}
                  name={field.name}
                  label={field.label}
                  type={field.type}
                  rules={field.rules ?? [requiredRule]}
                  disabled={field.disabled}
                  prefix={field.prefix || ""}
                  placeHolder={field.placeHolder}
                  options={field.options}
                  className={field.className}
                />
              ))}
            </div>
          )}

          {/* Related Documentation Section for Trade Finance */}
          {showTradeFinanceFields && (
            <div className="grid grid-cols-2 first:pt-0 gap-x-4 pt-6">
              <p className="col-span-2 font-bold pb-6">Related Documentation</p>
              {tradeFinanceDocumentationFields.map((field, index) => (
                <VariableFormInput
                  key={`documentation-${index}`}
                  name={field.name}
                  label={field.label}
                  type={field.type}
                  rules={field.rules ?? [requiredRule]}
                  disabled={field.disabled}
                  prefix={field.prefix || ""}
                  placeHolder={field.placeHolder}
                  options={field.options}
                  className={field.className}
                />
              ))}
            </div>
          )}

          {additionalFields.length > 0 && (
            <div className="grid grid-cols-2 first:pt-0 gap-x-4 pt-6">
              <p className="col-span-2 font-bold pb-6">Token Fields</p>
              {additionalFields.map((field: NftDetailsInputField, index: Number) => {
                return (
                  <VariableFormInput
                    key={"field-" + index}
                    name={field.name}
                    label={field.label}
                    type={field.type}
                    rules={field.rules ?? [requiredRule]}
                    disabled={field.disabled}
                    prefix={field?.prefix || ""}
                    placeHolder={field.placeHolder}
                    options={field.options}
                    className={field.className}
                  />
                );
              })}
            </div>
          )}
        </div>
      </Form>
    </Card>
  );
};

export default NftDetailsForm;
