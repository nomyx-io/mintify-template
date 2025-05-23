export interface KPIs {
  tokens: number;
  issuedValue: string;
  totalStocks: number | undefined;
  retiredTokens: number | undefined;
  activeTokens: number | undefined;
  activeTokenizedValue: string | undefined;
  totalTokenizedValue: string | undefined;
  totalRetiredAmount: string | undefined;
  totalDeposits: number;
  totalDepositAmount: number | undefined;
}
