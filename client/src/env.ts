import {z} from "zod";
const envVariables = z.object({
  CLOUDFARE_ACCOUNT_ID: z.string(),
  R2_ACCESS_KEY_ID: z.string(),
  R2_SECRET_ACCESS_KEY: z.string(),
  NEON_DATABASE_URL: z.string(),
  NEXT_PUBLIC_QR_DOMAIN: z.string(),
  NEXT_PUBLIC_SOCKET_URL: z.string(),
});

envVariables.parse(process.env);

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}
