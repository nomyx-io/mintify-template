import IconCard from '@/components/atoms/IconCard'
import React from 'react'

export const EventFeed = () => {
    const data = {
        "Pending": {
            data: [{
                name: "abc",
                description: "description",
                value: "value"
            }]
        },
        "Today": {
            data: [{
                name: "abc",
                description: "description",
                value: "value"
            }]
        },
        "Date": {
            data: [{
                name: "abc",
                description: "description",
                value: "value"
            }]
        }
    }
    return (
        <div className='max-w-sm'>
            {Object.entries(data).map(([key, value]) => (
                <div className='border-b'>
                    <div>{key}</div>
                    {
                        value.data.map((item, index) => (
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
        </div>
    )
}
