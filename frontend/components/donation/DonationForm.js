"use client";
import { useMutation, gql } from "@apollo/client";
import { useEffect, useRef, useState } from "react";
import { formatRupiah } from "@/utils/FormatRP";

const CREATE_DONATION = gql`
  mutation CreateDontaion($name: String!, $message: String!, $amount: String!, $username: String!) {
    createDonation(
      donationInput: { name: $name, message: $message, amount: $amount, username: $username }
    ) {
      id
      name
      message
      amount
      token
    }
  }
`;

const PAYMENT = gql`
  mutation MakePayment($donationId: ID!, $status: String!) {
    payment(donationId: $donationId, status: $status)
  }
`;

const DonationForm = ({ username }) => {
  const nameRef = useRef();
  const messageRef = useRef();
  const [inputValue, setInputValue] = useState("");

  const [createDonation] = useMutation(CREATE_DONATION);
  const [payment, { data, loading, error }] = useMutation(PAYMENT);

  useEffect(() => {
    // You can also change below url value to any script url you wish to load,
    // for example this is snap.js for Sandbox Env (Note: remove `.sandbox` from url if you want to use production version)
    const midtransScriptUrl = "https://app.sandbox.midtrans.com/snap/snap.js";

    let scriptTag = document.createElement("script");
    scriptTag.src = midtransScriptUrl;

    // Optional: set script attribute, for example snap.js have data-client-key attribute
    // (change the value according to your client-key)
    // eslint-disable-next-line no-undef
    const myMidtransClientKey = process.env.NEXT_PUBLIC_CLIENT_KEY;
    scriptTag.setAttribute("data-client-key", myMidtransClientKey);

    document.body.appendChild(scriptTag);

    return () => {
      document.body.removeChild(scriptTag);
    };
  }, []);

  let errorMessages = {};
  const classNameNotError = "block mb-2 text-sm font-medium text-white";
  let classNameError;

  if (error) {
    console.log(error);
    error.graphQLErrors[0].data.forEach((error) => {
      const { path, message } = error;
      errorMessages[path] = message;
    });
    classNameError = "block mb-2 text-sm font-medium text-red-500";
  }

  const handleInputChange = (event) => {
    const rawValue = event.target.value;
    // Menghapus karakter non-digit dari input
    const cleanValue = rawValue.replace(/[^,\d]/g, "");

    // Memformat nilai ke format rupiah
    const formattedValue = formatRupiah(cleanValue);
    setInputValue(formattedValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = inputValue.split(" ")[1].replace(/\./g, "");

    try {
      const response = await createDonation({
        variables: {
          name: nameRef.current.value,
          message: messageRef.current.value,
          amount,
          username,
        },
      });

      if (response.errors) {
        return;
      }

      console.log(response);

      window.snap.pay(response.data.createDonation.token, {
        onSuccess: async function () {
          try {
            await payment({
              variables: {
                donationId: response.data.createDonation.id,
                status: "SUCCESS",
              },
            });
            console.log("SUCCESS");
          } catch (error) {
            console.log(error);
          }
        },
        onPending: function (result) {
          console.log("pending");
          console.log(result);
        },
        onError: async function () {
          try {
            await payment({
              variables: {
                donationId: response.data.createDonation.id,
                status: "FAILED",
              },
            });
            console.log("FAILED");
          } catch (error) {
            console.log(error);
          }
        },
        onClose: async function () {
          try {
            const result = await payment({
              variables: {
                donationId: response.data.createDonation.id,
                status: "CANCEL",
              },
            });
            console.log("CANCEL");
            console.log(result);
          } catch (error) {
            console.log(error);
          }
        },
      });

      setInputValue("");
      nameRef.current.value = "";
      messageRef.current.value = "";
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center mt-10 rounded-lg md:flex-row md:max-w-xl ">
        <img
          className="object-cover w-full rounded-t-lg h-96 md:h-auto md:w-48 md:rounded-none md:rounded-l-lg"
          src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.pngall.com%2Fwp-content%2Fuploads%2F5%2FUser-Profile-PNG-Clipart.png&f=1&nofb=1&ipt=320256434ee3e766224cc611084c7f6638cc537c7b252ef3eced92fba9db851c&ipo=images"
          alt="userProfile"
        />
        <div className="flex flex-col justify-between p-4 leading-normal">
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {username}
          </h5>
          <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
            Dukung saya dengan donate dibawah ini agar lebih bersemangat
          </p>
        </div>
      </div>
      <div className="w-full max-w-xl p-4 mt-20 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700">
        {data && data.payment === "SUCCESS" && (
          <p className="text-center text-green-500">Donation Succesfully</p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="amount"
              className={errorMessages.amount ? classNameError : classNameNotError}
            >
              {errorMessages.amount ? errorMessages.amount : "Amount"}
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              id="amount"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Rp 70.000"
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="name"
              className={errorMessages.name ? classNameError : classNameNotError}
            >
              {errorMessages.name ? errorMessages.name : "Name"}
            </label>
            <input
              ref={nameRef}
              type="text"
              id="name"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="message"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Message
            </label>
            <input
              ref={messageRef}
              type="text"
              id="message"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            {loading ? "Loading..." : "Pay"}
          </button>
        </form>
      </div>
    </>
  );
};

export default DonationForm;
