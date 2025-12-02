import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { Announcement } from "../../types";
import {
  ArrowLeftIcon,
  CalendarIcon,
  MegaphoneIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { CardSkeleton } from "../shared/LoadingStates";

export const AnnouncementDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      if (!id) return;

      try {
        setLoading(true);
        // Note: This endpoint doesn't exist in the API yet, so we'll show an error
        // In a real implementation, we'd call: const data = await api.getAnnouncementById(id);
        setError(
          "Single announcement detail endpoint not implemented in backend"
        );
      } catch (err) {
        console.error("Failed to fetch announcement:", err);
        setError("Failed to load announcement details");
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost gap-2 pl-0 text-gray-500 hover:text-brand-primary"
        >
          <ArrowLeftIcon className="w-5 h-5" /> Back
        </button>
        <CardSkeleton />
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="space-y-8 animate-fade-in">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost gap-2 pl-0 text-gray-500 hover:text-brand-primary"
        >
          <ArrowLeftIcon className="w-5 h-5" /> Back
        </button>

        <div className="card bg-base-100 shadow-xl border border-red-200">
          <div className="card-body text-center py-16">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="card-title text-xl text-red-600 mb-2">
              Announcement Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              {error ||
                "The announcement you're looking for doesn't exist or has been removed."}
            </p>
            <button
              onClick={() => navigate("/announcements")}
              className="btn btn-primary"
            >
              View All Announcements
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="btn btn-ghost gap-2 pl-0 text-gray-500 hover:text-brand-primary"
      >
        <ArrowLeftIcon className="w-5 h-5" /> Back to Announcements
      </button>

      {/* Announcement Header */}
      <div className="card bg-gradient-to-r from-brand-primary to-brand-accent text-white shadow-xl">
        <div className="card-body">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <MegaphoneIcon className="w-8 h-8" />
                {announcement.isSticky && (
                  <span className="badge badge-warning gap-1">
                    <ExclamationTriangleIcon className="w-3 h-3" />
                    Important
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-4">{announcement.title}</h1>
              <div className="flex items-center gap-4 text-white/80">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  <span>
                    {new Date(announcement.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {announcement.category && (
                  <span className="badge badge-outline badge-white/50">
                    {announcement.category}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Announcement Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4">Details</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {announcement.description}
                </p>
              </div>
            </div>
          </div>

          {/* Arabic Version if available */}
          {announcement.titleAr && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4 text-right" dir="rtl">
                  التفاصيل باللغة العربية
                </h2>
                <div className="prose max-w-none text-right" dir="rtl">
                  <h3 className="text-xl font-bold mb-3">
                    {announcement.titleAr}
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {announcement.descriptionAr}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg">Announcement Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`badge ${
                      announcement.isSticky ? "badge-warning" : "badge-success"
                    }`}
                  >
                    {announcement.isSticky ? "Important" : "Regular"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Category:</span>
                  <span className="badge badge-outline">
                    {announcement.category || "General"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Published:</span>
                  <span className="text-sm">
                    {new Date(announcement.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg">Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate("/announcements")}
                  className="btn btn-outline btn-block"
                >
                  View All Announcements
                </button>
                <button
                  onClick={() => window.print()}
                  className="btn btn-ghost btn-block"
                >
                  Print Announcement
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
