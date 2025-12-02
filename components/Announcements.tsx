import React, { useEffect, useState } from "react";
import { useAuthStore, useLangStore } from "../store";
import { Role, Announcement } from "../types";
import { api } from "../services/api";
import {
  MegaphoneIcon,
  PlusIcon,
  TrashIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

export const Announcements: React.FC = () => {
  const { t } = useLangStore();
  const { user } = useAuthStore();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);

  const canEdit =
    user && (user.role === Role.ADMIN || user.role === Role.MANAGER);

  useEffect(() => {
    api.getAnnouncements().then((data) => {
      setAnnouncements(data);
      setLoading(false);
    });
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock create
    const form = e.target as HTMLFormElement;
    const newAnn: Announcement = {
      id: Date.now().toString(),
      title: (form.elements.namedItem("title") as HTMLInputElement).value,
      description: (form.elements.namedItem("desc") as HTMLTextAreaElement)
        .value,
      category: "General",
      date: new Date().toLocaleDateString(),
      isSticky: (form.elements.namedItem("sticky") as HTMLInputElement).checked,
    };
    setAnnouncements([newAnn, ...announcements]);
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(t("announcements.delete_confirm"))) {
      setAnnouncements(announcements.filter((a) => a.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-cairo text-brand-primary dark:text-brand-accent flex items-center gap-3">
          <MegaphoneIcon className="w-8 h-8" /> {t("ann.title")}
        </h1>
        {canEdit && (
          <button
            onClick={() => setModalOpen(true)}
            className="btn btn-primary text-white gap-2"
          >
            <PlusIcon className="w-5 h-5" /> {t("ann.create")}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-10">
          <span className="loading loading-bars loading-lg"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`card bg-base-100 shadow-xl transition-all hover:shadow-2xl ${
                ann.isSticky ? "border-2 border-brand-accent" : ""
              }`}
            >
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <div className="badge badge-outline">
                    {t(
                      `announcements.categories.${ann.category.toLowerCase()}`
                    ) || ann.category}
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => handleDelete(ann.id)}
                      className="btn btn-ghost btn-xs text-error"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <h2 className="card-title text-xl mt-2">{ann.title}</h2>
                {ann.isSticky && (
                  <span className="text-xs font-bold text-brand-accent uppercase tracking-widest flex items-center gap-1">
                    <MapPinIcon className="w-3 h-3" />{" "}
                    {t("announcements.pinned_badge")}
                  </span>
                )}
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  {ann.description}
                </p>
                <div className="card-actions justify-end mt-4">
                  <span className="text-xs opacity-50">{ann.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">{t("ann.create")}</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                name="title"
                className="input input-bordered w-full"
                placeholder={t("announcements.form_title_placeholder")}
                required
              />
              <textarea
                name="desc"
                className="textarea textarea-bordered w-full"
                placeholder={t("announcements.form_description_placeholder")}
                required
              ></textarea>
              <label className="label cursor-pointer justify-start gap-4 border rounded p-2">
                <input
                  name="sticky"
                  type="checkbox"
                  className="checkbox checkbox-primary"
                />
                <span className="label-text font-bold">{t("ann.sticky")}</span>
              </label>
              <div className="modal-action">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn"
                >
                  {t("common.cancel")}
                </button>
                <button type="submit" className="btn btn-primary text-white">
                  {t("announcements.post_button")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
