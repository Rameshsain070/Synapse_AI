import type { Token } from "./auth.ts";

export interface SessionResponse {
  session_id: string;
  name: string;
  token: Token;
}
