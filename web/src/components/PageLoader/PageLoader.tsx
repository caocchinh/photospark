"use client";
import styles from "./PageLoader.module.css";

const PageLoader = () => {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-white bg-no-repeat bg-cover">
      <div className={styles.loader} />
    </div>
  );
};

export default PageLoader;
