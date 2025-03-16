import {BorderTrail} from "@/components/border-trail";
import Preview from "@/components/Preview";
import {getImage, getProcessedImage, getVideo} from "@/server/actions";
import Link from "next/link";
import {IoIosWarning, IoIosArrowBack} from "react-icons/io";

type Params = Promise<{id: string}>;

const PreviewPage = async (props: {params: Params}) => {
  const params = await props.params;
  const id = params.id;

  const processedImage = await getProcessedImage(id);
  const images = await getImage(id);
  const video = await getVideo(id);

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-white bg-no-repeat bg-cover">
      {processedImage.error || !processedImage.data ? (
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="p-6 w-[90%] md:w-[400px] bg-white/90 rounded-lg shadow-lg flex flex-col items-center justify-center gap-4 border relative">
            <BorderTrail
              style={{
                boxShadow: "0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)",
              }}
              size={100}
            />
            <IoIosWarning
              className="text-red-600"
              size={100}
            />
            <h2 className="text-3xl font-bold text-red-600">ERROR</h2>
            <p className="text-gray-800 text-xl uppercase">Hình không tồn tại!</p>
          </div>
          <Link
            href="/"
            className="text-white text-xl w-full uppercase bg-black px-4 py-2 rounded-md flex items-center justify-center gap-2"
          >
            <IoIosArrowBack
              className="text-white"
              size={20}
            />
            <p className="text-white text-xl">Quay lại trang chủ</p>
          </Link>
        </div>
      ) : (
        <Preview
          processedImage={processedImage.data}
          images={images.data}
          video={video.data}
        />
      )}
    </div>
  );
};

export default PreviewPage;
