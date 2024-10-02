"use client";

import React, { ChangeEvent } from "react";
import { Card, Input } from "antd";
import Image from "next/image";

interface ImageBoxProps {
  file?: string;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  previewPage?: boolean;
}

const ImageBox = ({
  file,
  handleChange,
  previewPage = false,
}: ImageBoxProps) => {
  return (
    <Card
      title="NFT Image Upload"
      className="no-padding bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark border-nomyx-gray4-light dark:border-nomyx-gray4-dark"
    >
      <div className="p-4 h-auto">
        <Input
          accept="image/png, image/gif, image/jpeg"
          onChange={(e) => handleChange(e)}
          type="file"
          className={"opacity-0 outline-none border-none rounded-none"}
          crossOrigin={undefined}
        />

        <div className="mb-1 rounded-none -mt-[35px] text-center text-sm p-2 font-medium text-nomyx-text-light dark:text-nomyx-text-dark">
          Upload or Drag Image
        </div>

        <p className="text-red-500 text-center text-xs font-medium">
          Note: This Section will display a preview of the image you just
          uploaded
        </p>

        <div
          className={`relative ${
            previewPage ? "h-[320px]" : "h-[230px]"
          } p-2 flex flex-col justify-center items-center mt-1 min-w-[100px]`}
        >
          {file && (
            <Image
              src={file}
              alt=""
              style={{ objectFit: "contain", maxHeight: "100%" }}
              fill
            />
          )}
        </div>
      </div>
    </Card>
  );
};

export default ImageBox;
