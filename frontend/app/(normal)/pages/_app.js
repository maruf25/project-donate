// import { AppoloProviderContext } from "@/provider/Appolo";
// import RootLayout from "./layout";
// import NextHead from "next/head";
// import { useEffect } from "react";

export default function App({ Component, pageProps }) {
  // useEffect(() => {
  //   document.title = pageProps.metadata.title || "Judul Default"; // Menggunakan judul default jika tidak ada judul di metadata
  // }, [pageProps.metadata]);
  return <Component {...pageProps} />;
}
