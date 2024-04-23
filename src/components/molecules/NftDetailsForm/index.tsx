import React from 'react';
import { Card, Form, Input } from 'antd';
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
        <Card title="NBT Details">
            <Form
                form={form}
                initialValues={initialValues}
                layout="vertical"
                onFinish={onFinish}
            >
                <div className="grid grid-cols-2 gap-4">

                    {fields.map((field: any, index:Number) => {

                        const colspan = `col-span-${field.gridSpan || 1}`;
                        return (

                            <div key={("field-" + index)} className={colspan}>

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

                            </div>)
                    })}
                    <Form.Item>
                        <Checkbox onChange={handleFreeze} checked={frozen} className='text-gray-400'>Freeze</Checkbox>
                    </Form.Item>
                </div>
            </Form>
        </Card>

    )

}

export default NftDetailsForm
