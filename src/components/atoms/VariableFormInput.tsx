import { Checkbox, DatePicker, Form, FormRule, Input, Select } from 'antd';
import dayjs from 'dayjs';

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
}: VariableFormInputProps) {
  const inputStyle =
    '!bg-nomyx-dark2-light dark:!bg-nomyx-dark2-dark ' +
    'text-nomyx-text-light dark:text-nomyx-text-dark ' +
    'placeholder-nomyx-gray3-light dark:placeholder-nomyx-gray3-dark ' +
    'focus:border-nomyx-main1-light dark:focus:border-nomyx-main1-dark ' +
    'hover:border-nomyx-main1-light dark:hover:border-nomyx-main1-dark ' +
    'border-nomyx-gray4-light dark:border-nomyx-gray4-dark';

  return (
    <div className={className}>
      {type === 'checkbox' && (
        <Form.Item name={name}>
          <Checkbox className='text-nomyx-text-light dark:text-nomyx-text-dark'>
            {label}
          </Checkbox>
        </Form.Item>
      )}
      {type === 'date' && (
        <Form.Item
          name={name}
          label={label}
          rules={rules}
          getValueFromEvent={(e: any) => e?.format('MM/DD/YYYY')}
          getValueProps={(e: string) => ({
            value: e ? dayjs(e) : '',
          })}>
          <DatePicker
            className={inputStyle + ' w-full'}
            placeholder={placeholder}
            disabled={disabled}
            format='MM/DD/YYYY'
          />
        </Form.Item>
      )}
      {(type === 'select' || type === 'number' || type === 'text') && (
        <Form.Item name={name} label={label} rules={rules}>
          {type === 'select' && (
            <Select
              showSearch
              placeholder={placeholder}
              optionFilterProp='label'
              options={options}
              className={inputStyle}
            />
          )}
          {type !== 'select' && (
            <Input
              disabled={disabled}
              prefix={prefix || null}
              type={type}
              placeholder={placeholder}
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
