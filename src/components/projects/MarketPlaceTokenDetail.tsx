import { Button, Card, Descriptions, Popover, Statistic, Tabs } from "antd/es";
import { Input, Select, DatePicker, Button as AntButton } from "antd";
import { WarningFilled, ArrowLeftOutlined } from "@ant-design/icons";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import Image from "next/image";
import ItemActivity from "@/components/ItemActivitySection";
import YieldDeposits from "@/components/YieldDeposits";
import TokenChart from "@/components/TokenChart";
import InterestClaimHistory from "@/components/InterestClaimHistory";
import React, { useEffect } from "react";
import { KronosService } from "@/services/KronosService";
import Parse from "parse";
import { toast } from "react-toastify";
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { hashToColor } from "@/utils/colorUtils";
import { useMemo } from "react";

dayjs.extend(isBetween);

const { RangePicker } = DatePicker;
const { Option } = Select;

const activityData = [
  { walletID: "wallet123abc", sales: 5, transfers: 1, dateIssued: "2024-01-10T10:15:30.915Z" },
  { walletID: "wallet456def", sales: 15, transfers: 3, dateIssued: "2024-02-15T12:45:20.915Z" },
  { walletID: "wallet789ghi", sales: 25, transfers: 5, dateIssued: "2024-03-20T08:20:00.915Z" },
  { walletID: "walletabc789", sales: 35, transfers: 0, dateIssued: "2024-04-25T09:05:10.915Z" },
  { walletID: "walletdef456", sales: 50, transfers: 2, dateIssued: "2024-05-09T20:31:28.915Z" },
  { walletID: "walletghi123", sales: 8, transfers: 1, dateIssued: "2024-06-18T11:11:11.915Z" },
  { walletID: "walletxyz999", sales: 12, transfers: 3, dateIssued: "2024-07-14T13:55:40.915Z" },
  { walletID: "walletlmn111", sales: 20, transfers: 1, dateIssued: "2024-08-22T16:25:15.915Z" },
  { walletID: "walletopq333", sales: 45, transfers: 4, dateIssued: "2024-09-12T18:00:00.915Z" },
  { walletID: "walletrst555", sales: 60, transfers: 5, dateIssued: "2024-10-01T14:40:50.915Z" },
];

const redemptionHistoryData = [
  { recordID: "record123abc", date: "2024-01-10T10:15:30.915Z", amount: 18, treasuryAddress: "0xabc123456789def" },
  { recordID: "record456def", date: "2024-02-15T12:45:20.915Z", amount: 30, treasuryAddress: "0xdef987654321ghi" },
  { recordID: "record789ghi", date: "2024-03-20T08:20:00.915Z", amount: 50, treasuryAddress: "0xghi555555555aaa" },
  { recordID: "recordabc789", date: "2024-04-25T09:05:10.915Z", amount: 75, treasuryAddress: "0xabc333333333bbb" },
  { recordID: "recorddef456", date: "2024-05-09T20:31:28.915Z", amount: 25, treasuryAddress: "0xdef111111111ccc" },
  { recordID: "recordghi123", date: "2024-06-18T11:11:11.915Z", amount: 45, treasuryAddress: "0xghi999999999ddd" },
  { recordID: "recordxyz999", date: "2024-07-14T13:55:40.915Z", amount: 90, treasuryAddress: "0xxyz888888888eee" },
  { recordID: "recordlmn111", date: "2024-08-22T16:25:15.915Z", amount: 60, treasuryAddress: "0xlmn777777777fff" },
  { recordID: "recordopq333", date: "2024-09-12T18:00:00.915Z", amount: 120, treasuryAddress: "0xopq666666666ggg" },
  { recordID: "recordrst555", date: "2024-10-01T14:40:50.915Z", amount: 15, treasuryAddress: "0xrst555555555hhh" },
];

