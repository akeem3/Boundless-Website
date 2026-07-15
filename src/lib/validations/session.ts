import { z } from "zod";

export const sessionRegistrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  whatsapp: z.string().min(10, "Please enter a valid WhatsApp number"),
  payment_method: z.enum(["maybank", "tng"]),
  proof_url: z.string().url("Please upload your payment proof"),
});

export type SessionRegistrationInput = z.infer<typeof sessionRegistrationSchema>;
