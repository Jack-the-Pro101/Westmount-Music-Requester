import { signOut, getSession } from "next-auth/react";

export default function logout({ session }) {
  return <button onClick={() => signOut()}>Logout</button>;
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/authentication/login",
      },
    };
  }

  return {
    props: {
      session,
    },
  };
}
