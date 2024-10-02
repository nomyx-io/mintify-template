import React, { ChangeEvent } from "react";
import { Card, Form, FormInstance, Input } from "antd";
import Checkbox, { CheckboxChangeEvent } from "antd/lib/checkbox/Checkbox";

interface NftDetailsFormProps {
  fieldGroups: NftDetailsInputFieldGroup[];
  handleChange: (
    inputName: string,
    e: ChangeEvent<HTMLInputElement> | CheckboxChangeEvent
  ) => void;
  form: FormInstance;
  onFinish: () => void;
}

const NftDetailsForm = ({
  fieldGroups,
  handleChange,
  form,
  onFinish,
}: NftDetailsFormProps) => {
  //build initialValues object
  const initialValues: { [key: string]: unknown } = {};

  //iterate over field definitions and create a key on the initialValues
  // object with the field name as the key and the value of the field as the value
  fieldGroups.map((group: NftDetailsInputFieldGroup) => {
    group.fields.map((field: NftDetailsInputField) => {
      //add the field name as the key and the field value as the value to the initialValues object
      initialValues[field.name] = field.value;
    });
  });

  return (
    <Card
      title={
        <span className="text-nomyx-text-light dark:text-nomyx-text-dark">
          {" "}
          {"NBT Details"}
        </span>
      }
      className="bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark border-nomyx-gray4-light dark:border-nomyx-gray4-dark"
    >
      <Form
        form={form}
        initialValues={initialValues}
        layout="vertical"
        onFinish={onFinish}
      >
        <div className="flex flex-col divide-y divide-[#484848]">
          {fieldGroups.map(
            (group: NftDetailsInputFieldGroup, index: Number) => {
              return (
                <div
                  key={`group${index}`}
                  className="grid grid-cols-2 first:pt-0 gap-x-4 pt-6"
                >
                  {group.fields.map(
                    (field: NftDetailsInputField, index: Number) => {
                      return (
                        <div key={"field-" + index} className={field.className}>
                          {field.dataType === "checkbox" ? (
                            <Form.Item>
                              <Checkbox
                                onChange={(e) => handleChange(field.name, e)}
                                checked={!!field.value}
                                className="text-nomyx-text-light dark:text-nomyx-text-dark"
                              >
                                {field.label}
                              </Checkbox>
                            </Form.Item>
                          ) : (
                            <Form.Item
                              name={field.name}
                              label={
                                <span className="text-nomyx-text-light dark:text-nomyx-text-dark">
                                  {field.label}
                                </span>
                              }
                              rules={field.rules}
                            >
                              <Input
                                disabled={field.disabled}
                                prefix={field?.prefix || null}
                                type={field.dataType}
                                placeholder={field.placeHolder}
                                onChange={(e) => handleChange(field.name, e)}
                                name={field.name}
                                style={{
                                  colorScheme:
                                    field.dataType === "date"
                                      ? "dark"
                                      : undefined, // Default for other types
                                }}
                                className={`${
                                  form.getFieldError(field.name).length > 0
                                    ? "!bg-nomyx-dark2-light dark:!bg-nomyx-dark2-dark" // Different background on error if we want
                                    : "!bg-nomyx-dark2-light dark:!bg-nomyx-dark2-dark"
                                } text-nomyx-text-light dark:text-nomyx-text-dark placeholder-nomyx-gray3-light dark:placeholder-nomyx-gray3-dark focus:border-nomyx-main1-light dark:focus:border-nomyx-main1-dark hover:border-nomyx-main1-light dark:hover:border-nomyx-main1-dark border-nomyx-gray4-light dark:border-nomyx-gray4-dark ${
                                  field.dataType == "date"
                                    ? "dark:![color-scheme:auto]" // Tailwind class for color-scheme handling
                                    : ""
                                }`}
                              />
                            </Form.Item>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              );
            }
          )}
        </div>
      </Form>
    </Card>
  );
};

export default NftDetailsForm;
