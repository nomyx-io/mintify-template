"use client";

import { useRouter } from "next/navigation";

import { getDashboardLayout } from "@/Layouts";
export default function LandingPage() {
  const router = useRouter();
  router.push("/login");
}
LandingPage.getLayout = getDashboardLayout;
