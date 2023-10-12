import AlertComponent from "@/components/widgets/Alert";

export const metadata = {
  title: "Alert",
  description: "Alert showing in your streaming",
};

const AlertPage = () => {
  return (
    <div className="flex h-screen flex-col bg-white">
      <AlertComponent />
    </div>
  );
};

export default AlertPage;
