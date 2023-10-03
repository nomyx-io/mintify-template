"use client";
import IconCard from '@/components/atoms/IconCard'
import React from 'react'
import {
    Tabs,
    TabsHeader,
    TabsBody,
    Tab,
} from "@material-tailwind/react";

export const EventFeed = ({ activeTab, setActiveTab, data, TabsData }: any) => {
    return (
        <div className='w-full lg:max-w-sm'>
            <Tabs value={activeTab}>
                <TabsHeader>
                    {TabsData.map(({ label, value }: any) => (
                        <Tab key={value} value={value} onClick={() => setActiveTab(value)}>
                            {label}
                        </Tab>
                    ))}
                </TabsHeader>
                <br />
                <TabsBody>
                    {Object.entries(data).map(([key, value]: any) => (
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
                                ))}
                        </div>
                    ))}
                </TabsBody>
            </Tabs>
        </div>
    )
}
