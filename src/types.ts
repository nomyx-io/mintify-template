// src/types.ts
export interface Project {
  id: string;
  title: string;
  description: string;
  logo?: {
    url: () => string;
  };
  coverImage?: any;
  totalValue?: number;
  totalTokens?: number;
  createdAt?: Date;
  industryTemplate?: string;
  tradeDealId?: string;
  projectInfo?: any;
  isWithdrawn?: boolean;
  totalDepositAmount?: number;
}
