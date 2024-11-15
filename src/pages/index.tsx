"use client";

import { useRouter } from "next/navigation";

import { getDashboardLayout } from "../layouts";
export default function LandingPage() {
  const router = useRouter();
  router.push("/login");
}
LandingPage.getLayout = getDashboardLayout;
