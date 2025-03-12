import { UploadOutlined } from "@ant-design/icons";
import { Checkbox, DatePicker, Form, FormRule, Input, Select, Upload, Button, message } from "antd";
import dayjs from "dayjs";

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
            listType="text"
            className={inputStyle}
            maxCount={1}
            accept=".pdf"
            beforeUpload={(file) => {
              const isPDF = file.type === "application/pdf";
              if (!isPDF) {
                message.error("You can only upload PDF files!");
                return Upload.LIST_IGNORE;
              }
              return false; // Prevent auto upload but allow file to be added to list
            }}
          >
            <Button icon={<UploadOutlined />} className="bg-nomyx-blue-light hover:!bg-nomyx-dark1-light hover:dark:!bg-nomyx-dark1-dark">
              {placeholder || placeHolder || "Upload PDF"}
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
