import { useState } from "react";
import { X, Shield, Code, Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useApp } from "@/context/AppContext";
import { useAuth } from "@/hooks/useAuth";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function LoginModal() {

  const { loginModalOpen, closeLoginModal, loginRole } = useApp();
  const { login, loading } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Username dan password wajib diisi");
      return;
    }

    // FIX: login hanya 2 parameter
    const success = await login(username, password);

    if (success) {
      setUsername("");
      setPassword("");
      closeLoginModal();
    }

  };

  const handleClose = () => {
    setUsername("");
    setPassword("");
    setError("");
    closeLoginModal();
  };

  const isAdmin = loginRole === "admin";

  const Icon = isAdmin ? Shield : Code;
  const title = isAdmin ? "Login Admin" : "Login Developer";

  const color = isAdmin ? "text-amber-400" : "text-cyan-400";
  const bgColor = isAdmin ? "bg-amber-500/20" : "bg-cyan-500/20";

  return (
    <AnimatePresence>

      {loginModalOpen && (
        <>

          {/* BACKDROP */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80]"
            onClick={handleClose}
          />

          {/* MODAL */}

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center z-[90] p-4"
          >

            <div
              className={cn(
                "w-full max-w-md rounded-[20px] p-8",
                "bg-[#1e293b] border border-cyan-500/20",
                "shadow-2xl shadow-cyan-500/10"
              )}
              onClick={(e) => e.stopPropagation()}
            >

              {/* HEADER */}

              <div className="flex items-center justify-between mb-6">

                <div className="flex items-center gap-3">

                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      bgColor
                    )}
                  >
                    <Icon className={cn("w-6 h-6", color)} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    <p className="text-sm text-white/50">
                      Masukkan kredensial Anda
                    </p>
                  </div>

                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="text-white/50 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </Button>

              </div>

              {/* FORM */}

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* USERNAME */}

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Username
                  </label>

                  <Input
                    type="text"
                    placeholder="Masukkan username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={cn(
                      "bg-[#0f172a] border-white/10 text-white placeholder:text-white/30",
                      "focus:border-cyan-500/50 focus:ring-cyan-500/20"
                    )}
                    disabled={loading}
                  />
                </div>

                {/* PASSWORD */}

                <div>

                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Password
                  </label>

                  <div className="relative">

                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={cn(
                        "bg-[#0f172a] border-white/10 text-white placeholder:text-white/30",
                        "focus:border-cyan-500/50 focus:ring-cyan-500/20",
                        "pr-10"
                      )}
                      disabled={loading}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    >
                      {showPassword
                        ? <EyeOff className="w-4 h-4" />
                        : <Eye className="w-4 h-4" />}
                    </button>

                  </div>

                </div>

                {/* ERROR */}

                <AnimatePresence>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                </AnimatePresence>

                {/* BUTTON */}

                <Button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "w-full h-12 rounded-xl font-medium",
                    isAdmin
                      ? "bg-amber-500 hover:bg-amber-600 text-white"
                      : "bg-cyan-500 hover:bg-cyan-600 text-white"
                  )}
                >

                  {loading
                    ? <Loader2 className="w-5 h-5 animate-spin" />
                    : "Login"}

                </Button>

              </form>

              {/* INFO */}

              <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/5">
                <p className="text-xs text-white/40 text-center">
                  Sign In with your account
                </p>
              </div>

            </div>

          </motion.div>

        </>
      )}

    </AnimatePresence>
  );
}