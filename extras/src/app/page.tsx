import {getAllQueues} from "@/server/actions";
import Table from "./Table";
export default async function Home() {
  const avaialbleQueues = await getAllQueues();
  return (
    <div className="w-[50vw] mx-auto py-10 ">
      <h1 className="text-2xl font-bold mb-4">Quản lý in ảnh</h1>
      <p className="text-muted-foreground mb-6">Hãy chắc chắn khách hàng đã trả tiền trước khi in ảnh!</p>
      {avaialbleQueues.length > 0 ? <Table avaialbleQueues={avaialbleQueues} /> : <div>Không có dữ liệu</div>}
    </div>
  );
}
