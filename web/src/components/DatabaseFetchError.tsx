"use client";
import GeneralError from "./GeneralError";
import {useTranslation} from "react-i18next";
const DatabaseFetchError = () => {
  const {t} = useTranslation();

  return (
    <GeneralError
      error={true}
      message={t("Unable to fetch data from the database!")}
    />
  );
};

export default DatabaseFetchError;
