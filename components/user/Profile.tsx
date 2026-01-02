import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuthStore, useLangStore, useToastStore } from "../../store";
import { api } from "../../services/api";
import { UserCircleIcon, MapPinIcon } from "@heroicons/react/24/outline";

export const Profile: React.FC = () => {
  const { user, login } = useAuthStore();
  const { t } = useLangStore();
  const { addToast } = useToastStore();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: user?.name,
      email: user?.email,
      district: user?.district || "",
    },
  });

  const onSubmit = async (data: any) => {
    if (!user) return;

    setLoading(true);
    try {
      // Call API to update user profile
      const updatedUser = await api.updateUser(user.id, {
        name: data.name,
        neighborhood: data.district, // API expects 'neighborhood'
      });

      // Update local store with response
      login(updatedUser);
      addToast(t("user.update_success"), "success");
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      addToast("Failed to update profile. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in space-y-6">
      <h1 className="text-3xl font-bold font-cairo text-brand-primary dark:text-brand-accent flex items-center gap-2">
        <UserCircleIcon className="w-8 h-8" /> {t("user.profile")}
      </h1>

      <div className="card bg-base-100 shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="card-body">
          <div className="flex items-center gap-4 mb-6">
            <div className="avatar placeholder">
              <div className="bg-brand-primary text-neutral-content rounded-full w-20 text-3xl">
                <span>{user.name.charAt(0).toUpperCase()}</span>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <div className="badge badge-outline mt-1 uppercase">
                {user.role}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="form-control">
              <label className="label font-bold">{t("profile.name")}</label>
              <input {...register("name")} className="input input-bordered" />
            </div>
            <div className="form-control">
              <label className="label font-bold">{t("profile.email")}</label>
              <input
                {...register("email")}
                className="input input-bordered"
                disabled
              />
              <label className="label">
                <span className="label-text-alt text-warning">
                  {t("profile.email_change")}
                </span>
              </label>
            </div>
            {user.district && (
              <div className="form-control">
                <label className="label font-bold">
                  {t("profile.district")}
                </label>
                <div className="relative">
                  <MapPinIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400 rtl:right-3 rtl:left-auto" />
                  <input
                    {...register("district")}
                    className="input input-bordered pl-10 rtl:pr-10 rtl:pl-3 w-full"
                  />
                </div>
              </div>
            )}
            <div className="form-control mt-6">
              <button className="btn btn-primary text-white" disabled={loading}>
                {loading ? (
                  <span className="loading loading-dots"></span>
                ) : (
                  t("common.save")
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
