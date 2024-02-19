import React, {useEffect} from 'react'
import PubSub from 'pubsub-js';
import SideNavBar from '@/components/molecules/SideNavBar';
import TopNavBar from '@/components/molecules/TopNavBar';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { Layout } from 'antd/es';
import LenderLabSpin from "@/components/LenderLabSpin/LenderLabSpin";
import {usePageUnloadGuard} from "@/hooks";

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
    // position: "relative"
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

export const AppLayout = ({children, onLoad}: any) => {

    const listener = usePageUnloadGuard();
    const [loading, setLoading] = React.useState(false);

    listener.onBeforeUnload = () => {
        console.log("onBeforeUnload");
        setLoading(true);
        return true;
    };

    useEffect(() => {
        PubSub.subscribe("PageLoad",()=>setLoading(false));
    }, []);

    return (
        <AntdRegistry>
            <Layout style={{minHeight:"100vh"}}>
                <TopNavBar>Header</TopNavBar>
                <Layout hasSider>
                    <SideNavBar/>
                    <Content style={contentStyle}>
                        <div className='w-[100%] h-[100%] overflow-hidden absolute top-0 left-0 flex justify-center items-center z-20'
                             style={{backgroundColor:"rgba(0,0,0,0.8)", visibility:loading?"visible":"hidden"}}>
                                <LenderLabSpin/>
                        </div>

                        <div className="p-5">{children}</div>

                    </Content>
                </Layout>
                <Footer style={footerStyle}>Footer</Footer>
            </Layout>
        </AntdRegistry>
    );
}
export const getDashboardLayout = (page: React.ReactElement) =>
    <AppLayout>{page}</AppLayout>;
