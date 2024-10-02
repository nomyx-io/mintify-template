import React, { useEffect } from "react";
import SideNavBar from "@/components/molecules/SideNavBar";
import TopNavBar from "@/components/molecules/TopNavBar";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Layout } from "antd/es";
import KronosSpin from "@/components/KronosSpin";
import { useRouter } from "next/router";

const { Content } = Layout;

export const AppLayout = ({ children }: { children: React.ReactElement }) => {
  const router = useRouter();

  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    const handleStart = (url: string) => {
      if (typeof url === "string") {
        const path = url.split("?")[0];
        path !== router.pathname && setLoading(true);
      }
    };
    const handleComplete = (url: string) => {
      if (typeof url === "string") {
        const path = url.split("?")[0];
        path === router.pathname && setLoading(false);
      }
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  });

  return (
    <AntdRegistry>
      <Layout style={{ minHeight: "100vh" }}>
        <TopNavBar />
        <div className="sm:hidden w-[100%] h-[100%] text-white p-4 text-center overflow-hidden absolute top-0 left-0 flex justify-center items-center z-20">
          We&apos;re sorry, but this application is not supported on mobile devices.
        </div>
        <Layout hasSider className="hidden sm:flex">
          <SideNavBar />
          <Content>
            <div
              className="w-[100%] h-[100%] overflow-hidden absolute top-0 left-0 flex justify-center items-center z-20"
              style={{
                backgroundColor: "rgba(0,0,0,0.8)",
                visibility: loading ? "visible" : "hidden",
              }}
            >
              <KronosSpin />
            </div>

            <div className="p-5 w-full h-full hidden sm:block bg-nomyx-dark1-light dark:bg-nomyx-dark1-dark">{children}</div>
          </Content>
        </Layout>
      </Layout>
    </AntdRegistry>
  );
};
export const getDashboardLayout = (page: React.ReactElement) => <AppLayout>{page}</AppLayout>;
