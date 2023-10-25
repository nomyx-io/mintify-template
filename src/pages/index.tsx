'use client'
import { CustomTable } from '@/components/molecules/Table';
import { getDashboardLayout } from '../Layouts';
import { useRouter } from 'next/navigation';
export default function LandingPage(){
  const router = useRouter()
  router.push('/login')
}
LandingPage.getLayout = getDashboardLayout;