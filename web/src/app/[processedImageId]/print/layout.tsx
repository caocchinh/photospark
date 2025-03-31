import NavBar from "@/components/NavBar";
import {ReactNode} from "react";

export default function PrintLayout({children}: {children: ReactNode}) {
  return (
    <>
      <NavBar />
      {children}
    </>
  );
}
