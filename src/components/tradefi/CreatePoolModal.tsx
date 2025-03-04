import React, { useState } from "react";

import { PlusOutlined } from "@ant-design/icons";
import { Modal, Form, Input, DatePicker, Select, Upload, message } from "antd";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import moment from "moment";

import { TradeFinanceService } from "@/services/TradeFinanceService";

const { TextArea } = Input;
const { Option } = Select;

interface CreatePoolModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onCreateSuccess: () => void;
}

const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const CreatePoolModal: React.FC<CreatePoolModalProps> = ({ open, setOpen, onCreateSuccess }) => {
  const [form] = Form.useForm();
  const [logoFile, setLogoFile] = useState<UploadFile | null>(null);
  const [coverFile, setCoverFile] = useState<UploadFile | null>(null);
  const [loading, setLoading] = useState(false);

  const tradeFinanceService = TradeFinanceService();

  const handleCancel = () => {
    form.resetFields();
    setLogoFile(null);
    setCoverFile(null);
    setOpen(false);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // For mock implementation, we'll use placeholder images instead of actual uploads
      // In a real implementation, we would convert files to base64 and upload them

      // Create pool with mock data
      await tradeFinanceService.createTradeFiPool({
        title: values.title,
        description: values.description,
        // Use placeholder images for mock implementation
        logo: `https://via.placeholder.com/150/${Math.floor(Math.random() * 16777215).toString(16)}/FFFFFF?text=${values.title.charAt(0)}`,
        coverImage: `https://via.placeholder.com/800x400/${Math.floor(Math.random() * 16777215).toString(16)}/FFFFFF?text=${values.title}`,
        creditType: values.creditType,
        maturityDate: values.maturityDate.toDate(),
      });

      message.success("Pool created successfully");
      handleCancel();
      onCreateSuccess();
    } catch (error) {
      console.error("Failed to create pool:", error);
      message.error("Failed to create pool");
    } finally {
      setLoading(false);
    }
  };

  const logoProps: UploadProps = {
    beforeUpload: (file) => {
      const isPNG = file.type === "image/png" || file.type === "image/jpeg";
      if (!isPNG) {
        message.error(`${file.name} is not a PNG or JPEG file`);
        return Upload.LIST_IGNORE;
      }
      const isLt1M = file.size / 1024 / 1024 < 1;
      if (!isLt1M) {
        message.error("Image must be smaller than 1MB!");
        return Upload.LIST_IGNORE;
      }
      setLogoFile(file as UploadFile);
      return false;
    },
    fileList: logoFile ? [logoFile] : [],
    onRemove: () => {
      setLogoFile(null);
    },
  };

  const coverProps: UploadProps = {
    beforeUpload: (file) => {
      const isPNG = file.type === "image/png" || file.type === "image/jpeg";
      if (!isPNG) {
        message.error(`${file.name} is not a PNG or JPEG file`);
        return Upload.LIST_IGNORE;
      }
      const isLt1M = file.size / 1024 / 1024 < 1;
      if (!isLt1M) {
        message.error("Image must be smaller than 1MB!");
        return Upload.LIST_IGNORE;
      }
      setCoverFile(file as UploadFile);
      return false;
    },
    fileList: coverFile ? [coverFile] : [],
    onRemove: () => {
      setCoverFile(null);
    },
  };

  return (
    <Modal
      title="Create New Pool"
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      okText="Create Pool"
      confirmLoading={loading}
      okButtonProps={{ className: "bg-[#3c89e8]" }}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Logo" name="logo" rules={[{ required: true, message: "Please upload a logo" }]}>
          <Upload listType="picture-card" {...logoProps} accept="image/png,image/jpeg">
            {!logoFile && (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
                <div style={{ fontSize: 12, color: "#999" }}>PNG, JPEG only</div>
                <div style={{ fontSize: 12, color: "#999" }}>Max file size is 1 MB</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        <Form.Item label="Cover Image" name="coverImage" rules={[{ required: true, message: "Please upload a cover image" }]}>
          <Upload listType="picture-card" {...coverProps} accept="image/png,image/jpeg">
            {!coverFile && (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
                <div style={{ fontSize: 12, color: "#999" }}>PNG, JPEG only</div>
                <div style={{ fontSize: 12, color: "#999" }}>Max file size is 1 MB</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        <Form.Item label="Title" name="title" rules={[{ required: true, message: "Please enter a title" }]}>
          <Input placeholder="Enter pool title" />
        </Form.Item>

        <Form.Item label="Description" name="description" rules={[{ required: true, message: "Please enter a description" }]}>
          <TextArea placeholder="Enter pool description" autoSize={{ minRows: 3, maxRows: 6 }} />
        </Form.Item>

        <Form.Item label="Credit Type" name="creditType" rules={[{ required: true, message: "Please select a credit type" }]}>
          <Select placeholder="Select credit type">
            <Option value="Trade Finance Invoice">Trade Finance Invoice</Option>
            <Option value="Supply Chain Finance">Supply Chain Finance</Option>
            <Option value="Accounts Receivable">Accounts Receivable</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Maturity Date" name="maturityDate" rules={[{ required: true, message: "Please select a maturity date" }]}>
          <DatePicker className="w-full" disabledDate={(current) => current && current < moment().startOf("day")} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreatePoolModal;
