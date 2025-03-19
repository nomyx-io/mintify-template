import { useEffect, useState } from "react";

import { UploadOutlined } from "@ant-design/icons";
import { Checkbox, DatePicker, Form, FormRule, Input, Select, Upload, Button, message } from "antd";
import dayjs from "dayjs";
import Parse from "parse";

import { useFileUpload } from "../../context/FileUploadContext";

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
  const [fileList, setFileList] = useState<any[]>([]);
  const { addFileUpload, getFileUpload, removeFileUpload } = useFileUpload();
  const formId = `${name}-file`;

  useEffect(() => {
    // Restore file from context if it exists
    const savedFile = getFileUpload(formId);
    if (savedFile) {
      setFileList([
        {
          uid: "-1",
          name: savedFile.fileName,
          status: "done",
          url: savedFile.fileUrl,
        },
      ]);
      form?.setFieldValue(name, savedFile.fileUrl);
    }
  }, [formId, name, form, getFileUpload]);

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
            beforeUpload={async (file) => {
              try {
                // Sanitize filename: remove special characters and spaces
                const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").toLowerCase();

                const parseFile = new Parse.File(sanitizedName, file);
                await parseFile.save();

                const fileUrl = parseFile.url();

                // Store file in context and update form
                addFileUpload(formId, name, file.name, fileUrl);
                form?.setFieldValue(name, fileUrl);
                setFileList([
                  {
                    uid: file.uid,
                    name: file.name,
                    status: "done",
                    url: fileUrl,
                  },
                ]);

                message.success("File uploaded successfully");
                return false; // Prevent default upload
              } catch (error) {
                message.error("Error uploading file");
                console.error("Upload error:", error);
                return false;
              }
            }}
            onChange={({ file }) => {
              if (file.status === "removed") {
                setFileList([]);
                form?.setFieldValue(name, undefined);
                removeFileUpload(formId);
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
