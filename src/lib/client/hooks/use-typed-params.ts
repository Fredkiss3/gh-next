import { z } from "zod";
import { useParams } from "next/navigation";

export function useTypedParams<TSchema extends z.Schema>(
  schema: TSchema,
  errorMessage = "Error parsing params, you are maybe in the wrong route"
): z.output<TSchema> {
  const _params = useParams();
  const res = schema.safeParse(_params);
  if (!res.success) {
    throw new Error(errorMessage, { cause: res.error.flatten().fieldErrors });
  }
  return res.data;
}
