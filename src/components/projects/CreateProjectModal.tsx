import {
  Button,
  Form,
  GetProp,
  Input,
  message,
  Modal,
  Select,
  UploadProps,
} from 'antd';
import ImageBoxFormItem from '../molecules/ImageBox';
import { KronosService } from '@/services/KronosService';
import { toast } from 'react-toastify';
import { useMemo, useState } from 'react';
import { Trash } from 'iconsax-react';
import { FormFinishInfo } from 'rc-field-form/es/FormContext';
import { Rule } from 'antd/es/form';

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
  additionalFields?: AddedField[];
}

interface AddedField {
  fieldName: string;
  fieldType: string;
}

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export default function CreateProjectModal({
  open,
  setOpen,
  onCreateSuccess,
}: CreateProjectModalProps) {
  const [form] = Form.useForm();
  const [addFieldForm] = Form.useForm();
  const [addedFields, setAddedFields] = useState<AddedField[]>([]);

  const requiredRule = { required: true, message: 'This field is required.' };
  const uniqueRule: Rule = ({ getFieldValue }) => ({
    validator(_, value: string) {
      if (
        value &&
        (addedFields.some(
          (field) => field.fieldName.toLowerCase() === value.toLowerCase()
        ) ||
          STANDARD_FIELDS.includes(value.toLowerCase()))
      ) {
        return Promise.reject(new Error('Field name must be unique!'));
      }
      return Promise.resolve();
    },
  });
  const fieldOptions = [
    { label: 'Text', value: 'text' },
    { label: 'Number', value: 'number' },
    { label: 'Date', value: 'date' },
  ];
  const STANDARD_FIELDS = [
    'title',
    'description',
    'date',
    'mint to',
    'project',
    'price',
  ];

  const api = useMemo(() => KronosService(), []);

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

  const onFormFinish = async (
    name: string,
    { values, forms }: FormFinishInfo
  ) => {
    if (name === 'addFieldForm') {
      const { createProjectForm } = forms;
      const fieldValues: AddedField[] =
        createProjectForm.getFieldValue('additionalFields') || [];

      const newFieldValues = [...fieldValues, values as AddedField];
      createProjectForm.setFieldsValue({ additionalFields: newFieldValues });
      setAddedFields(newFieldValues);
      addFieldForm.resetFields();
    }
    if (name === 'createProjectForm') {
      const savePromise = saveProject(values as FormValues);
      toast.promise(savePromise, {
        success: 'Project saved successfully!', // Display this message when the promise is resolved
        error: 'Failed to save project!', // Display this message when the promise is rejected
      });

      if (await savePromise) {
        onCreateSuccess && onCreateSuccess();
      }

      // Submit form with the existing settings values
      form.setFieldsValue({});
      setOpen(false);
    }
  };

  async function saveProject(values: FormValues) {
    if (!values?.logoUpload?.fileList) {
      message.error('Please upload a logo');
      return Promise.reject();
    }
    if (!values?.coverImageUpload?.fileList) {
      message.error('Please upload a cover image');
      return Promise.reject();
    }

    const project = {
      title: values.title,
      description: values.description,
      logo: await getBase64(
        values.logoUpload.fileList[0].originFileObj as FileType
      ),
      coverImage: await getBase64(
        values.coverImageUpload.fileList[0].originFileObj as FileType
      ),
      fields: JSON.stringify(values.additionalFields?.map((field) => {
        return {
          name: field.fieldName,
          type: field.fieldType,
          key: field.fieldName.replace(' ', '_').toLowerCase(),
        };
      })),
    };

    return api.createProject(project);
  }

  return (
    <Modal
      open={open}
      title='Create New Project'
      onCancel={handleModalCancel}
      width={640}
      footer={[
        <Button
          key='back'
          className='w-[292px] text-nomyx-text-light dark:text-nomyx-text-dark hover:!bg-nomyx-dark1-light hover:dark:!bg-nomyx-dark1-dark'
          onClick={handleModalCancel}>
          Cancel
        </Button>,
        <Button
          key='submit'
          className='w-[292px] bg-nomyx-blue-light hover:!bg-nomyx-dark1-light hover:dark:!bg-nomyx-dark1-dark'
          onClick={form.submit}>
          Create Project
        </Button>,
      ]}
      destroyOnClose
      modalRender={(dom) => (
        <Form.Provider onFormFinish={onFormFinish}>{dom}</Form.Provider>
      )}>
      <Form form={form} name='createProjectForm' layout='vertical'>
        <div className='flex flex-col'>
          <div className='flex w-full gap-5'>
            <ImageBoxFormItem
              label='Logo'
              name='logoUpload'
              className='min-w-40'
            />
            <ImageBoxFormItem
              label='Cover Image'
              name='coverImageUpload'
              className='w-full'
            />
          </div>
          <Form.Item rules={[requiredRule]} label='Title' name='title'>
            <Input placeholder='Add Project Title' />
          </Form.Item>
          <Form.Item
            rules={[requiredRule]}
            label='Description'
            name='description'>
            <Input.TextArea
              placeholder='Add Project Description'
              autoSize={{ minRows: 3, maxRows: 5 }}
            />
          </Form.Item>
          <Form.Item name='additionalFields' noStyle />
        </div>
      </Form>
      <span className=''>Add Token Metadata</span>
      <div className='flex flex-col p-2 gap-2 pb-4 mb-6 border rounded-md border-nomyx-dark1-dark dark:border-nomyx-gray4-dark'>
        <p className='text-xs'>
          Gemforce tokens come with some standard fields to be set upon minting
          a token. Any additional data fields that need to be associated with a
          token can be specified below.
        </p>
        <p className='text-xs'>
          Included fields:{' '}
          {STANDARD_FIELDS.map(
            (field, index) =>
              capitalizeEveryWord(field) +
              (index === STANDARD_FIELDS.length - 1 ? '' : ', ')
          )}
        </p>
        <Form name='addFieldForm' form={addFieldForm} className='flex gap-2'>
          <Form.Item
            name='fieldName'
            className='grow'
            rules={[requiredRule, uniqueRule]}>
            <Input placeholder='Field Name' />
          </Form.Item>
          <Form.Item name='fieldType' className='grow' rules={[requiredRule]}>
            <Select placeholder='Field Type' options={fieldOptions} />
          </Form.Item>
          <Form.Item>
            <Button
              htmlType='submit'
              className='w- bg-nomyx-blue-light hover:!bg-nomyx-dark1-light hover:dark:!bg-nomyx-dark1-dark'>
              Add
            </Button>
          </Form.Item>
        </Form>

        {addedFields?.length > 0 && (
          <div>
            <h3>Added Fields:</h3>
            <table className='w-full text-left rounded-lg'>
              <thead>
                <tr>
                  <th className='px-4 py-2'>Field Name</th>
                  <th className='px-4 py-2'>Field Type</th>
                </tr>
              </thead>
              <tbody>
                {addedFields.map((field, index) => (
                  <tr
                    key={index}
                    className='border rounded-lg border-nomyx-gray1-light dark:border-nomyx-gray4-dark'>
                    <td className='px-4 py-2'>{field.fieldName}</td>
                    <td className='px-4 py-2'>{field.fieldType}</td>
                    <td className='px-4 py-2'>
                      <button
                        onClick={() => handleRemoveField(index)}
                        className='text-red-500 hover:text-red-700'>
                        <Trash className='w-5 h-5' />
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
