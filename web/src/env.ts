import {z} from "zod";
const envVariables = z.object({
  NEON_DATABASE_URL: z.string(),
  NEXT_PUBLIC_R2_PUBLIC_BUCKET_DEVELOPMENT_URL: z.string(),
  NEXT_PUBLIC_R2_PUBLIC_BUCKET_PRODUCTION_URL: z.string(),
});

envVariables.parse(process.env);

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}
