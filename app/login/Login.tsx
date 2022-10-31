"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function Login() {
  const { data: session } = useSession();

  if (session) {
    return (
      <>
        <h1>{session?.user?.email}</h1>
        <button onClick={() => signOut()}>Sign Out</button>
      </>
    );
  } else {
    return <button onClick={() => signIn()}>Sign In</button>;
  }
}
