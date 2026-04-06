// Placeholder for transaction hooks - simplified for crypto exchange
export function useTransactions() {
  return { data: null, isLoading: false };
}

export function useCreateTransaction() {
  return { mutate: () => {}, isLoading: false };
}
