import React, {useEffect} from 'react'
import PubSub from 'pubsub-js';
import SideNavBar from '@/components/molecules/SideNavBar';
import TopNavBar from '@/components/molecules/TopNavBar';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { Layout } from 'antd/es';
import KronosSpin from "@/components/KronosSpin";
import {usePageUnloadGuard} from "@/hooks/usePageUnloadGuard";

const { Content } = Layout;

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
                <TopNavBar />
                <Layout hasSider>
                    <SideNavBar/>
                    <Content>
                        <div className='w-[100%] h-[100%] overflow-hidden absolute top-0 left-0 flex justify-center items-center z-20'
                             style={{backgroundColor:"rgba(0,0,0,0.8)", visibility:loading?"visible":"hidden"}}>
                                <KronosSpin/>
                        </div>

                        <div className="p-5 w-full">{children}</div>

                    </Content>
                </Layout>
            </Layout>
        </AntdRegistry>
    );
}
export const getDashboardLayout = (page: React.ReactElement) =>
    <AppLayout>{page}</AppLayout>;
