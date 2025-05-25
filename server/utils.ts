import fs from "fs";
import path from "path";
import { exec } from "child_process";
import winston from "winston";

export function currentTime() {
  const currentDate = new Date();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const day = currentDate.getDate();

  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();
  const seconds = currentDate.getSeconds();

  const dateString = `${String(day).padStart(2, "0")}-${String(month).padStart(
    2,
    "0"
  )}-${year}`;
  const timeString = `${String(hours).padStart(2, "0")}h_${String(
    minutes
  ).padStart(2, "0")}m_${String(seconds).padStart(2, "0")}s`;

  const dateTimeString = `${dateString}-${timeString}`;

  return dateTimeString;
}

export async function updatePrinterRegistry(printerName: string) {
  const hexFilePath = path.join(
    process.cwd(),
    "powershell",
    "preferences-hex.txt"
  );
  const printerHexValue = `hex:${fs.readFileSync(hexFilePath, "utf8").trim()}`;

  const regContent = `Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\\Printers\\DevModes2]
"${printerName}"=${printerHexValue}

[HKEY_CURRENT_USER\\Printers\\DevModePerUser]
"${printerName}"=${printerHexValue}`;

  const regFilePath = path.join(
    process.cwd(),
    "powershell",
    "CurrentPrinterSettings.reg"
  );
  fs.writeFileSync(regFilePath, regContent);

  return new Promise<void>((resolve, reject) => {
    const importCommand = `reg import "${regFilePath}"`;
    exec(importCommand, { shell: "powershell.exe" }, (error, _, stderr) => {
      if (error) {
        reject(
          new Error(`Failed to import registry settings: ${error.message}`)
        );
        return;
      }
      resolve();
    });
  });
}

export function getAllCP1500Printers(): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const command = `powershell -NoProfile -NonInteractive -WindowStyle Hidden -Command "(Get-Printer | Where Name -like '*CP1500*').Name"`;

    exec(command, { shell: "powershell.exe" }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      if (stderr) {
        reject(new Error(stderr));
        return;
      }
      const printerNames = stdout
        .trim()
        .split("\n")
        .map((name) => name.trim())
        .filter(Boolean);
      if (printerNames.length === 0) {
        reject(new Error("No CP1500 printer found"));
        return;
      }
      resolve(printerNames);
    });
  });
}

export function getCP1500Printer(): Promise<string> {
  return new Promise((resolve, reject) => {
    getAllCP1500Printers()
      .then((printers) => resolve(printers[0]))
      .catch(reject);
  });
}

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

export function getProjectPath(...pathSegments: string[]): string {
  return path.join(process.cwd(), ".", ...pathSegments);
}

export function logFailedFileUpload(id: string, url: string, error?: string) {
  const failedUploadsDir = getProjectPath("logs", "failed-uploads");
  if (!fs.existsSync(failedUploadsDir)) {
    fs.mkdirSync(failedUploadsDir, { recursive: true });
  }

  const timestamp = currentTime();
  const logEntry = `[${timestamp}] ID: ${id}, URL: ${url}${
    error ? `, Error: ${error}` : ""
  }\n`;
  const logFilePath = path.join(failedUploadsDir, "failed-uploads.txt");

  fs.appendFileSync(logFilePath, logEntry);
  logger.info(`Failed upload logged to file: ${logFilePath}`);
}