export default function MarketPlaceTokenDetail({ token, next, prev, currentIndex, totalTokens, onBack }: any) {
  //console.log("token: ", token);
  const [claimDisabled, setClaimDisabled] = React.useState(true);
  const [tokenBalance, setTokenBalance] = React.useState(0);
  const [claimError, setClaimError] = React.useState();
  const [yieldGenerated, setYieldGenerated] = React.useState(0);
  const tokenData = token?.token || {};

  const api = useMemo(() => KronosService(), []);

  const contentStyle: React.CSSProperties = {
    margin: 0,
    // color: '#fff',
  };

  const tokenAttributes = [
    { name: "nftTitle", label: "Title", defaultValue: "&lt;No Name&gt;" },
    { name: "tokenId", label: "Token Id", defaultValue: "&lt;No Token Id&gt;" },
    {
      name: "loanId",
      label: "Loan Id",
      defaultValue: "&lt;Loan Id Missing&gt;",
    },
    { name: "loanAmount", label: "Loan Origination Amount", defaultValue: "0" },
    {
      name: "originationDate",
      label: "Loan Origination Date",
      defaultValue: "0",
    },
    { name: "yields", label: "Yield", defaultValue: "0" },
    { name: "currentValue", label: "Current Value", defaultValue: "0" },
    { name: "price", label: "Purchase Price", defaultValue: "0" },
    { name: "totalPayments", label: "Total Payments", defaultValue: "0" },
    { name: "lastPayment", label: "Last Payment", defaultValue: "-" },
    {
      name: "address",
      label: "ERC721 Address",
      defaultValue: "&lt;ERC721 Address Missing&gt;",
    },
    { name: "balance", label: "Available Balance", defaultValue: "0" },
  ];

  useEffect(() => {
    setClaimDisabled(claimError || token.balance <= 0);
    setTokenBalance(token.balance);
  }, [token, claimError, tokenBalance]);

  const calculateMonthsRemaining = () => {
    const originationDate = new Date(token.originationDate);
    const currentDate = new Date();
    const termMonths = parseInt(token.term, 10); // Assuming term is provided in months

    const monthsElapsed = (currentDate.getFullYear() - originationDate.getFullYear()) * 12 + (currentDate.getMonth() - originationDate.getMonth());
    return termMonths - monthsElapsed;
  };

  const monthsRemaining = calculateMonthsRemaining();

  useEffect(() => {
    // Example function to calculate and set the total yield
    // This assumes that your token object might have a list of deposit objects
    // Each with an 'amount' property representing the yield amount
    const calculateYieldGenerated = () => {
      // Check if the token has deposits and calculate the sum
      const totalYield = token.deposits?.reduce((acc: any, deposit: any) => acc + parseFloat(deposit.amount), 0) || 0;
      setYieldGenerated(totalYield);
    };

    calculateYieldGenerated();
  }, [token]);

  const generateSvgIcon = (color: string) => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 560 560">
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor="#003366" stopOpacity="1" />
          </linearGradient>
        </defs>
        <rect width="560" height="560" rx="15" fill={`url(#gradient-${color})`} />
        <text
          x="50%"
          y="50%" // Adjusted to bring text to vertical center
          fontFamily="Arial, sans-serif"
          fontWeight="bold"
          fontSize="300" // Increased font size to make "KC" bigger
          fill="white"
          dominantBaseline="middle"
          textAnchor="middle"
        >
          KC
        </text>
      </svg>
    );
  };

  async function handlePurchaseToken() {
    // let tokenListing: any[] = [];
    // tokenListing.push(token);

    // toast.promise(
    //   async () => {
    //     try {
    //       // Perform some asynchronous operation, like making a purchase
    //       if (walletPreference === 1) {
    //         // Call purchaseFromMarketplace if using web3 wallet
    //         // Perform some asynchronous operation, like making a deposit
    //         const result = await api.purchaseTokens(tokenListing);
    //         // Assuming makeDeposit returns a promise
    //         return result;
    //       } else if (walletPreference === 0) {
    //         // Call purchaseFromMarketplace if using mpc wallet
    //         const user = appState?.session?.user;
    //         const walletId = user?.walletId;
    //         if (!token?.tokenId) throw new Error("Token Id is missing");
    //         if (!walletId) throw new Error("Wallet Id is missing");
    //         for (let listing of tokenListing) {
    //           console.log("listing: ", listing);
    //           return await Parse.Cloud.run("purchaseFromMarketplace", {
    //             tokenId: listing.tokenId,
    //             price: listing.price,
    //             vaultAccountId: walletId.toString(),
    //           });
    //         }
    //       } else {
    //         throw new Error("Invalid wallet preference");
    //       }
    //     } catch (error) {
    //       // Handle errors
    //       console.error("Error making purchase:", error);
    //       throw error; // Rethrow the error to trigger the error notification
    //     }
    //   },
    //   {
    //     pending: "Processing purchase...", // Notification while the operation is pending
    //     success: "Purchase successful", // Notification on success
    //     error: {
    //       // Notification on error
    //       render({ data }: any) {
    //         return <div>{data?.reason || "An error occurred while making the purchase"}</div>;
    //       },
    //     },
    //   }
    // );
  }

  const tabItems = [
    {
      key: "1",
      label: "Token Info",
      children: (
        <Descriptions
          items={tokenAttributes.map((attr) => ({
            key: attr.name,
            label: attr.label,
            children: token[attr.name] || attr.defaultValue,
          }))}
        />
      ),
    },
    {
      key: "2",
      label: "Activity",
      children: <ItemActivity token={token} />,
    }
  ];

  // Adjust next and prev to enable looping
  const handleNext = () => {
    if (currentIndex === totalTokens - 1) {
      next(0); // Loop to first token if at the last token
    } else {
      next(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex === 0) {
      prev(totalTokens - 1); // Loop to last token if at the first token
    } else {
      prev(currentIndex - 1);
    }
  };

  const color = hashToColor(tokenData.tokenId || "default");

  return (
    <div className="p-4 dark:bg-gray-900 dark:text-white bg-white text-gray-900">
      {/* Header Section with Token Title, Navigation Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        className="mb-6"
      >
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 shadow-md rounded-md transition 
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white border 
                    dark:border-gray-700
                    !hover:bg-white !dark:hover:bg-gray-800 !hover:text-gray-900 !dark:hover:text-white"
        >
          <ArrowLeftOutlined className="mr-2" />
          Back
        </button>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-2">
          <Button type="text" className="px-2 py-0" onClick={prev}>
            <LeftOutlined style={{ fontSize: "20px", color: "black" }} />
          </Button>
          <Button type="text" className="px-2 py-0" onClick={next}>
            <RightOutlined style={{ fontSize: "20px", color: "black" }} />
          </Button>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-stretch">
        {/* Grouped Token Image and Description Section */}
        <div className="flex flex-col gap-6 items-start flex-grow">
          {/* Token Image Section */}
          <div className="flex-shrink-0" style={{ width: "400px", height: "400px" }}>
            {generateSvgIcon(color)}
          </div>

          {/* Title and Description Section */}
          <div className="flex flex-col justify-start">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Token {token?.tokenId || "X"}</h2>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Project: {token?.projectName || "Project 1"}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{token?.description || "No description available."}</p>
          </div>
        </div>

        {/* Pricing Info Section */}
        <div className="flex-grow-0 flex-shrink-0 lg:w-1/3" style={{ minWidth: "350px" }}>
          <Card className="border dark:border-gray-700 border-gray-300 bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="border border-gray-300 dark:border-gray-600 p-4 rounded-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pricing Info</h3>
              <div className="text-gray-800 dark:text-gray-200 space-y-4">
                {[
                  { label: "Price Pre Credits:", value: "$1,000" },
                  { label: "Subtotal:", value: "$105,000" },
                  { label: "Discount:", value: "5%" },
                  { label: "Total:", value: "$94,500" },
                ].map((item, index) => (
                  <div key={index} className="flex flex-wrap items-center">
                    <span className="font-semibold w-full md:w-1/2">{item.label}</span>
                    <span className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-md w-full md:w-1/2 mt-1 md:mt-0 overflow-hidden text-ellipsis whitespace-nowrap">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6">
              <div className="text-gray-900 dark:text-white font-bold text-lg mb-2">Carbon Credits:</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">105</div>
              <button className="w-full mt-4 bg-blue-500 text-white font-bold py-3 px-6 rounded-md transition hover:bg-blue-700 hover:brightness-110 flex items-center justify-center border-none">
                Retire Now
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Project Info Section */}
      <div className="mt-10">
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6 mb-6 bg-white dark:bg-gray-800">
          <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Project Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {[
              { label: "Auditor", value: "Auditor Name" },
              { label: "Registry ID", value: "526654649" },
              { label: "Project Start Date", value: "09-03-2024" },
              { label: "Registry Link", value: "url/link/address" },
              { label: "Issuance Date", value: "09-03-2024" },
              { label: "GHG Reduction Type", value: "Type" },
            ].map((field, index) => (
              <div key={index} className="flex items-center gap-4">
                <label className="w-1/3 text-gray-600 dark:text-gray-300 font-semibold">{field.label}:</label>
                <span className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 shadow-md rounded-md px-4 py-2 hover:bg-white dark:hover:bg-gray-800">
                  {field.value}
                </span>
              </div>
            ))}
            <div className="col-span-2 mt-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Geography</h4>
            </div>
            <div className="flex items-center gap-4">
              <label className="w-1/3 text-gray-600 dark:text-gray-300 font-semibold">Country:</label>
              <span className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 shadow-md rounded-md px-4 py-2 hover:bg-white dark:hover:bg-gray-800">
                USA
              </span>
            </div>
            <div className="flex items-center gap-4">
              <label className="w-1/3 text-gray-600 dark:text-gray-300 font-semibold">State:</label>
              <span className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 shadow-md rounded-md px-4 py-2 hover:bg-white dark:hover:bg-gray-800">
                New Mexico
              </span>
            </div>
          </div>
        </div>

        {/* Credit Info Section */}
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
          <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Credit Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {[
              { label: "Pre 2020 Credits", value: "256" },
              { label: "2021 Credits", value: "95" },
              { label: "2022 Credits", value: "90" },
              { label: "2023 Credits", value: "100" },
              { label: "2024 Credits", value: "102" },
              { label: "Estimated Annual Emissions Reduction", value: "102" },
            ].map((field, index) => (
              <div key={index} className="flex items-center gap-4">
                <label className="w-1/3 text-gray-600 dark:text-gray-300 font-semibold">{field.label}:</label>
                <span className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 shadow-md rounded-md px-4 py-2 hover:bg-white dark:hover:bg-gray-800">
                  {field.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs className="nftTabs mt-10" items={tabItems} />
    </div>
  );
}
