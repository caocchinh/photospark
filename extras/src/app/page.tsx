import {getAllQueues} from "@/server/actions";
import Table from "./Table";
import Image from "next/image";
import {TextShimmer} from "@/components/ui/text-shimmer";
import {MdOutlinePermMedia} from "react-icons/md";
import ErrorDialog from "@/components/ErrorDialog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const availableQueues = await getAllQueues();
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen gap-8 p-10 pt-0 mx-auto">
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

        <p className="mb-2 text-center text-rose-500">Hãy chắc chắn khách hàng đã trả tiền trước khi in ảnh!</p>
      </div>
      {!availableQueues && <div>Loading</div>}

      {availableQueues && (
        <>
          {!availableQueues.error ? (
            <>
              {availableQueues.response && availableQueues.response.length > 0 ? (
                <Table availableQueues={availableQueues.response} />
              ) : (
                <div className="flex flex-col items-center justify-center h-screen">
                  <h1 className="text-4xl font-semibold uppercase">Không có dữ liệu</h1>
                  <Image
                    src="/what.gif"
                    alt="twerk"
                    unoptimized
                    width={100}
                    height={100}
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <ErrorDialog />
            </>
          )}
        </>
      )}
    </div>
  );
}
