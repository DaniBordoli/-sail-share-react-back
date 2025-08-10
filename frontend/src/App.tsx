import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterStep2 from "./pages/RegisterStep2";
import AuthSuccess from "./pages/AuthSuccess";
import VerifyEmailSuccess from "./pages/VerifyEmailSuccess";
import VerifyEmailHandler from "./pages/VerifyEmailHandler";
import VerifyEmailError from "./pages/VerifyEmailError";
import RegisterEmailSent from "./pages/RegisterEmailSent";
import ListYourBoat from "./pages/ListYourBoat";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-step2" element={<RegisterStep2 />} />
          <Route path="/auth/success" element={<AuthSuccess />} />
          <Route path="/verify-email" element={<VerifyEmailHandler />} />
          <Route path="/verify-email/success" element={<VerifyEmailSuccess />} />
          <Route path="/verify-email/error" element={<VerifyEmailError />} />
          <Route path="/register-email-sent" element={<RegisterEmailSent />} />
          <Route path="/list-your-boat" element={<ListYourBoat />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
