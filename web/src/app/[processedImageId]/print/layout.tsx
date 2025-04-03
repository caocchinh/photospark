import NavBar from "@/components/NavBar";
import {ReactNode} from "react";

const PrintLayout = ({children}: {children: ReactNode}) => {
  return (
    <>
      <NavBar />
      {children}
    </>
  );
};

export default PrintLayout;
