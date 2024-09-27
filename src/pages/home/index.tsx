'use client';
import KPI from '@/components/atoms/KPI';
import { KronosService } from '@/services/KronosService';
import { EventFeed } from '@/components/molecules/EventFeed';
import React, { useCallback, useEffect, useState } from 'react';
import { getDashboardLayout } from '@/Layouts';
import BarChart from '@/components/atoms/Graphs/Barchart';
import moment from 'moment';
import { Card, Table, Tabs } from 'antd';
import { DASHBOARD_COLUMNS, getGraphData, getKPIs } from '@/utils/dashboard';

const formatMintedNftRecords = (records: Parse.Object[]): MintedToken[] =>
  records.map((record: Parse.Object) => ({
    id: record.id,
    _createdAt: moment(record.createdAt).format('YYYY-MM-DD'),
    _amount: record.attributes.loanAmount || '',
    _originationDate: record.attributes.originationDate || '',
    _currentValue: record.attributes.currentValue || '',
    _loanId: record.attributes.loanId || '',
    _tokenId: record.attributes.tokenId || '',
  }));

export default function Home() {
  const api = KronosService();
  const [graphValues, setGraphValues] = useState<PortfolioPerformance>();
  const [eventDetails, setEventDetails] = useState<Events>({});
  const [mintedNfts, setMintedNfts] = useState<MintedToken[]>([]);
  const [kpisData, setkpisData] = useState<KPIs>();

  const kpiList = getKPIs(kpisData);
  const graphData = getGraphData(graphValues);
  const columns = DASHBOARD_COLUMNS;

  const fetchData = useCallback(async () => {
    try {
    const [mintedNftRecords, events, portfolioPerformance, kpis] =
      await Promise.all([
        api.getMintedNfts(),
        api.getEvents(),
        api.getPortfolioPerformance(),
        api.getKpis(),
      ]);

    setkpisData(kpis);
    setMintedNfts(formatMintedNftRecords(mintedNftRecords || []));
    setEventDetails(events || {});
    setGraphValues(portfolioPerformance);
    } catch (error) {
      console.error(error);
    }
  }, [api]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className='w-full grid grid-cols-1 lg:grid-cols-4 gap-3'>
      <div className='lg:col-span-3'>
        <div className='flex lg:grid grid-cols-3 gap-3 pb-3 flex-wrap'>
          {kpiList?.map((kpi) => (
              <KPI
                key={kpi.title}
                icon={kpi.icon}
                title={kpi.title}
                value={kpi.value}
              />
            ))}
        </div>

        <Card className='w-full flex-grow no-padding'>
          <Tabs>
            <Tabs.TabPane tab='Token Insights' key='1'>
              <BarChart data={graphData} title='Net Asset Value & Yield' />
            </Tabs.TabPane>
            <Tabs.TabPane tab='Carbon Insights' key='2'>
              <Table columns={columns} dataSource={mintedNfts} />
            </Tabs.TabPane>
          </Tabs>
        </Card>
      </div>
      <Card className='no-padding h-[90vh] lg:max-w-sm overflow-y-auto'>
        <EventFeed data={eventDetails} />
      </Card>
    </div>
  );
}

Home.getLayout = getDashboardLayout;
