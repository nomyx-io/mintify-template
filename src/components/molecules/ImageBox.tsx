"use client";

import React, { ChangeEvent, useRef, useState } from "react";

import { Button, Form, GetProp, Input, InputRef, message, Upload, UploadProps } from "antd";
import { DraggerProps, UploadFile } from "antd/es/upload";
import { DocumentUpload, Trash } from "iconsax-react";
import Image from "next/image";

interface ImageBoxProps {
  height?: number;
  label?: string;
  name?: string;
  className?: string;
}

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const ImageBoxFormItem = ({ height, label, name, className }: ImageBoxProps) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewImage, setPreviewImage] = useState<string>("");

  const beforeUpload = (file: File) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
    }
    const isLt2M = file.size / 1024 / 1024 <= 1;
    if (!isLt2M) {
      message.error("Image must smaller than 1MB!");
    }
    return (isJpgOrPng && isLt2M) || Upload.LIST_IGNORE;
  };

  const handleChange: UploadProps["onChange"] = (info: UploadProps) => {
    const newFileList = info.fileList?.slice(-1);

    if (!newFileList) return;

    setFileList(newFileList || []);
    setPreview(newFileList[0]);
  };

  const setPreview = async (file: UploadFile) => {
    if (!file) {
      setPreviewImage("");
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

  const rules = [{ required: true, message: "This is required" }];

  return (
    <Form.Item rules={rules} label={label} name={name} className={`${className || ""} text-nomyx-text-light dark:text-nomyx-text-dark`}>
      <Upload.Dragger {...UploadProps} className="">
        {previewImage ? (
          <Image src={previewImage} alt="preview" fill className="object-contain rounded-lg" />
        ) : (
          <div className="text-xs flex flex-col items-center justify-center">
            <div className="mb-3">
              <p className="!text-nomyx-gray3-light dark:!text-nomyx-gray3-dark ">Drop Image here , or</p>
              <Button
                type="text"
                className="flex cursor-pointer z-[100] gap-1 items-center justify-center w-full text-nomyx-text-light dark:text-nomyx-text-dark hover:!text-nomyx-blue-light"
              >
                <DocumentUpload size="24" />
                <span>Select File</span>
              </Button>
            </div>
            <p className="!text-nomyx-gray3-light dark:!text-nomyx-gray3-dark ">PNG, JPEG only</p>
            <p className="!text-nomyx-gray3-light dark:!text-nomyx-gray3-dark ">Max file size is 1 MB</p>
          </div>
        )}
      </Upload.Dragger>
    </Form.Item>
  );
};

export default ImageBoxFormItem;
