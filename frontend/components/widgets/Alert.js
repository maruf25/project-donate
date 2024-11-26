"use client";
import { notFound, useSearchParams } from "next/navigation";
import { gql, useQuery, useSubscription } from "@apollo/client";
import { useEffect, useState } from "react";
import { formatRupiah } from "@/utils/FormatRP";

const GET_USER_PREFRENCE = gql`
  query getUserPref($stream_key: String!) {
    getUserPreference(stream_key: $stream_key) {
      background_color
      color_text
      duration
      highlight_color
      template_text
    }
  }
`;

const GET_DONATE_SUB = gql`
  subscription getDonationCreated($stream_key: String!) {
    donationCreated(stream_key: $stream_key) {
      name
      message
      amount
    }
  }
`;

const AlertComponent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [donationQueue, setDonationQueue] = useState([]);
  const [currentDonation, setCurrentDonation] = useState();

  const query = useSearchParams();
  const streamKey = query.get("stream_key");

  const { data, loading, error } = useQuery(GET_USER_PREFRENCE, {
    variables: {
      stream_key: streamKey,
    },
  });

  const { data: donateData } = useSubscription(GET_DONATE_SUB, {
    variables: {
      stream_key: streamKey,
    },
  });

  // Masukkan ke antrian
  useEffect(() => {
    if (donateData) {
      setDonationQueue((prevDonate) => [...prevDonate, donateData.donationCreated]);
    }
    // let timeout;
    // if (donateData) {
    //   timeout = setTimeout(() => {
    //     setIsVisible(true);
    //     setTimeout(() => {
    //       setIsVisible(false);
    //     }, data.getUserPreference.duration);
    //   }, data.getUserPreference.duration);
    // }

    // return () => {
    //   clearTimeout(timeout);
    // };
  }, [donateData]);

  // Tampilkan antrian dan hapus
  useEffect(() => {
    console.log(donationQueue);
    let timeout;
    if (donationQueue.length > 0) {
      const nextDonation = donationQueue[0];
      setCurrentDonation(nextDonation);
      setIsVisible(true);

      timeout = setTimeout(() => {
        setIsVisible(false);
        setDonationQueue((prevQueue) => prevQueue.slice(1)); // Hapus donasi yang sudah ditampilkan
      }, data?.getUserPreference.duration || 5000);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [donationQueue, data]);

  if (error) {
    notFound();
  }
  // if (data) {
  //   console.log(data.getUserPreference);
  // }

  // if (donateData) {
  //   console.log(donateData.donationCreated);
  // }

  return (
    <>
      {loading && <p className="text-center">Loading....</p>}
      {data && currentDonation && isVisible && (
        // <p>{donationQueue[0].message}</p>
        <div
          className="p-4 m-4 w-100 text-sm rounded-lg shadow-[8px_8px_0px_rgba(0,0,0,1)] "
          style={{ backgroundColor: data.getUserPreference.background_color }}
        >
          <p className="text-5xl text-center">
            <span className="font-medium" style={{ color: data.getUserPreference.highlight_color }}>
              {currentDonation.name}
            </span>{" "}
            <span style={{ color: data.getUserPreference.color_text }}>
              {data.getUserPreference.template_text}
            </span>
            <span className="font-medium" style={{ color: data.getUserPreference.highlight_color }}>
              {formatRupiah(currentDonation.amount)}
            </span>
          </p>
          <p className="text-4xl text-center">
            <span className="font-bold" style={{ color: data.getUserPreference.color_text }}>
              {currentDonation.message}
            </span>
          </p>
        </div>
      )}
      {/* <div>{streamKey}</div> */}
    </>
  );
};

export default AlertComponent;
