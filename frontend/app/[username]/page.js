import DonationForm from "@/components/donation/DonationForm";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Donate",
  description: "donate to your idol",
};

export async function getData(username) {
  const graphqlQuery = {
    query: `
    query GetUser($username: String!) {
        getUserByUsername(username: $username)
      }
    `,
    variables: {
      username,
    },
  };

  const response = await fetch("http://localhost:8000/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(graphqlQuery),
  });

  const user = await response.json();

  if (user.errors) {
    notFound();
  }

  return {
    username,
  };
}

const DonationPage = async ({ params }) => {
  const data = await getData(params.username);
  return (
    <div className="flex items-center justify-center h-screen flex-col">
      <DonationForm username={data.username} />
    </div>
  );
};

export default DonationPage;
