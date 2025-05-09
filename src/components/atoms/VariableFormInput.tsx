import { useState } from "react";

import { UploadOutlined } from "@ant-design/icons";
import { Checkbox, DatePicker, Form, FormRule, Input, Select, Upload, Button } from "antd";
import dayjs from "dayjs";
import Parse from "parse";
import { toast } from "react-toastify";

interface VariableFormInputProps {
  type: string;
  name: string;
  label: string;
  prefix?: string;
  disabled?: boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
  value?: string;
  rules?: FormRule[];
  className?: string;
  placeHolder?: string;
}

export default function VariableFormInput({
  type,
  name,
  label,
  prefix,
  disabled,
  options,
  placeholder,
  value,
  rules,
  className,
  placeHolder,
}: VariableFormInputProps) {
  const form = Form.useFormInstance();
  const [fileList, setFileList] = useState<any[]>(() => {
    const existingValue = form?.getFieldValue(name);
    if (existingValue) {
      return [
        {
          uid: "-1",
          name: existingValue.split("/").pop() || "document",
          status: "done",
          url: existingValue,
        },
      ];
    }
    return [];
  });
  const inputStyle =
    "!bg-nomyx-dark2-light dark:!bg-nomyx-dark2-dark " +
    "text-nomyx-text-light dark:text-nomyx-text-dark " +
    "placeholder-nomyx-gray3-light dark:placeholder-nomyx-gray3-dark " +
    "focus:border-nomyx-main1-light dark:focus:border-nomyx-main1-dark " +
    "hover:border-nomyx-main1-light dark:hover:border-nomyx-main1-dark " +
    "border-nomyx-gray4-light dark:border-nomyx-gray4-dark";

  return (
    <div className={className}>
      {type === "checkbox" && (
        <Form.Item name={name}>
          <Checkbox className="text-nomyx-text-light dark:text-nomyx-text-dark">{label}</Checkbox>
        </Form.Item>
      )}
      {type === "date" && (
        <Form.Item
          name={name}
          label={label}
          rules={rules}
          getValueFromEvent={(e: any) => e?.format("MM/DD/YYYY")}
          getValueProps={(e: string) => ({
            value: e ? dayjs(e) : "",
          })}
        >
          <DatePicker className={inputStyle + " w-full"} placeholder={placeholder || placeHolder} disabled={disabled} format="MM/DD/YYYY" />
        </Form.Item>
      )}
      {type === "file" && (
        <Form.Item name={name} label={label} rules={rules}>
          <Upload
            name={name}
            listType="picture"
            className={inputStyle}
            maxCount={1}
            fileList={fileList}
            onChange={async ({ file }) => {
              if (file.status === "removed") {
                setFileList([]);
                form?.setFieldValue(name, undefined);
                return;
              }

              if (file.originFileObj) {
                try {
                  // Sanitize filename: remove special characters and spaces
                  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").toLowerCase();

                  const parseFile = new Parse.File(sanitizedName, file.originFileObj);
                  await parseFile.save();

                  const fileUrl = parseFile.url();

                  // Update form field with file URL
                  form?.setFieldValue(name, fileUrl);

                  // Update fileList with the Parse URL
                  setFileList([
                    {
                      uid: file.uid,
                      name: file.name,
                      status: "done",
                      url: fileUrl,
                    },
                  ]);

                  // toast.success("File uploaded successfully");
                } catch (error) {
                  toast.error("Error uploading file");
                  console.error("Upload error:", error);
                  setFileList([]);
                }
              }
            }}
            onPreview={(file) => {
              if (file.url) {
                window.open(file.url, "_blank");
              }
            }}
          >
            <Button icon={<UploadOutlined />} className="bg-nomyx-blue-light hover:!bg-nomyx-dark1-light hover:dark:!bg-nomyx-dark1-dark">
              {placeholder || placeHolder || "Upload"}
            </Button>
          </Upload>
        </Form.Item>
      )}
      {(type === "select" || type === "number" || type === "text") && (
        <Form.Item name={name} label={label} rules={rules}>
          {type === "select" && (
            <Select showSearch placeholder={placeholder || placeHolder} optionFilterProp="label" options={options} className={inputStyle} />
          )}
          {type !== "select" && (
            <Input
              disabled={disabled}
              prefix={prefix || null}
              type={type}
              placeholder={placeholder || placeHolder}
              name={name}
              className={inputStyle}
              value={value}
            />
          )}
        </Form.Item>
      )}
    </div>
  );
}
