import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Announcement } from "../../types";
import { useLangStore, useToastStore } from "../../store";
import {
  TrashIcon,
  PencilIcon,
  PlusIcon,
  MegaphoneIcon,
} from "@heroicons/react/24/outline";
import { TableSkeleton } from "../shared/LoadingStates";
import { ConfirmDialog } from "../shared/ConfirmDialog";
import { Modal } from "../shared/Modal";

export const AnnouncementsAdminPanel: React.FC = () => {
  const { t } = useLangStore();
  const { addToast } = useToastStore();
  const [list, setList] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api.getAnnouncements().then((res) => {
      setList(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const val = (name: string) => (form.elements.namedItem(name) as any).value;

    try {
      const item: Announcement = {
        id: editing ? editing.id : Date.now().toString(),
        title: val("title"),
        titleAr: val("titleAr") || undefined,
        description: val("desc"),
        descriptionAr: val("descAr") || undefined,
        category: val("category"),
        categoryAr: val("categoryAr") || undefined,
        date: editing?.date || new Date().toLocaleDateString(),
        isSticky: (form.elements.namedItem("sticky") as HTMLInputElement)
          .checked,
      };

      await api.saveAnnouncement(item);
      addToast(
        editing
          ? t("announcements.update_success")
          : t("announcements.create_success"),
        "success"
      );
      setModalOpen(false);
      load();
    } catch (e) {
      addToast(t("announcements.error_save"), "error");
    }
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await api.deleteAnnouncement(deleteId);
        addToast(t("announcements.delete_success"), "info");
        setDeleteId(null);
        load();
      } catch (e) {
        addToast(t("announcements.error_delete"), "error");
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2 font-cairo text-brand-primary dark:text-brand-accent">
          <MegaphoneIcon className="w-6 h-6" /> {t("dash.manage_ann")}
        </h2>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="btn btn-primary text-white gap-2 shadow-lg"
        >
          <PlusIcon className="w-5 h-5" /> {t("ann.create")}
        </button>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="overflow-x-auto bg-base-100 shadow-xl rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="table w-full">
            <thead className="bg-base-200">
              <tr>
                <th>{t("announcements.table_title")}</th>
                <th>{t("announcements.table_category")}</th>
                <th>{t("announcements.table_date")}</th>
                <th>{t("announcements.table_sticky")}</th>
                <th className="text-right">
                  {t("announcements.table_actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-brand-lightBg/50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="font-bold">{item.title}</td>
                  <td>
                    <div className="badge badge-ghost">{item.category}</div>
                  </td>
                  <td className="text-sm opacity-70">{item.date}</td>
                  <td>
                    {item.isSticky ? (
                      <span className="badge badge-accent text-white">
                        {t("announcements.yes")}
                      </span>
                    ) : (
                      t("announcements.no")
                    )}
                  </td>
                  <td className="flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        setEditing(item);
                        setModalOpen(true);
                      }}
                      className="btn btn-square btn-sm btn-ghost hover:bg-blue-50 hover:text-blue-600"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(item.id)}
                      className="btn btn-square btn-sm btn-ghost text-error hover:bg-red-50"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editing ? t("modal.edit_announcement") : t("modal.new_announcement")
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label font-bold">
              {t("announcements.form_title")} (English)
            </label>
            <input
              name="title"
              defaultValue={editing?.title}
              className="input input-bordered w-full bg-brand-lightBg dark:bg-[#2a2a2a]"
              placeholder={t("announcements.form_title_placeholder")}
              required
            />
          </div>
          <div className="form-control">
            <label className="label font-bold">
              {t("announcements.form_title")} (العربية)
            </label>
            <input
              name="titleAr"
              defaultValue={editing?.titleAr}
              className="input input-bordered w-full bg-brand-lightBg dark:bg-[#2a2a2a]"
              placeholder="عنوان الإعلان بالعربية"
              dir="rtl"
            />
          </div>
          <div className="form-control">
            <label className="label font-bold">
              {t("announcements.form_category")} (English)
            </label>
            <select
              name="category"
              defaultValue={editing?.category}
              className="select select-bordered w-full bg-brand-lightBg dark:bg-[#2a2a2a]"
            >
              <option value="General">
                {t("announcements.categories.general")}
              </option>
              <option value="Maintenance">
                {t("announcements.categories.maintenance")}
              </option>
              <option value="Event">
                {t("announcements.categories.event")}
              </option>
              <option value="Urgent">
                {t("announcements.categories.urgent")}
              </option>
            </select>
          </div>
          <div className="form-control">
            <label className="label font-bold">
              {t("announcements.form_category")} (العربية)
            </label>
            <input
              name="categoryAr"
              defaultValue={editing?.categoryAr}
              className="input input-bordered w-full bg-brand-lightBg dark:bg-[#2a2a2a]"
              placeholder="الفئة بالعربية"
              dir="rtl"
            />
          </div>
          <div className="form-control">
            <label className="label font-bold">
              {t("announcements.form_description")} (English)
            </label>
            <textarea
              name="desc"
              defaultValue={editing?.description}
              className="textarea textarea-bordered w-full h-24 bg-brand-lightBg dark:bg-[#2a2a2a]"
              placeholder={t("announcements.form_description_placeholder")}
              required
            ></textarea>
          </div>
          <div className="form-control">
            <label className="label font-bold">
              {t("announcements.form_description")} (العربية)
            </label>
            <textarea
              name="descAr"
              defaultValue={editing?.descriptionAr}
              className="textarea textarea-bordered w-full h-24 bg-brand-lightBg dark:bg-[#2a2a2a]"
              placeholder="وصف الإعلان بالعربية"
              dir="rtl"
            ></textarea>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-3 border border-gray-200 dark:border-gray-700 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <input
                name="sticky"
                type="checkbox"
                defaultChecked={editing?.isSticky}
                className="checkbox checkbox-primary"
              />
              <span className="label-text font-bold">
                {t("announcements.form_pin_homepage")}
              </span>
            </label>
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
        title={t("announcements.delete_dialog_title")}
        message={t("announcements.delete_dialog_message")}
      />
    </div>
  );
};
