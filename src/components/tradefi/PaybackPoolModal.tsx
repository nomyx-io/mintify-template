import React, { useState, useEffect } from "react";

import { Modal, Button, Checkbox, Table } from "antd";
import { Add } from "iconsax-react";

interface InvoiceItem {
  key: string;
  invoiceId: string;
  tokenId: string;
  amount: number;
  selected?: boolean;
}

interface PaybackPoolModalProps {
  visible: boolean;
  onCancel: () => void;
  onDeposit: (selectedItems: InvoiceItem[]) => void;
  invoices: InvoiceItem[];
}

const PaybackPoolModal: React.FC<PaybackPoolModalProps> = ({ visible, onCancel, onDeposit, invoices }) => {
  const [selectedItems, setSelectedItems] = useState<InvoiceItem[]>([]);
  const [dataSource, setDataSource] = useState<InvoiceItem[]>([]);

  useEffect(() => {
    // Initialize data source with the provided invoices
    setDataSource(invoices.map((invoice) => ({ ...invoice, selected: false })));
  }, [invoices]);

  // Reset selections when modal is opened
  useEffect(() => {
    if (visible) {
      setSelectedItems([]);
      setDataSource(invoices.map((invoice) => ({ ...invoice, selected: false })));
    }
  }, [visible, invoices]);

  const handleCheckboxChange = (record: InvoiceItem, checked: boolean) => {
    const newDataSource = dataSource.map((item) => {
      if (item.key === record.key) {
        return { ...item, selected: checked };
      }
      return item;
    });

    setDataSource(newDataSource);

    const newSelectedItems = newDataSource.filter((item) => item.selected);
    setSelectedItems(newSelectedItems);
  };

  const handleSelectAll = (checked: boolean) => {
    const newDataSource = dataSource.map((item) => ({
      ...item,
      selected: checked,
    }));

    setDataSource(newDataSource);

    const newSelectedItems = checked ? [...newDataSource] : [];
    setSelectedItems(newSelectedItems);
  };

  const handleDeposit = () => {
    onDeposit(selectedItems);
  };

  const handleAddNewInvoice = () => {
    // This would typically open another modal or form to add a new invoice
    console.log("Add new invoice clicked");
  };

  // Calculate total amount of selected items
  const totalAmount = selectedItems.reduce((sum, item) => sum + item.amount, 0);

  const columns = [
    {
      title: (
        <Checkbox
          onChange={(e) => handleSelectAll(e.target.checked)}
          checked={dataSource.length > 0 && dataSource.every((item) => item.selected)}
          indeterminate={dataSource.some((item) => item.selected) && !dataSource.every((item) => item.selected)}
        />
      ),
      dataIndex: "selected",
      key: "selected",
      render: (_: any, record: InvoiceItem) => (
        <Checkbox checked={record.selected} onChange={(e) => handleCheckboxChange(record, e.target.checked)} />
      ),
      width: 50,
    },
    {
      title: "Invoice ID",
      dataIndex: "invoiceId",
      key: "invoiceId",
      render: (text: string) => text,
    },
    {
      title: "Token ID",
      dataIndex: "tokenId",
      key: "tokenId",
      render: (text: string) => text,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => amount.toLocaleString(),
    },
  ];

  return (
    <Modal
      title={<h2 className="text-xl font-bold">Pay back Pool</h2>}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      className="payback-pool-modal"
    >
      <div className="mb-4">
        <p className="text-base">Select Stocks to deposit</p>
      </div>

      <div className="border rounded-lg overflow-hidden mb-4">
        <Table dataSource={dataSource} columns={columns} pagination={false} rowKey="key" className="payback-table" />
      </div>

      <div className="flex items-center text-blue-500 cursor-pointer mb-6" onClick={handleAddNewInvoice}>
        <Add size="20" className="mr-2" />
        <span>Add New Invoice</span>
      </div>

      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex justify-between items-center border-b pb-2">
          <span className="font-medium">Selected:</span>
          <span className="font-medium">{selectedItems.length}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium">Total Amount:</span>
          <span className="font-medium">{totalAmount.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex justify-between">
        <Button onClick={onCancel} className="w-[120px]">
          Cancel
        </Button>
        <Button type="primary" onClick={handleDeposit} disabled={selectedItems.length === 0} className="w-[120px] bg-blue-500">
          Deposit
        </Button>
      </div>
    </Modal>
  );
};

export default PaybackPoolModal;
