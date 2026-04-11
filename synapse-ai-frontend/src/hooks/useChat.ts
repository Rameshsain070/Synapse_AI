import { useContext } from "react";
import { ChatContext } from "../context/ChatContext.tsx";

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
