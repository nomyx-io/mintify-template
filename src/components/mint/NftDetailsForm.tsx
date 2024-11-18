import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";

import { Card, Form, FormInstance } from "antd";
import { isEqual } from "lodash";
import { useRouter } from "next/router";

import { CustomerService } from "@/services/CustomerService";
import { Regex } from "@/utils/regex";

import VariableFormInput from "../atoms/VariableFormInput";

const requiredRule = { required: true, message: `This field is required.` };
const alphaNumericRule = {
  required: true,
  pattern: Regex.alphaNumeric,
  message: "Only alphanumeric characters are allowed.",
};
const numberRule = {
  required: true,
  pattern: Regex.numericWithDecimal,
  message: "This field must be a number.",
};

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
    }[]
  >([]);
  const [additionalFields, setAdditionalFields] = useState<NftDetailsInputField[]>([]);

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
        })) || []
      );
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  }, [api]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    const project = projectList.find((project) => project.id === projectId);
    if (project) {
      const projectFields = project.fields;
      const projectStartDate = project.startDate;
      if (projectStartDate) {
        form.setFieldsValue({ projectStartDate, projectId });
      }
      const additionalFields: NftDetailsInputField[] = JSON.parse(projectFields).map((field: any) => ({
        label: field.name,
        name: field.key,
        type: field.type,
      }));

      setAdditionalFields(additionalFields);
    }
  }, [form, projectId, projectList]);

  return (
    <Card
      title={<span className="text-nomyx-text-light dark:text-nomyx-text-dark">Token Details</span>}
      className="bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark border-nomyx-gray4-light dark:border-nomyx-gray4-dark"
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
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
            <VariableFormInput
              type="text"
              name="mintAddress"
              label="Mint To"
              placeholder="Enter Wallet Address"
              rules={[
                {
                  required: true,
                  pattern: Regex.ethereumAddress,
                  message: "This field must be an ethereum address.",
                },
              ]}
            />
            <VariableFormInput type="text" name="price" label="Price" placeholder="Enter Price" rules={[requiredRule, numberRule]} prefix="$" />
          </div>
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
                    placeholder={field.placeHolder}
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
