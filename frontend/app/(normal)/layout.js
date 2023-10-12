import Navbar from "@/components/Navbar";

export const metadata = {
  title: {
    template: "%s",
    default: "ERROR NOT FOUND",
  },
  description: {
    template: "%s",
  },
};

export default function RootLayout({ children }) {
  return (
    <section>
      <Navbar />
      {children}
    </section>
  );
}
