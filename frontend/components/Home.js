"use client";
import { gql, useQuery } from "@apollo/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const GET_USER = gql`
  query getUser {
    getUserById {
      stream_key
    }
  }
`;

const HomeComponent = () => {
  const token = localStorage.getItem("token");
  const router = useRouter();

  const { data, loading, error } = useQuery(GET_USER, {
    context: {
      headers: {
        Authorization: "Bearer " + token,
      },
    },
  });

  useEffect(() => {
    if (error && error.message === "Not Authenticated") {
      router.push("/login");
    }
  }, [error, router]);

  if (loading) {
    return <p>Loading....</p>;
  }

  return (
    <div>
      {data && (
        <Link
          href={"/widgets/alert?stream_key=" + data.getUserById.stream_key}
          className="bg-blue-500 p-4 rounded shadow-md"
          target="_blank"
        >
          Link Alert
        </Link>
      )}
    </div>
  );
};

export default HomeComponent;
