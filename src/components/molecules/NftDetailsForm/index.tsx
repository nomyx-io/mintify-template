import React from 'react';
import { Form, Input, Button } from 'antd';
import Checkbox from 'antd/lib/checkbox/Checkbox';

const NftDetailsForm = ({ fields, frozen, handleChange, handleFreeze, form, onFinish }: any) => {

    //build initialValues object
    const initialValues: any = {};

    //iterate over field definitions and create a key on the initialValues
    // object with the field name as the key and the value of the field as the value
    fields.map((field: any) => {
        //some of fields are nested in arrays, so we need to handle them differently
        if(typeof (field.value) == 'object'){
            //for each nested field
            field.value.map((field: any) => {
                //add the field name as the key and the field value as the value to the initialValues object
                initialValues[field.name] = field.value;
            });
        //for fields that are NOT nested in arrays    
        }else{
            //add the field name as the key and the field value as the value to the initialValues object
            initialValues[field.name] = field.value;
        }
    });

    return (
        <Form
            form={form}
            initialValues={initialValues}
            layout="vertical"
            onFinish={onFinish}
        >
            <div className='flex flex-col gap-4 bg-[#f0f0f0] p-4'>
                <p className='font-semibold mb-2'>NBT Details</p>
                {fields.map((field: any) => {
                    return (
                        <div key={field.name} className={`${typeof (field.value) == 'object' ? 'flex gap-3' : 'flex-col'}`}>
                            
                            {typeof (field.value) == 'object' ?
                                field.value.map((item: any) => {
                                    return (
                                        <div key={item.name} className='flex flex-col gap-1 w-1/2'>
                                            <Form.Item
                                                name={item.name}
                                                label={item.label}
                                                rules={item.rules}
                                            >
                                                <Input
                                                    prefix={item?.prefix || null}
                                                    type={item.dataType}
                                                    placeholder={item.placeHolder}
                                                    onChange={(e) => handleChange(e, item.name)}
                                                    name={item.name}
                                                />
                                            </Form.Item>    
                                        </div>
                                    )
                                }) :
                                    <div className='flex flex-col gap-1'>
                                        <Form.Item
                                            name={field.name}
                                            label={field.label}
                                            rules={field.rules}
                                        >
                                            <Input
                                                prefix={field?.prefix || null}
                                                type={field.dataType}
                                                placeholder={field.placeHolder}
                                                onChange={(e) => handleChange(e, field.name)}
                                                name={field.name} 
                                            />
                                        </Form.Item>
                                    </div>
                            }
                        </div>)
                })}
                <Form.Item>
                    <Checkbox onChange={handleFreeze} value={frozen}>Freeze</Checkbox>
                </Form.Item>
            </div>
        </Form>
    )

}

export default NftDetailsForm
