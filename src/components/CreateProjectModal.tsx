import {
  Button,
  Form,
  GetProp,
  Input,
  message,
  Modal,
  Upload,
  UploadFile,
  UploadProps,
} from 'antd';
import { useState } from 'react';
import ImageBoxFormItem from './molecules/ImageBox';
import { KronosService } from '@/services/KronosService';
import { toast } from 'react-toastify';
import { RcFile } from 'antd/es/upload';
import { useWalletAddress } from '@/context/WalletAddressContext';

interface CreateProjectModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface FormValues {
  logoUpload: UploadProps;
  coverImageUpload: UploadProps;
  title: string;
  description: string;
  registryURL: string;
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
}: CreateProjectModalProps) {
  const [form] = Form.useForm();
  const requiredRule = { required: true, message: 'This field is required.' };

  const api = KronosService();

  function handleModalCancel() {
    setOpen(false);
  }

  const onFinish = async (values: FormValues) => {
    console.log('Received values:', values);
    // setOpen(false);
    if (!values?.logoUpload?.fileList) {
      message.error('Please upload a logo');
      return;
    }
    if (!values?.coverImageUpload?.fileList) {
      message.error('Please upload a cover image');
      return;
    }

    const project = {
      title: values.title,
      description: values.description,
      registryURL: values.registryURL,
      logo: await getBase64(
        values.logoUpload.fileList[0].originFileObj as FileType
      ),
      coverImage: await getBase64(
        values.coverImageUpload.fileList[0].originFileObj as FileType
      ),
    };

    const saveApi = api.createProject(project);
    console.log('saveApi', await saveApi);

    toast.promise(saveApi, {
      success: 'Project saved successfully!', // Display this message when the promise is resolved
      error: 'Failed to save project!', // Display this message when the promise is rejected
    });

    // Submit form with the existing settings values
    form.setFieldsValue({});
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      title='Create New Project'
      onCancel={handleModalCancel}
      width={640}
      footer={[
        <Button key='back' className='w-[292px]' onClick={handleModalCancel}>
          Cancel
        </Button>,
        <Button
          key='submit'
          className='w-[292px] bg-[#3c89e8]'
          htmlType='submit'
          type='primary'>
          Create Project
        </Button>,
      ]}
      destroyOnClose
      modalRender={(dom) => (
        <Form
          form={form}
          name='modal_create_project_form'
          onFinish={onFinish}
          layout='vertical'>
          {dom}
        </Form>
      )}>
      <div className='flex flex-col'>
        <div className='flex w-full gap-5'>
          <ImageBoxFormItem
            label='Logo'
            name='logoUpload'
            className='min-w-40'
          />
          <ImageBoxFormItem label='Cover Image' name='coverImageUpload' className='w-full'/>
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
        <Form.Item
          rules={[requiredRule]}
          label='Registry URL'
          name='registryURL'>
          <Input placeholder='Add Registry URL' />
        </Form.Item>
      </div>
    </Modal>
  );
}
