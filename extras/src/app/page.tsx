import {getAllQueues} from "@/server/actions";
import Table from "./Table";
import Image from "next/image";
export default async function Home() {
  const avaialbleQueues = await getAllQueues();
  return (
    <div className="w-full min-h-screen mx-auto p-10 pt-4 ">
      <h1 className="text-2xl font-bold mb-2 text-center">Quản lý in ảnh</h1>
      <p className="text-muted-foreground text-center">Hãy chắc chắn khách hàng đã trả tiền trước khi in ảnh!</p>
      {avaialbleQueues.length > 0 ? (
        <Table avaialbleQueues={avaialbleQueues} />
      ) : (
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-4xl font-semibold mb-4 uppercase">Không có dữ liệu</h1>
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
