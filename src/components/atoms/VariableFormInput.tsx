import { UploadOutlined } from "@ant-design/icons";
import { Checkbox, DatePicker, Form, FormInstance, FormRule, Input, Select, Upload, Button, message } from "antd";
import dayjs from "dayjs";

import ParseClient from "@/services/ParseClient";
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
  form?: FormInstance;
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
  form,
}: VariableFormInputProps) {
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
            accept=".pdf,.jpg,.jpeg,.png"
            beforeUpload={async (file) => {
              // Check file type
              const isValidType = file.type === "application/pdf" || file.type.startsWith("image/");
              if (!isValidType) {
                message.error("You can only upload PDF or image files!");
                return Upload.LIST_IGNORE;
              }

              // Check file size (5MB = 5 * 1024 * 1024 bytes)
              const maxSize = 5 * 1024 * 1024;
              if (file.size > maxSize) {
                message.error("File must be smaller than 5MB!");
                return Upload.LIST_IGNORE;
              }

              try {
                // Convert file to base64 for Parse
                const reader = new FileReader();
                const base64Promise = new Promise((resolve) => {
                  reader.onload = () => resolve(reader.result);
                });
                reader.readAsDataURL(file);
                const base64Data = await base64Promise;

                // Sanitize filename - remove special characters and spaces
                const timestamp = Date.now();
                const extension = file.name.split(".").pop();
                const sanitizedName = `file_${timestamp}.${extension}`;

                // Save file to Parse
                const parseFile = await ParseClient.saveFile(sanitizedName, { base64: (base64Data as string).split(",")[1] }, file.type);

                // Update form with Parse file URL
                const form = (file as any).form;
                if (form) {
                  form.setFields([
                    {
                      name,
                      value: parseFile.url(),
                    },
                  ]);
                }

                message.success("File uploaded successfully");
              } catch (error) {
                message.error("Failed to upload file");
                console.error("Upload error:", error);
              }

              return false; // Prevent default upload
            }}
          >
            <Button icon={<UploadOutlined />} className="bg-nomyx-blue-light hover:!bg-nomyx-dark1-light hover:dark:!bg-nomyx-dark1-dark">
              {placeholder || placeHolder || "Upload File"}
            </Button>
          </Upload>
          {form?.getFieldValue(name) && (
            <div className="mt-2">
              {form.getFieldValue(name).toLowerCase().endsWith(".pdf") ? (
                <iframe src={form.getFieldValue(name)} className="w-full h-64" />
              ) : (
                <img src={form.getFieldValue(name)} alt="Preview" className="max-w-full h-auto" />
              )}
            </div>
          )}
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
