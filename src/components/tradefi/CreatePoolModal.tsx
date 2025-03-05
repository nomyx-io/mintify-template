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
        // New fields
        developmentMethod: values.developmentMethod,
        neweraScore: values.neweraScore,
        fundSize: values.fundSize,
        generation: values.generation,
        economics: values.economics,
        targetReturn: values.targetReturn,
        category: values.category,
        stage: values.stage,
        phase: values.phase,
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
          <div className="flex items-center justify-center">
            <Upload listType="picture-card" {...logoProps} accept="image/png,image/jpeg" className="upload-logo-button">
              {!logoFile && (
                <div className="upload-button-content">
                  <PlusOutlined style={{ fontSize: 20 }} />
                  <div style={{ marginTop: 4, fontSize: 14, fontWeight: 500 }}>Logo</div>
                  <div style={{ fontSize: 11, color: "#999" }}>PNG, JPEG only</div>
                  <div style={{ fontSize: 11, color: "#999" }}>Max file size is 1 MB</div>
                </div>
              )}
            </Upload>
          </div>
          <style jsx global>{`
            .upload-logo-button .ant-upload.ant-upload-select {
              width: 120px !important;
              height: 120px !important;
              border-radius: 50%;
              border: 2px dashed #d9d9d9;
              background-color: #fafafa;
              transition: all 0.3s;
            }
            .dark .upload-logo-button .ant-upload.ant-upload-select {
              border-color: #434343;
              background-color: #1f1f1f;
            }
            .upload-logo-button .ant-upload.ant-upload-select:hover {
              border-color: #3c89e8;
            }
            .upload-button-content {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100%;
              padding: 8px;
              text-align: center;
            }
          `}</style>
        </Form.Item>

        <Form.Item label="Cover Image" name="coverImage" rules={[{ required: true, message: "Please upload a cover image" }]}>
          <div className="flex items-center justify-center">
            <Upload listType="picture-card" {...coverProps} accept="image/png,image/jpeg" className="upload-cover-button">
              {!coverFile && (
                <div className="upload-button-content">
                  <PlusOutlined style={{ fontSize: 20 }} />
                  <div style={{ marginTop: 4, fontSize: 14, fontWeight: 500 }}>Cover Image</div>
                  <div style={{ fontSize: 11, color: "#999" }}>PNG, JPEG only</div>
                  <div style={{ fontSize: 11, color: "#999" }}>Max file size is 1 MB</div>
                </div>
              )}
            </Upload>
          </div>
          <style jsx global>{`
            .upload-cover-button .ant-upload.ant-upload-select {
              width: 240px !important;
              height: 135px !important;
              border-radius: 8px;
              border: 2px dashed #d9d9d9;
              background-color: #fafafa;
              transition: all 0.3s;
            }
            .dark .upload-cover-button .ant-upload.ant-upload-select {
              border-color: #434343;
              background-color: #1f1f1f;
            }
            .upload-cover-button .ant-upload.ant-upload-select:hover {
              border-color: #3c89e8;
            }
          `}</style>
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

        {/* New fields based on the image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item label="Development Method" name="developmentMethod" initialValue="50.00%">
            <Input placeholder="e.g. 52.53%" />
          </Form.Item>

          <Form.Item label="Newera Score" name="neweraScore" initialValue="3/5">
            <Select placeholder="Select score">
              <Option value="1/5">1/5</Option>
              <Option value="2/5">2/5</Option>
              <Option value="3/5">3/5</Option>
              <Option value="4/5">4/5</Option>
              <Option value="5/5">5/5</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Fund Size" name="fundSize" initialValue="100 M">
            <Input placeholder="e.g. 200 M" />
          </Form.Item>

          <Form.Item label="Generation" name="generation" initialValue="Q1">
            <Select placeholder="Select generation">
              <Option value="Q1">Q1</Option>
              <Option value="Q2">Q2</Option>
              <Option value="Q3">Q3</Option>
              <Option value="Q4">Q4</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Economics" name="economics" initialValue="2% - 15%">
            <Input placeholder="e.g. 2% - 20%" />
          </Form.Item>

          <Form.Item label="Target Return" name="targetReturn" initialValue="2-3x gross">
            <Input placeholder="e.g. 3-4x gross" />
          </Form.Item>

          <Form.Item label="Category" name="category" initialValue="Venture">
            <Select placeholder="Select category">
              <Option value="Venture">Venture</Option>
              <Option value="Growth">Growth</Option>
              <Option value="Seed">Seed</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Stage" name="stage" initialValue="Early/Venture">
            <Select placeholder="Select stage">
              <Option value="Early/Venture">Early/Venture</Option>
              <Option value="Mid/Growth">Mid/Growth</Option>
              <Option value="Early/Seed">Early/Seed</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Phase" name="phase" initialValue="Active">
            <Select placeholder="Select phase">
              <Option value="Active">Active</Option>
              <Option value="Closing soon">Closing soon</Option>
              <Option value="Fundraising">Fundraising</Option>
            </Select>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default CreatePoolModal;
