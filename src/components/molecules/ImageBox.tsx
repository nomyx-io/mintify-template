'use client';

import React, { ChangeEvent, useRef, useState } from 'react';
import {
  Button,
  Form,
  GetProp,
  Input,
  InputRef,
  message,
  Upload,
  UploadProps,
} from 'antd';
import Image from 'next/image';
import { DocumentUpload, Trash } from 'iconsax-react';
import { DraggerProps, UploadFile } from 'antd/es/upload';

interface ImageBoxProps {
  height?: number;
  label?: string;
  name?: string;
  className?: string;
}

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const ImageBoxFormItem = ({
  height,
  label,
  name,
  className,
}: ImageBoxProps) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewImage, setPreviewImage] = useState<string>('');

  const beforeUpload = (file: File) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 <= 1;
    if (!isLt2M) {
      message.error('Image must smaller than 1MB!');
    }
    return (isJpgOrPng && isLt2M) || Upload.LIST_IGNORE;
  };

  const handleChange: UploadProps['onChange'] = (info: UploadProps) => {
    const newFileList = info.fileList?.slice(-1);

    if (!newFileList) return;

    setFileList(newFileList || []);
    setPreview(newFileList[0]);
  };

  const setPreview = async (file: UploadFile) => {
    if (!file) {
      setPreviewImage('');
      return;
    }
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
  };

  const UploadProps: DraggerProps = {
    beforeUpload: (file: File) => beforeUpload(file),
    height: height || 160,
    onChange: (info) => {
      handleChange(info);
    },
    fileList: fileList,
    maxCount: 1,
  };

  const rules = [{ required: true, message: 'This is required' }];

  return (
    <Form.Item
      rules={rules}
      label={label}
      name={name}
      className={className}>
      <Upload.Dragger {...UploadProps}>
        {previewImage ? (
          <Image
            src={previewImage}
            alt='preview'
            fill
            className='object-contain rounded-lg'
          />
        ) : (
          <div className='text-[#878787] text-xs flex flex-col items-center justify-center'>
            <div className=' mb-2 space-y-2'>
              <p>Drop Image here , or</p>
              <Button className='flex cursor-pointer z-[100] gap-1 text-white items-center justify-center w-full'>
                <DocumentUpload size='24' />
                <span>Select File</span>
              </Button>
            </div>
            <p>PNG, JPEG only</p>
            <p>Max file size is 1 MB</p>
          </div>
        )}
      </Upload.Dragger>
    </Form.Item>
  );
};

export default ImageBoxFormItem;


{/* <Card
  title='NFT Image Upload'
  className='no-padding bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark border-nomyx-gray4-light dark:border-nomyx-gray4-dark'>
  <div className='p-4 h-auto'>
    <Input
      accept='image/png, image/gif, image/jpeg'
      onChange={(e) => handleChange(e)}
      type='file'
      className={'opacity-0 outline-none border-none rounded-none'}
      crossOrigin={undefined}
    />

    <div className='mb-1 rounded-none -mt-[35px] text-center text-sm p-2 font-medium text-nomyx-text-light dark:text-nomyx-text-dark'>
      Upload or Drag Image
    </div>

    <p className='text-red-500 text-center text-xs font-medium'>
      Note: This Section will display a preview of the image you just uploaded
    </p>

    <div
      className={`relative ${
        previewPage ? 'h-[320px]' : 'h-[230px]'
      } p-2 flex flex-col justify-center items-center mt-1 min-w-[100px]`}>
      {file && (
        <Image
          src={file}
          alt=''
          style={{ objectFit: 'contain', maxHeight: '100%' }}
          fill
        />
      )}
    </div>
  </div>
</Card>; */}