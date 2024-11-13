'use client'

import { getDashboardLayout } from '../layouts';
import { useRouter } from 'next/navigation';
export default function LandingPage(){
  const router = useRouter()
  router.push('/login')
}
LandingPage.getLayout = getDashboardLayout;
