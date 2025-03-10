import React, { useState } from "react";

import { UploadOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, Select, DatePicker, Typography, Upload, message } from "antd";
import {
  ArrowLeft2,
  TextBold,
  TextItalic,
  TextUnderline,
  TextBlock,
  TextalignLeft,
  TextalignCenter,
  TextalignRight,
  TextalignJustifycenter,
  Link1,
  TextalignLeft as ListIcon,
  Menu,
} from "iconsax-react";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface StockCertificateFormProps {
  onSubmit: (values: any) => void;
}

const StockCertificateForm: React.FC<StockCertificateFormProps> = ({ onSubmit }) => {
  const [form] = Form.useForm();
  const [shortDescriptionLength, setShortDescriptionLength] = useState(0);

  const handleFinish = (values: any) => {
    onSubmit(values);
  };

  const handleShortDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setShortDescriptionLength(e.target.value.length);
  };

  const uploadProps = {
    name: "file",
    action: "https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188",
    headers: {
      authorization: "authorization-text",
    },
    accept: "application/pdf",
    beforeUpload: (file: any) => {
      const isPDF = file.type === "application/pdf";
      if (!isPDF) {
        message.error(`${file.name} is not a PDF file. Only PDF files are allowed.`);
      }
      return isPDF || Upload.LIST_IGNORE;
    },
    onChange(info: any) {
      if (info.file.status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === "done") {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  return (
    <div>
      <Card className="bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark mb-4">
        <Title level={5} className="text-nomyx-text-light dark:text-nomyx-text-dark mb-4">
          Details
        </Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{
            tokenType: "venture",
            stage: "early",
            market: "US",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div>
              <div className="mb-6">
                <Text className="text-nomyx-text-light dark:text-nomyx-text-dark">Token Small Logo</Text>
                <div className="border border-dashed border-gray-300 rounded-lg p-6 mt-2 text-center">
                  <p className="text-gray-500">Drop image here, or</p>
                  <Button icon={<ArrowLeft2 size={16} />} className="mt-2">
                    Select File
                  </Button>
                  <p className="text-gray-500 text-xs mt-2">
                    PNG, JPEG only
                    <br />
                    Max file size is 1 MB
                  </p>
                </div>
              </div>

              <Form.Item
                name="title"
                label={<span className="text-nomyx-text-light dark:text-nomyx-text-dark">* Title</span>}
                rules={[{ required: true, message: "Please input the title!" }]}
              >
                <Input
                  placeholder="Add Title"
                  className="bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark text-nomyx-text-light dark:text-nomyx-text-dark"
                />
              </Form.Item>

              <Form.Item
                name="fullDescription"
                label={<span className="text-nomyx-text-light dark:text-nomyx-text-dark">* Full Description</span>}
                rules={[{ required: true, message: "Please input the full description!" }]}
              >
                <div>
                  <div className="bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark p-2 mb-2 flex items-center space-x-2 rounded-t-md">
                    <Button type="text" icon={<TextBold size={20} />} />
                    <Button type="text" icon={<TextItalic size={20} />} />
                    <Button type="text" icon={<TextUnderline size={20} />} />
                    <Button type="text" icon={<TextBlock size={20} />} />
                    <div className="border-l border-gray-500 h-6 mx-1"></div>
                    <Button type="text" icon={<TextalignLeft size={20} />} />
                    <Button type="text" icon={<TextalignCenter size={20} />} />
                    <Button type="text" icon={<TextalignRight size={20} />} />
                    <Button type="text" icon={<TextalignJustifycenter size={20} />} />
                    <div className="border-l border-gray-500 h-6 mx-1"></div>
                    <Button type="text" icon={<ListIcon size={20} />} />
                    <Button type="text" icon={<Menu size={20} />} />
                    <div className="flex-grow"></div>
                    <Button type="text" icon={<Link1 size={20} />} />
                  </div>
                  <TextArea
                    placeholder="Write your description here..."
                    autoSize={{ minRows: 6, maxRows: 10 }}
                    className="bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark text-nomyx-text-light dark:text-nomyx-text-dark rounded-t-none"
                  />
                </div>
              </Form.Item>
            </div>

            {/* Right Column */}
            <div>
              <div className="mb-6">
                <Text className="text-nomyx-text-light dark:text-nomyx-text-dark">Token Full Logo</Text>
                <div className="border border-dashed border-gray-300 rounded-lg p-6 mt-2 text-center">
                  <p className="text-gray-500">Drop image here, or</p>
                  <Button icon={<ArrowLeft2 size={16} />} className="mt-2">
                    Select File
                  </Button>
                  <p className="text-gray-500 text-xs mt-2">
                    PNG, JPEG only
                    <br />
                    Max file size is 1 MB
                  </p>
                </div>
              </div>

              <Form.Item
                name="shortDescription"
                label={
                  <div className="flex justify-between w-full">
                    <span className="text-nomyx-text-light dark:text-nomyx-text-dark">* Short Description</span>
                    <span className="text-gray-500 text-xs">{shortDescriptionLength}/200</span>
                  </div>
                }
                rules={[{ required: true, message: "Please input the short description!" }]}
              >
                <TextArea
                  placeholder="Add Description"
                  autoSize={{ minRows: 4, maxRows: 6 }}
                  maxLength={200}
                  onChange={handleShortDescriptionChange}
                  className="bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark text-nomyx-text-light dark:text-nomyx-text-dark"
                />
              </Form.Item>
            </div>
          </div>

          {/* Stock Information Section */}
          <Title level={5} className="text-nomyx-text-light dark:text-nomyx-text-dark mt-8 mb-4">
            Stock Information
          </Title>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div>
              <Form.Item
                name="tokenType"
                label={<span className="text-nomyx-text-light dark:text-nomyx-text-dark">* Type of Investment</span>}
                rules={[{ required: true, message: "Please select the type of investment!" }]}
              >
                <Select className="bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark text-nomyx-text-light dark:text-nomyx-text-dark">
                  <Option value="venture">Venture</Option>
                  <Option value="equity">Equity</Option>
                  <Option value="debt">Debt</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="market"
                label={<span className="text-nomyx-text-light dark:text-nomyx-text-dark">* Market</span>}
                rules={[{ required: true, message: "Please select the market!" }]}
              >
                <Select className="bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark text-nomyx-text-light dark:text-nomyx-text-dark">
                  <Option value="US">US</Option>
                  <Option value="EU">EU</Option>
                  <Option value="ASIA">Asia</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="generation"
                label={<span className="text-nomyx-text-light dark:text-nomyx-text-dark">* Generation</span>}
                rules={[{ required: true, message: "Please input the generation!" }]}
              >
                <Input
                  placeholder="Add Generation"
                  className="bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark text-nomyx-text-light dark:text-nomyx-text-dark"
                />
              </Form.Item>

              <Form.Item
                name="openingDate"
                label={<span className="text-nomyx-text-light dark:text-nomyx-text-dark">* Opening Date</span>}
                rules={[{ required: true, message: "Please select the opening date!" }]}
              >
                <DatePicker
                  format="MM/DD/YYYY"
                  className="w-full bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark text-nomyx-text-light dark:text-nomyx-text-dark"
                  placeholder="mm/dd/yyyy"
                />
              </Form.Item>

              <Form.Item
                name="targetReturn"
                label={<span className="text-nomyx-text-light dark:text-nomyx-text-dark">* Target Return (Gross)</span>}
                rules={[{ required: true, message: "Please input the target return!" }]}
              >
                <Input
                  placeholder="Add Gross Rate"
                  className="bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark text-nomyx-text-light dark:text-nomyx-text-dark"
                />
              </Form.Item>
            </div>

            {/* Right Column */}
            <div>
              <Form.Item
                name="stage"
                label={<span className="text-nomyx-text-light dark:text-nomyx-text-dark">* Stage</span>}
                rules={[{ required: true, message: "Please select the stage!" }]}
              >
                <Select className="bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark text-nomyx-text-light dark:text-nomyx-text-dark">
                  <Option value="early">Early</Option>
                  <Option value="growth">Growth</Option>
                  <Option value="late">Late</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="fundSize"
                label={<span className="text-nomyx-text-light dark:text-nomyx-text-dark">* Fund Size (In Millions)</span>}
                rules={[{ required: true, message: "Please input the fund size!" }]}
              >
                <Input
                  placeholder="Add Fund Size"
                  prefix="$"
                  suffix="M"
                  className="bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark text-nomyx-text-light dark:text-nomyx-text-dark"
                />
              </Form.Item>

              <Form.Item
                name="economics"
                label={<span className="text-nomyx-text-light dark:text-nomyx-text-dark">* Economics</span>}
                rules={[{ required: true, message: "Please input the economics!" }]}
              >
                <Input
                  placeholder="Add Low Percentage Value"
                  className="bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark text-nomyx-text-light dark:text-nomyx-text-dark"
                />
              </Form.Item>

              <Form.Item
                name="closingDate"
                label={<span className="text-nomyx-text-light dark:text-nomyx-text-dark">* Closing Date</span>}
                rules={[{ required: true, message: "Please select the closing date!" }]}
              >
                <DatePicker
                  format="MM/DD/YYYY"
                  className="w-full bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark text-nomyx-text-light dark:text-nomyx-text-dark"
                  placeholder="mm/dd/yyyy"
                />
              </Form.Item>
            </div>
          </div>

          {/* Related Documentation Section */}
          <Title level={5} className="text-nomyx-text-light dark:text-nomyx-text-dark mt-8 mb-4">
            Related Documentation
          </Title>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div>
              <Form.Item name="salesContract" label={<span className="text-nomyx-text-light dark:text-nomyx-text-dark">Sales Contract</span>}>
                <Upload {...uploadProps}>
                  <Button
                    icon={<UploadOutlined />}
                    className="w-full bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark text-nomyx-text-light dark:text-nomyx-text-dark"
                  >
                    Upload Contract
                  </Button>
                </Upload>
              </Form.Item>

              <Form.Item name="billOfLading" label={<span className="text-nomyx-text-light dark:text-nomyx-text-dark">Bill of Lading</span>}>
                <Upload {...uploadProps}>
                  <Button
                    icon={<UploadOutlined />}
                    className="w-full bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark text-nomyx-text-light dark:text-nomyx-text-dark"
                  >
                    Upload Bill
                  </Button>
                </Upload>
              </Form.Item>

              <Form.Item
                name="merchandiseInsuranceCertificate"
                label={<span className="text-nomyx-text-light dark:text-nomyx-text-dark">Merchandise Insurance Certificate</span>}
              >
                <Upload {...uploadProps}>
                  <Button
                    icon={<UploadOutlined />}
                    className="w-full bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark text-nomyx-text-light dark:text-nomyx-text-dark"
                  >
                    Upload Certificate
                  </Button>
                </Upload>
              </Form.Item>
            </div>

            {/* Right Column */}
            <div>
              <Form.Item name="purchaseOrder" label={<span className="text-nomyx-text-light dark:text-nomyx-text-dark">Purchase Order</span>}>
                <Upload {...uploadProps}>
                  <Button
                    icon={<UploadOutlined />}
                    className="w-full bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark text-nomyx-text-light dark:text-nomyx-text-dark"
                  >
                    Upload Order
                  </Button>
                </Upload>
              </Form.Item>

              <Form.Item
                name="surveyorCertificate"
                label={<span className="text-nomyx-text-light dark:text-nomyx-text-dark">Surveyor Certificate</span>}
              >
                <Upload {...uploadProps}>
                  <Button
                    icon={<UploadOutlined />}
                    className="w-full bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark text-nomyx-text-light dark:text-nomyx-text-dark"
                  >
                    Upload Certificate
                  </Button>
                </Upload>
              </Form.Item>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-6">
            <Button type="default" className="mr-2">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="bg-blue-600">
              Preview
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default StockCertificateForm;
