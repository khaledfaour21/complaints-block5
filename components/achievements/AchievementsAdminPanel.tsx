import React, { useEffect, useState } from "react";
import { useLangStore, useToastStore } from "../../store";
import { api } from "../../services/api";
import { Achievement } from "../../types";
import {
  TrashIcon,
  PencilIcon,
  PlusIcon,
  PhotoIcon,
  VideoCameraIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { TableSkeleton } from "../shared/LoadingStates";
import { ConfirmDialog } from "../shared/ConfirmDialog";
import { Modal } from "../shared/Modal";

// Simulating image compression
const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve) => {
    // In a real app, use 'browser-image-compression'
    setTimeout(() => resolve(file), 200);
  });
};

export const AchievementsAdminPanel: React.FC = () => {
  const { t, lang } = useLangStore();
  const { addToast } = useToastStore();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Achievement | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getLocalizedText = (en: string, ar?: string) => {
    return lang === "ar" && ar ? ar : en;
  };

  const loadData = () => {
    setLoading(true);
    api.getAchievements().then((data) => {
      setAchievements(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploading(true);
      const fileList = Array.from(e.target.files);
      const compressed = await Promise.all(fileList.map(compressImage));
      setFiles((prev) => [...prev, ...compressed]);
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const form = e.target as HTMLFormElement;
      const data: Achievement = {
        id: editing ? editing.id : Date.now().toString(),
        title: (form.elements.namedItem("title") as HTMLInputElement).value,
        titleAr:
          (form.elements.namedItem("titleAr") as HTMLInputElement).value ||
          undefined,
        description: (
          form.elements.namedItem("description") as HTMLTextAreaElement
        ).value,
        descriptionAr:
          (form.elements.namedItem("descAr") as HTMLTextAreaElement).value ||
          undefined,
        date: (form.elements.namedItem("date") as HTMLInputElement).value,
        media: editing
          ? editing.media
          : files.map((file) => ({
              url: URL.createObjectURL(file), // In real app, upload to server
              type: file.type.startsWith("video/") ? "video" : "image",
            })),
      };
      await api.saveAchievement(data);
      addToast(
        editing
          ? "Achievement updated successfully"
          : "Achievement created successfully",
        "success"
      );
      setModalOpen(false);
      setEditing(null);
      setFiles([]);
      loadData();
    } catch (error) {
      addToast("Failed to save achievement", "error");
    }
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await api.deleteAchievement(deleteId);
        addToast("Achievement deleted successfully", "success");
        setDeleteId(null);
        loadData();
      } catch (error) {
        addToast("Failed to delete achievement", "error");
      }
    }
  };

  const openEdit = (item: Achievement) => {
    setEditing(item);
    setModalOpen(true);
    // For editing, we don't populate files since we can't convert URLs back to File objects
    // In a real app, you'd handle this differently
  };

  const openNew = () => {
    setEditing(null);
    setFiles([]);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-cairo text-brand-primary dark:text-brand-accent">
          {t("achieve.manage")}
        </h2>
        <button
          onClick={openNew}
          className="btn btn-primary text-white gap-2 shadow-lg"
        >
          <PlusIcon className="w-5 h-5" /> {t("achieve.add")}
        </button>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className="card bg-base-100 shadow-xl border border-gray-200 dark:border-gray-700 group hover:shadow-2xl transition-all"
            >
              <figure className="h-48 w-full bg-gray-100 relative overflow-hidden">
                {ach.media.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <PhotoIcon className="w-12 h-12" />
                  </div>
                ) : ach.media.length === 1 ? (
                  ach.media[0].type === "video" ? (
                    <video
                      src={ach.media[0].url}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      controls
                    />
                  ) : (
                    <img
                      src={ach.media[0].url}
                      alt="Achievement"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )
                ) : (
                  <div className="grid grid-cols-2 gap-1 h-full">
                    {ach.media.slice(0, 4).map((media, index) => (
                      <div key={index} className="relative overflow-hidden">
                        {media.type === "video" ? (
                          <video
                            src={media.url}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            muted
                          />
                        ) : (
                          <img
                            src={media.url}
                            alt={`Achievement ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                        {index === 3 && ach.media.length > 4 && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              +{ach.media.length - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </figure>
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <h3 className="card-title font-cairo text-lg">
                    {getLocalizedText(ach.title, ach.titleAr)}
                  </h3>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {ach.date}
                    </span>
                    {ach.media.length > 0 && (
                      <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded flex items-center gap-1">
                        {ach.media.filter((m) => m.type === "image").length >
                          0 && <PhotoIcon className="w-3 h-3" />}
                        {ach.media.filter((m) => m.type === "video").length >
                          0 && <VideoCameraIcon className="w-3 h-3" />}
                        {ach.media.length}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {getLocalizedText(ach.description, ach.descriptionAr)}
                </p>
                <div className="card-actions justify-end mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => openEdit(ach)}
                    className="btn btn-sm btn-ghost gap-1 hover:bg-brand-lightBg"
                  >
                    <PencilIcon className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(ach.id)}
                    className="btn btn-sm btn-ghost text-error gap-1 hover:bg-red-50"
                  >
                    <TrashIcon className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? t("common.edit") : t("achieve.add")}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="form-control">
            <label className="label font-bold">Title (English)</label>
            <input
              name="title"
              defaultValue={editing?.title}
              className="input input-bordered w-full bg-brand-lightBg dark:bg-[#2a2a2a]"
              required
            />
          </div>
          <div className="form-control">
            <label className="label font-bold">Title (العربية)</label>
            <input
              name="titleAr"
              defaultValue={editing?.titleAr}
              className="input input-bordered w-full bg-brand-lightBg dark:bg-[#2a2a2a]"
              dir="rtl"
            />
          </div>
          <div className="form-control">
            <label className="label font-bold">Date</label>
            <input
              name="date"
              type="date"
              defaultValue={editing?.date}
              className="input input-bordered w-full bg-brand-lightBg dark:bg-[#2a2a2a]"
              required
            />
          </div>
          <div className="form-control">
            <label className="label font-bold">Description (English)</label>
            <textarea
              name="description"
              defaultValue={editing?.description}
              className="textarea textarea-bordered h-32 bg-brand-lightBg dark:bg-[#2a2a2a]"
              required
            ></textarea>
          </div>
          <div className="form-control">
            <label className="label font-bold">Description (العربية)</label>
            <textarea
              name="descAr"
              defaultValue={editing?.descriptionAr}
              className="textarea textarea-bordered h-32 bg-brand-lightBg dark:bg-[#2a2a2a]"
              dir="rtl"
            ></textarea>
          </div>
          <div className="form-control">
            <label className="label font-bold">Media (Photos & Videos)</label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:bg-brand-lightBg transition-colors cursor-pointer relative">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <PhotoIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="font-semibold text-brand-primary">
                Click or Drag photos/videos here
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Images and videos will be compressed automatically.
              </p>
            </div>
            {files.length > 0 && (
              <div className="flex gap-2 mt-4 overflow-x-auto py-2">
                {files.map((f, i) => (
                  <div
                    key={i}
                    className="badge badge-lg badge-outline gap-2 pl-4 bg-base-100"
                  >
                    {f.type.startsWith("video/") ? (
                      <VideoCameraIcon className="w-3 h-3" />
                    ) : (
                      <PhotoIcon className="w-3 h-3" />
                    )}
                    {f.name}
                    <button
                      type="button"
                      onClick={() =>
                        setFiles(files.filter((_, idx) => idx !== i))
                      }
                      className="btn btn-xs btn-ghost btn-circle"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {uploading && (
              <progress className="progress progress-primary w-full mt-2"></progress>
            )}
          </div>
          <div className="modal-action">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn"
            >
              {t("common.cancel")}
            </button>
            <button type="submit" className="btn btn-primary text-white px-8">
              {t("common.save")}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Achievement"
        message="Are you sure you want to delete this achievement? This action cannot be undone."
      />
    </div>
  );
};
