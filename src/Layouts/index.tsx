import React from 'react'
import SideNavBar from '@/components/molecules/SideNavBar';
import TopNavBar from '@/components/molecules/TopNavBar';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { Layout, Flex } from 'antd/es';

const {Footer, Content, Sider, Header } = Layout;

const headerStyle: React.CSSProperties = {
    // textAlign: 'center',
    // color: '#fff',
    // height: 64,
    // paddingInline: 48,
    // lineHeight: '64px',
    // backgroundColor: '#4096ff',
};

const contentStyle: React.CSSProperties = {
    // textAlign: 'center',
    // minHeight: 120,
    // lineHeight: '120px',
    // color: '#fff',
    // backgroundColor: '#0958d9',
};

const siderStyle: React.CSSProperties = {
    // textAlign: 'center',
    // lineHeight: '120px',
    // color: '#fff',
    // backgroundColor: '#1677ff',
};

const footerStyle: React.CSSProperties = {
    // textAlign: 'center',
    // color: '#fff',
    // backgroundColor: '#4096ff',
};

const layoutStyle = {
    minHeight:"100vh"
};

export const AppLayout = ({ children }: any) => {
    return (
        <AntdRegistry>
            <Layout>
                <TopNavBar>Header</TopNavBar>
                <Layout hasSider>
                    <SideNavBar/>
                    <Content className="p-5" style={contentStyle}>{children}</Content>
                </Layout>
                <Footer style={footerStyle}>Footer</Footer>
            </Layout>
        </AntdRegistry>
    );
}
export const getDashboardLayout = (page: React.ReactElement) =>
    <AppLayout>{page}</AppLayout>;
