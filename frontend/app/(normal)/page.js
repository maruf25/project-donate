// import Image from "next/image";

import HomeComponent from "@/components/Home";

export const metadata = {
  title: "Home",
  description: "created for homepage donation",
};

export default function Home() {
  return (
    <div className="flex items-center justify-center h-screen flex-col">
      <HomeComponent />
    </div>
  );
}
