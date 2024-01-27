"use client";

import React from 'react'
import { Tabs, TabsProps } from "antd";
import IconCard from '@/components/atoms/IconCard';

export const EventFeed = ({ data, activeTab, setActiveTab, tabsData }: any) => {
    return (
        <div className='w-full lg:max-w-sm'>
            <Tabs
                defaultActiveKey="1"
                items={[
                    {
                        label: "All",
                        key: "all",
                        children:
                            Object.entries(data).map(([key, value]: any) => {

                                return (
                                    <div className='border-b' key={key}>
                                        <div>{key}</div>
                                        {
                                            value.data.map((item: any, index: any) => (
                                                <IconCard
                                                    key={`${key}-${index}`}
                                                    icon={<svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        height={24}
                                                        width={24}
                                                    >
                                                        <circle cx="12" cy="12" r="10" />
                                                        <polyline points="12 8 12 12 16 16" />
                                                        <line x1="8" y1="12" x2="12" y2="12" />
                                                    </svg>
                                                    }
                                                    name={item.name}
                                                    description={item.description}
                                                    value={item.value}
                                                />
                                            ))
                                        }
                                    </div>
                                );
                            })
                    }
                ]}
            />
        </div>
    )
}
