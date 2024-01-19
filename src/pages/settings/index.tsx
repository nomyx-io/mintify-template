"use client"

// import { Button } from '@material-tailwind/react'
import React, { useEffect, useState } from 'react'
import type { TransferDirection } from 'antd/es/transfer';
import { Form, Input, Button, Transfer } from 'antd';
import * as Yup from 'yup';
import { ErrorMessage } from '@/components/atoms/Message/ErrorMessage';
import { getDashboardLayout } from '@/Layouts';
import TextInput from '@/components/atoms/TextInput';
import Compliance from '@/components/molecules/Compliance';
import { useRouter } from 'next/router';
import { useAccount } from 'wagmi';
import ImageComp from '@/components/molecules/ImageBox';
import { ApiHook } from '@/services/api';
import { toast } from 'react-toastify';
import { useWalletAddress } from '@/context/WalletAddressContext';

const schema = Yup.object().shape({
  walletAddress: Yup.string().matches(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
    .required("Address is required"),
});

const Setting = () => {
  
  const router = useRouter();
  const [form] = Form.useForm();
  const { walletAddress, setWalletAddress } = useWalletAddress();
  const api = ApiHook();
  const { isConnected } = useAccount();
  const [claimTopics, setClaimTopics] = useState<any[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<any[]>([]);
  const [selectedClaimTopics, setSelectedClaimTopics] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState(new File([], ''));
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [newFileSelected, setNewFileSelected] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleImage = (e: any) => {
    //set defaultTokenImage in state
    setSelectedImage(e.target.files[0]);

    const localUrl = URL.createObjectURL(e.target.files[0]);

    //todo: update the image preview here
    setSelectedImageUrl(localUrl);

    setNewFileSelected(true);
  };

  const onFinish = async (values: any) => {

    //create settings object to pass to api method
    //only add default token image to the settings obect if the user has selected a new image

    const settings: any = { walletAddress: values.walletAddress, defaultClaimTopics: selectedClaimTopics };
    
    if (newFileSelected) {
      settings.defaultTokenImage = selectedImage;
    }
    // Update the wallet address in the global context
    setWalletAddress(values.walletAddress);

    // i.e. {setting1:value1, setting2:value2, ...}
    //todo: show a toast message that will disappear once the promise returned by api.saveSettings() is resolved
    //use toast.promise
    //look for example in this project or lenderlabs-admin-ui
    let saveApi = api.saveSettings(settings);

    toast.promise(saveApi, {
      success: 'Settings saved successfully!', // Display this message when the promise is resolved
      error: 'Failed to save settings!', // Display this message when the promise is rejected
    });

    // Submit form with the existing settings values
    form.setFieldsValue({ walletAddress: walletAddress });
  }

  const onChange = (nextTargetKeys: string[], direction: TransferDirection, moveKeys: string[]) => {
    setSelectedClaimTopics(nextTargetKeys);
  };

  const onSelectChange = (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => {
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  const onScroll = (direction: TransferDirection, e: React.SyntheticEvent<HTMLUListElement>) => {
  };

  useEffect(() => {

    !isConnected && router.push('/login');

    //load settings data via api
    const getData = async () => {

      setLoading(true);

      let cts:any = await api.getClaimTopics();
      cts = cts.map((item:any) => ({...item, attributes: {...item.attributes}}));

      console.log('cts = ', cts);

      setClaimTopics(cts);

      let settingsData:any = await api.getSettings();

      if (settingsData) {

        form.setFieldsValue(settingsData);

        //setSelectedClaimTopics from settingsData (defaultClaimTopics)
        let selectedClaimTopicIds = settingsData.defaultClaimTopics ? JSON.parse(settingsData.defaultClaimTopics) : [];
        setSelectedClaimTopics(selectedClaimTopicIds);
        console.log('selectedImage = ', settingsData.defaultTokenImage);
        //setSelectedImage
        setSelectedImage(settingsData.defaultTokenImage);
        setSelectedImageUrl(settingsData.defaultTokenImage?.url());
        
      }

      setLoading(false);

    }

    getData();

  }, []);


  useEffect(() => {
    // Prefill the form with the wallet address from the context
    form.setFieldsValue({ walletAddress: walletAddress });
  }, [walletAddress]);

  return (
    <div>
        <Form
          className='settings-form'
          form={form}
          onFinish={onFinish}
          initialValues={{
            walletAddress: walletAddress
          }}
          layout="vertical"
        >
         
          <Form.Item
            name="walletAddress"
            label="Wallet Address"
            rules={[
              {
                pattern: /^0x[a-fA-F0-9]{40}$/,
                message: 'Invalid Ethereum address',
              },
              {
                required: true,
                message: 'Address is required',
              },
            ]}
          >
            <Input placeholder="Wallet Address" />
          </Form.Item>

          <Form.Item
              name="defualtClaimTopics"
              label="Default Claim Topics">

              <Transfer
                  dataSource={claimTopics} // Provide your data source
                  rowKey={(item) => item.id}
                  targetKeys={selectedClaimTopics}
                  selectedKeys={selectedKeys}
                  onChange={onChange}
                  onSelectChange={onSelectChange}
                  onScroll={onScroll}
                  render={(item) => {return `${item?.attributes?.displayName||''} (${item?.attributes?.topic})`}}
              />
          </Form.Item>
          
          <Form.Item
              name="defaultTokenImage"
              label="Default Token Image">

              <ImageComp file={selectedImageUrl} handleChange={handleImage} />

          </Form.Item>

        <br />

        <div className='w-full flex justify-end gap-4'>
          <Button className='bg-[#dedede] text-black rounded-none'>Cancel</Button>
          <Button type="primary" htmlType="submit" className='bg-[#637eab] rounded-none'>Save</Button>
        </div>

      </Form>

    </div>
  )
}
export default  Setting
Setting.getLayout = getDashboardLayout;
