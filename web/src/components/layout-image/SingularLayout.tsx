import {BorderTrail} from "../ui/border-trail";
import Image from "next/image";
const SingularLayout = () => {
  return (
    <div className="shadow-lg border w-[80%] sm:w-max relative rounded-sm ">
      <BorderTrail
        style={{
          boxShadow: "0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)",
        }}
        size={100}
      />
      <Image
        src="/single.jpg"
        width={400}
        height={700}
        alt="single"
        className="w-full"
      />
    </div>
  );
};

export default SingularLayout;
