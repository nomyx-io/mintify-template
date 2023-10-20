import { Button } from '@material-tailwind/react'
import React, { useEffect, useState } from 'react'
import type { TransferDirection } from 'antd/es/transfer';
import { useFormik } from "formik";
import * as Yup from "yup";
import { ErrorMessage } from '@/components/atoms/Message/ErrorMessage';
import { getDashboardLayout } from '@/Layouts';
import TextInput from '@/components/atoms/TextInput';
import Compliance from '@/components/molecules/Compliance';
import { useRouter } from 'next/router';
import { useAccount } from 'wagmi';

const schema = Yup.object().shape({
  walletAddress: Yup.string().matches(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
    .required("Address is required"),
});

const Setting = () => {
  const { isConnected } = useAccount()
  const router = useRouter()
  const mockData: any[] = Array.from({ length: 10 }).map((_, i) => ({
    key: i.toString(),
    title: `Option ${i + 1}`,
    description: `description of content${i + 1}`,
  }));

  const initialTargetKeys = mockData.filter((item) => Number(item.key) > 5).map((item) => item.key);

  const formik = useFormik({
    initialValues: {
      walletAddress: "",
      targetKeys: initialTargetKeys || [],
      selectedKeys: []
    },
    validationSchema: schema,
    enableReinitialize: true,
    onSubmit: async (values:any) => {
      console.log(values);
    },
  });
  const { errors, touched, values, handleChange, handleSubmit, setFieldValue } = formik;
  const onChange = (nextTargetKeys: string[], direction: TransferDirection, moveKeys: string[]) => {
    setFieldValue('targetKeys', nextTargetKeys);
  };

  const onSelectChange = (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => {
    setFieldValue('selectedKeys', [...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  const onScroll = (direction: TransferDirection, e: React.SyntheticEvent<HTMLUListElement>) => {
    // console.log('direction:', direction);
    // console.log('target:', e.target);
  };

  useEffect(() => {
    !isConnected && router.push('/login')
  }, [])

  return (
    <div>
      <form onSubmit={handleSubmit} method="POST">
        <div className='flex flex-col gap-1'>
          <p>{'Wallet Address'}</p>
          <TextInput
            name={'walletAddress'}
            value={values.walletAddress}
            handleChange={handleChange}
            placeholder={'Wallet Address'}
          />
          {errors.walletAddress && touched.walletAddress && <ErrorMessage error={errors.walletAddress} />}
        </div>
        <Compliance
          claimTopics={mockData}
          targetKeys={values.targetKeys}
          selectedKeys={values.selectedKeys}
          onChange={onChange}
          onSelectChange={onSelectChange}
          onScroll={onScroll}
        />
        <br />
        <div className='w-full flex justify-end gap-4'>
          <Button className='bg-[#dedede] text-black rounded-none'>Cancel</Button>
          <Button type="submit" className='bg-[#637eab] rounded-none'>Save</Button>
        </div>
      </form>
    </div>
  )
}
export default  Setting
Setting.getLayout = getDashboardLayout;