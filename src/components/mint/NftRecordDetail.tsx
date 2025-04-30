import React, { useCallback, useEffect } from "react";

import { LeftOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox } from "antd";
import { useRouter } from "next/router";

import { ShareIcon } from "@/assets";
import { Industries, tradeFinanceDocumentationFields } from "@/constants/constants";
import BlockchainService from "@/services/BlockchainService";
import ParseClient from "@/services/ParseClient";
import { hashToColor } from "@/utils/colorUtils";
import { formatPrice } from "@/utils/currencyFormater";

import { GenerateSvgIcon } from "../atoms/TokenSVG";

interface NftRecordDetailProps {
  handleMint?: () => void;
  handleBack?: () => void;
  data: {
    [key: string]: string | string[] | ClaimTopic[];
  };
  detailView?: boolean;
}

const NftRecordDetail = ({ handleMint, handleBack, data, detailView = false }: NftRecordDetailProps) => {
  const router = useRouter();
  const blockchainService = BlockchainService.getInstance();

  const [allTopics, setAllTopics] = React.useState<ClaimTopic[]>();
  const [projectName, setProjectName] = React.useState<string>();
  const [identityDetail, setIdentityDetail] = React.useState<string>();
  const [projectType, setProjectType] = React.useState<string>();

  const { transactionHash, claimTopics, id, nftTitle, description, price, projectId, projectStartDate, mintAddress, ...metadata } = data;

  const colorKey = id || nftTitle;
  const color = hashToColor(`${colorKey as string}`);

  const title = detailView ? `Token - ${nftTitle}` : "Preview Token </>";
  const backButton = <Button onClick={() => router.back()} type="text" icon={<LeftOutlined />} />;
  const formatTitle = (title: string): string => {
    if (title === "isin_number") return "ISIN Number";
    if (title === "total_amount" || title === "par_value") {
      return title.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    }
    return title.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getAllTopics = useCallback(async () => {
    const claims: Parse.Object[] | undefined = await blockchainService?.getClaimTopics();
    let allTopics: ClaimTopic[] = [];
    if (claims) {
      claims.forEach((item: Parse.Object) => {
        allTopics.push({
          key: `${parseInt(item.attributes.topic)}`,
          displayName: item.attributes.displayName as string,
          id: item.id as string,
          topic: item.attributes.topic as string,
        });
      });
    }
    setAllTopics(allTopics);
  }, [blockchainService]);

  const getTokenProject = useCallback(async () => {
    const project = await ParseClient.getRecord("TokenProject", ["objectId"], [projectId as string]);
    if (project) {
      setProjectName(project.attributes.title as string);
      setProjectType(project.attributes.industryTemplate as string);
    }
  }, [projectId]);

  const getUserDetail = useCallback(async () => {
    const identity = await ParseClient.getRecord("User", ["walletAddress"], [mintAddress as string]);
    if (identity?.attributes) {
      const { username, walletAddress } = identity.attributes;
      setIdentityDetail(`${username} (${walletAddress})`);
    } else if (data?.mintAddress) {
      setIdentityDetail(data.mintAddress.toString());
    }
  }, [mintAddress]);

  useEffect(() => {
    getAllTopics();
    getTokenProject();
    getUserDetail();
  }, [getAllTopics, getTokenProject, getUserDetail]);

  return (
    <>
      <Card
        className="bg-nomyx-dark2-light dark:bg-nomyx-dark2-dark border-nomyx-gray4-light dark:border-nomyx-gray4-dark text-nomyx-text-light dark:text-nomyx-text-dark"
        title={detailView ? [backButton, title] : title}
        styles={{ body: { padding: "0" } }}
        // extra={
        //   <Button
        //     onClick={() =>
        //       window.open(
        //         `${process.env.NEXT_PUBLIC_ETHERSCAN_BASE_URL}${
        //           transactionHash || ''
        //         }`
        //       )
        //     }
        //     className='flex items-center gap-2 text-nomyx-text-light dark:text-nomyx-text-dark hover:!bg-transparent'>
        //     <ShareIcon />
        //     View On Block Explorer
        //   </Button>
        // }
      >
        <div className="flex flex-col mb-4">
          <div className="font-bold p-2">Details</div>
          <div className="flex gap-4 px-2">
            <div className="flex items-center justify-center h-52 w-52">
              <GenerateSvgIcon color={color} />
            </div>
            <div className="p-4 py-8">
              <h1 className="text-3xl font bold">{nftTitle as string}</h1>
              {projectType !== Industries.TRADE_FINANCE && (
                <p className="!text-nomyx-gray1-light dark:!text-nomyx-gray1-dark">{description as string}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="grid grid-cols-2 border-t border-b border-nomyx-gray4-light dark:border-nomyx-gray4-dark">
            <div className="p-2 border-b odd:border-r last:border-0 odd:[&:nth-last-child(2)]:border-b-0  border-nomyx-gray4-light dark:border-nomyx-gray4-dark">
              <div className="text-nomyx-gray3-light dark:text-nomyx-gray3-dark">Project</div>
              <div className="card-value truncate">{projectName}</div>
            </div>
            <div className="p-2 border-b odd:border-r last:border-0 odd:[&:nth-last-child(2)]:border-b-0  border-nomyx-gray4-light dark:border-nomyx-gray4-dark">
              <div className="text-nomyx-gray3-light dark:text-nomyx-gray3-dark">Project Start Date</div>
              <div className="card-value truncate">{projectStartDate as string}</div>
            </div>
            <div className="p-2 border-b odd:border-r last:border-0 odd:[&:nth-last-child(2)]:border-b-0  border-nomyx-gray4-light dark:border-nomyx-gray4-dark">
              <div className="text-nomyx-gray3-light dark:text-nomyx-gray3-dark">Mint To</div>
              <div className="card-value truncate">{identityDetail}</div>
            </div>
            {projectType !== Industries.TRADE_FINANCE && (
              <div className="p-2 border-b odd:border-r last:border-0 odd:[&:nth-last-child(2)]:border-b-0  border-nomyx-gray4-light dark:border-nomyx-gray4-dark">
                <div className="text-nomyx-gray3-light dark:text-nomyx-gray3-dark">Price</div>
                <div className="card-value truncate">{formatPrice(parseFloat(price as string))}</div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <div className="p-2 font-bold">Token Data</div>
          <div className="grid grid-cols-2 border-t border-b border-nomyx-gray4-light dark:border-nomyx-gray4-dark">
            {Object.entries(metadata)
              .filter(([key, value]) => key !== "_tradeDealId" && key !== "industryTemplate")
              .map(([key, value], index) => {
                return (
                  <div
                    key={`field-${index}`}
                    className="p-2 border-b odd:border-r last:border-0 odd:[&:nth-last-child(2)]:border-b-0  border-nomyx-gray4-light dark:border-nomyx-gray4-dark"
                  >
                    <div className="text-nomyx-gray3-light dark:text-nomyx-gray3-dark">{formatTitle(key)}</div>
                    <div className="card-value truncate">
                      {tradeFinanceDocumentationFields.find((field: { name: string; type: string }) => field.name === key)?.type === "file" ? (
                        <button onClick={() => window.open(value as string, "_blank")} className="text-blue-500 hover:text-blue-700">
                          View Document
                        </button>
                      ) : key === "total_amount" || key === "par_value" ? (
                        formatPrice(parseFloat(value as string))
                      ) : (
                        (value as string)
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="p-2 font-bold">Compliance Features</div>
        <div className="mb-2 p-2 border-t border-nomyx-gray4-light dark:border-nomyx-gray4-dark">
          {allTopics &&
            (allTopics as ClaimTopic[])
              .filter((topic) => (claimTopics as string).split(",").includes(topic["key"]))
              .map((topic, index) => (
                <div key={`claim-${index}`}>
                  <Checkbox defaultChecked disabled>
                    <p>
                      {topic.displayName} ({topic.topic})
                    </p>
                  </Checkbox>
                </div>
              ))}
        </div>
      </Card>

      {!detailView && (
        <>
          <div className="w-full flex justify-end gap-4 pt-2">
            <Button className="text-nomyx-text-light dark:text-nomyx-text-dark hover:!bg-transparent" onClick={handleBack}>
              Back
            </Button>
            <Button className="bg-nomyx-blue-light mr-4 hover:!bg-nomyx-dark1-light hover:dark:!bg-nomyx-dark1-dark" onClick={handleMint}>
              Mint
            </Button>
          </div>
        </>
      )}
    </>
  );
};

export default NftRecordDetail;
