"use client";
import AuthContext from "@/provider/AuthContext";
import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { gql, useMutation, useQuery } from "@apollo/client";
import { showAlert } from "@/utils/ShowAlert";

const GET_TRANSACTION = gql`
  query getTransactions {
    getDonations {
      id
      name
      message
      amount
      createdAt
    }
  }
`;

const REPLAY_DONATION = gql`
  mutation ReplayDonation($donationId: ID!) {
    replayDonation(donationId: $donationId) {
      name
      message
      amount
    }
  }
`;

const Transaction = () => {
  const ctx = useContext(AuthContext);
  const router = useRouter();
  const token = localStorage.getItem("token");

  const { data, loading, error, refetch } = useQuery(GET_TRANSACTION, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    onCompleted: () => {
      refetch();
    },
  });

  const [replayDonation, { data: replayData, loading: replayLoading, error: replayError }] =
    useMutation(REPLAY_DONATION);

  useEffect(() => {
    if (!ctx.isLoggedIn && !token) {
      router.push("/login");
    }
    refetch();
    // if (error) {
    //   notFound();
    // }
  }, [ctx.isLoggedIn, router, token, refetch]);

  if (error) {
    return <p>Ini error</p>;
  }

  const handleReplay = async (id) => {
    try {
      const response = await replayDonation({
        variables: {
          donationId: id,
        },
        context: {
          headers: {
            Authorization: "Bearer " + token,
          },
        },
      });

      if (response.errors) {
        return;
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (replayData) {
    showAlert("Success", "Replay Success", "success");
  }
  if (replayError) {
    showAlert("Failed", "Replay failed,Try Again", "error");
  }

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg ">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Date
            </th>
            <th scope="col" className="px-6 py-3">
              Amount
            </th>
            <th scope="col" className="px-6 py-3">
              Name
            </th>
            <th scope="col" className="px-6 py-3">
              Message
            </th>
            <th scope="col" className="px-6 py-3">
              <span className="sr-only">Replay</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <th>Loading....</th>
            </tr>
          )}
          {data && data.getDonations.length <= 0 && (
            <tr>
              <th colSpan={4} className="text-center">
                Transaction Empty
              </th>
            </tr>
          )}
          {data &&
            data.getDonations.map((donation, key) => (
              <tr
                key={key}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  {donation.createdAt}
                </th>
                <td className="px-6 py-4">{donation.amount}</td>
                <td className="px-6 py-4">{donation.name}</td>
                <td className="px-6 py-4">{donation.message}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={handleReplay.bind(this, donation.id)}
                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                  >
                    {replayLoading ? "Loading...." : "Replay"}
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Transaction;
