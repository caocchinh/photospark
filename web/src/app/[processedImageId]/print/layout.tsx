import LanguageBar from "@/components/LanguageBar";
import NavBar from "@/components/NavBar";
import {ReactNode} from "react";

const PrintLayout = ({children}: {children: ReactNode}) => {
  return (
    <>
      <NavBar />
      <div className="w-[95%] flex items-center justify-end pt-9">
        <LanguageBar />
      </div>
      {children}
    </>
  );
};

export default PrintLayout;
