import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuthStore, useLangStore } from "../store";
import { Role } from "../types";
import { LockClosedIcon, UserIcon } from "@heroicons/react/24/outline";

export const Login: React.FC = () => {
  const { t } = useLangStore();
  const { login, loginWithCredentials } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError("");

    try {
      const success = await loginWithCredentials(data.email, data.password);
      if (success) {
        navigate("/dashboard-select");
      } else {
        setError(t("login.invalid_credentials"));
      }
    } catch (err: any) {
      if (err.message === "RATE_LIMIT_EXCEEDED") {
        setError("Too many login attempts. Please wait before trying again.");
      } else {
        setError(t("login.failed"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card w-full max-w-md bg-white dark:bg-[#1e1e1e] shadow-2xl border border-brand-primary/5 animate-fade-in-up">
        <div className="card-body">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-4 text-brand-accent text-2xl font-bold">
              <LockClosedIcon className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold font-cairo text-brand-primary dark:text-brand-accent">
              {t("login.title")}
            </h2>
            <p className="text-sm text-gray-500">
              Secure Access for Authorized Personnel
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  {t("login.email")}
                </span>
              </label>
              <div className="relative">
                <UserIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400 rtl:right-3 rtl:left-auto" />
                <input
                  type="email"
                  {...register("email")}
                  className="input input-bordered w-full pl-10 rtl:pr-10 rtl:pl-4 bg-brand-lightBg dark:bg-[#2a2a2a]"
                  placeholder="demo@fifthblock.sy"
                  required
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  {t("login.pass")}
                </span>
              </label>
              <div className="relative">
                <LockClosedIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400 rtl:right-3 rtl:left-auto" />
                <input
                  type="password"
                  {...register("password")}
                  className="input input-bordered w-full pl-10 rtl:pr-10 rtl:pl-4 bg-brand-lightBg dark:bg-[#2a2a2a]"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="alert alert-error text-sm py-2">{error}</div>
            )}

            <div className="form-control mt-6">
              <button
                disabled={loading}
                className="btn btn-primary text-white text-lg"
              >
                {loading ? (
                  <span className="loading loading-dots"></span>
                ) : (
                  t("login.btn")
                )}
              </button>
            </div>
          </form>

          <div className="divider">OR</div>
          <div className="form-control">
            <button
              onClick={() => {
                login({
                  id: "demo",
                  name: "Demo Manager",
                  email: "demo@fifthblock.sy",
                  role: Role.MANAGER,
                });
                navigate("/dashboard-select");
              }}
              className="btn btn-outline text-lg mb-2"
              style={{ borderColor: "#7c3aed", color: "#7c3aed" }}
            >
              Demo Manager Login
            </button>
            <button
              onClick={() => {
                login({
                  id: "demo-admin",
                  name: "Demo Admin",
                  email: "demo-admin@fifthblock.sy",
                  role: Role.ADMIN,
                });
                navigate("/dashboard-select");
              }}
              className="btn btn-outline text-lg mb-2"
              style={{ borderColor: "#428177", color: "#428177" }}
            >
              Demo Admin Login
            </button>
            <button
              onClick={() => {
                login({
                  id: "demo-muktar",
                  name: "Demo Muktar",
                  email: "demo-muktar@fifthblock.sy",
                  role: Role.MUKTAR,
                  district: "Demo District",
                });
                navigate("/dashboard-select");
              }}
              className="btn btn-outline text-lg"
              style={{ borderColor: "#dc2626", color: "#dc2626" }}
            >
              Demo Muktar Login
            </button>
          </div>

          <div className="divider">DEMO HINT</div>
          <div className="text-xs text-center text-gray-400 space-y-1">
            <p>Manager: demo@fifthblock.sy</p>
            <p>Admin: demo-admin@fifthblock.sy</p>
            <p>Muktar: demo-muktar@fifthblock.sy</p>
            <p>Citizen: Use Demo Login above</p>
          </div>
        </div>
      </div>
    </div>
  );
};
