'use client'
import { CustomTable } from '@/components/molecules/Table';
import KPI from '@/components/atoms/KPI'
import { ApiHook } from '@/services/api'
import { EventFeed } from '@/components/molecules/EventFeed'
import React, { useEffect, useState } from 'react'
import { getDashboardLayout } from '../Layouts';
import BarChart from '@/components/atoms/Graphs/Barchart';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
export default function LandingPage() {
  const router = useRouter()
  router.push('/login')
}
LandingPage.getLayout = getDashboardLayout;