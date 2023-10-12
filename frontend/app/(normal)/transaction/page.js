import Transaction from "@/components/donation/Transaction";

export const metadata = {
  title: "Transaction",
  description: "This is your transaction",
};

const TransactionPage = () => {
  return (
    <div className="flex items-center justify-center h-screen ">
      <Transaction />
    </div>
  );
};

export default TransactionPage;
