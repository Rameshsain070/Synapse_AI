import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { ChatProvider } from "./context/ChatContext.tsx";
import { ToastProvider } from "./components/common/Toast.tsx";
import { ProtectedRoute } from "./routes/ProtectedRoute.tsx";
import { LoginPage } from "./pages/LoginPage.tsx";
import { RegisterPage } from "./pages/RegisterPage.tsx";
import { ChatPage } from "./pages/ChatPage.tsx";
import { TodoPage } from "./pages/TodoPage.tsx";
import { NotFoundPage } from "./pages/NotFoundPage.tsx";

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ThemeProvider>
        <AuthProvider>
          <ChatProvider>
            <ToastProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/chat"
                  element={
                    <ProtectedRoute>
                      <ChatPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/todo" element={<TodoPage />} />
                <Route path="/" element={<Navigate to="/chat" replace />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </ToastProvider>
          </ChatProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
