import React, { ChangeEvent } from 'react';
import { Card, Form, FormInstance, Input } from 'antd';
import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox/Checkbox';

interface NftDetailsFormProps {
  fieldGroups: NftDetailsInputFieldGroup[];
  handleChange: (inputName: string, e: ChangeEvent<HTMLInputElement> | CheckboxChangeEvent) => void;
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
  const initialValues: any = {};

  //iterate over field definitions and create a key on the initialValues
  // object with the field name as the key and the value of the field as the value
  fieldGroups.map((group: any) => {
    group.fields.map((field: any) => {
      //some of fields are nested in arrays, so we need to handle them differently
      if (typeof field.value == 'object') {
        //for each nested field
        field.value.map((field: any) => {
          //add the field name as the key and the field value as the value to the initialValues object
          initialValues[field.name] = field.value;
        });
        //for fields that are NOT nested in arrays
      } else {
        //add the field name as the key and the field value as the value to the initialValues object
        initialValues[field.name] = field.value;
      }
    });
  });

  return (
    <Card title='NBT Details'>
      <Form
        form={form}
        initialValues={initialValues}
        layout='vertical'
        onFinish={onFinish}>
        <div className='flex flex-col divide-y divide-[#484848]'>
          {fieldGroups.map((group: NftDetailsInputFieldGroup, index: Number) => {
            return (
              <div
                key={`group${index}`}
                className='grid grid-cols-2 first:pt-0 gap-x-4 pt-6'>
                {group.fields.map((field: NftDetailsInputField, index: Number) => {
                  return (
                    <div key={'field-' + index} className={field.className}>
                      {field.dataType === 'checkbox' ? (
                        <Form.Item>
                          <Checkbox
                            onChange={(e) => handleChange(field.name, e)}
                            checked={!!field.value}
                            className='text-gray-400'>
                            {field.label}
                          </Checkbox>
                        </Form.Item>
                      ) : (
                        <Form.Item
                          name={field.name}
                          label={field.label}
                          
                          rules={field.rules}>
                          <Input
                            disabled={field.disabled}
                            prefix={field?.prefix || null}
                            type={field.dataType}
                            placeholder={field.placeHolder}
                            onChange={(e) => handleChange(field.name, e)}
                            name={field.name}
                          />
                        </Form.Item>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </Form>
    </Card>
  );
};

export default NftDetailsForm;
