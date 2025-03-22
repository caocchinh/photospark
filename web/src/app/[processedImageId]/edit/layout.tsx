import {PhotoProvider} from "@/context/PhotoContext";
import {ReactNode} from "react";

export default function EditLayout({children}: {children: ReactNode}) {
  return <PhotoProvider>{children}</PhotoProvider>;
}
