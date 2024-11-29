"use client";
import { notFound, useSearchParams } from "next/navigation";
import { gql, useQuery, useSubscription } from "@apollo/client";
import { useEffect, useRef, useState } from "react";
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
  const audioRef = useRef();

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
  }, [donateData]);

  // Tampilkan antrian dan hapus
  useEffect(() => {
    if (donationQueue.length > 0 && !isVisible) {
      console.log("start");
      const nextDonation = donationQueue[0];
      setCurrentDonation(nextDonation);

      audioRef.current.src = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
      audioRef.current.muted = false;
      audioRef.current.play();

      // Menghentikan pemutaran setelah 3 detik
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
        }
      }, 3000);

      setIsVisible(true);

      setTimeout(() => {
        console.log("selesai");

        setIsVisible(false);
        setDonationQueue((prevQueue) => prevQueue.slice(1));
      }, data?.getUserPreference.duration || 5000);
    }
  }, [donationQueue, data?.getUserPreference.duration, isVisible]);

  if (error) {
    notFound();
  }

  return (
    <>
      <audio ref={audioRef} muted></audio>
      {loading && <p className="text-center">Loading....</p>}
      {data && currentDonation && isVisible && (
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
    </>
  );
};

export default AlertComponent;
