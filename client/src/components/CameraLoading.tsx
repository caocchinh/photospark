import LoadingSpinner from "./LoadingSpinner";
import {ImCamera} from "react-icons/im";
import {TextShimmer} from "./ui/text-shimmer";
import {useTranslation} from "react-i18next";
const CameraLoading = () => {
  const {t} = useTranslation();
  return (
    <div className="flex items-center justify-center gap-8 flex-col w-full">
      <div className="relative">
        <LoadingSpinner
          size={200}
          color="black"
        />
        <ImCamera
          className="text-4xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          size={80}
        />
      </div>
      <TextShimmer
        className=" font-semibold text-3xl uppercase text-center whitespace-nowrap  [--base-color:black] [--base-gradient-color:gray]"
        duration={1.5}
        spread={4}
      >
        {t("Waiting for camera...")}
      </TextShimmer>
    </div>
  );
};

export default CameraLoading;
