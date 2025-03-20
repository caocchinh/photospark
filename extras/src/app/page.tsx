import {getAllQueues} from "@/server/actions";
import Table from "./Table";
import Image from "next/image";
import {TextShimmer} from "@/components/ui/text-shimmer";
import {MdOutlinePermMedia} from "react-icons/md";

export default async function Home() {
  const avaialbleQueues = await getAllQueues();
  return (
    <div className="w-full min-h-screen mx-auto p-10 pt-4 flex flex-col gap-8 items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center justify-center gap-2">
          <TextShimmer
            className=" text-3xl font-semibold mb-2 text-center uppercase flex justify-center items-center  [--base-color:black] [--base-gradient-color:gray]"
            duration={5}
            spread={4}
          >
            Quản lý in ảnh
          </TextShimmer>
          <MdOutlinePermMedia size={25} />
        </div>

        <p className="text-center text-rose-500 mb-2">Hãy chắc chắn khách hàng đã trả tiền trước khi in ảnh!</p>
      </div>
      {avaialbleQueues.length > 0 ? (
        <Table avaialbleQueues={avaialbleQueues} />
      ) : (
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-4xl font-semibold uppercase">Không có dữ liệu</h1>
          <Image
            src="/ass.gif"
            alt="twerk"
            width={100}
            height={100}
          />
        </div>
      )}
    </div>
  );
}
