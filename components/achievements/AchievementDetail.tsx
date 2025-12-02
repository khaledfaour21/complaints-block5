import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { Achievement } from "../../types";
import {
  ArrowLeftIcon,
  TrophyIcon,
  CalendarIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { CardSkeleton } from "../shared/LoadingStates";

export const AchievementDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAchievement = async () => {
      if (!id) return;

      try {
        setLoading(true);
        // Note: This endpoint doesn't exist in the API yet, so we'll show an error
        // In a real implementation, we'd call: const data = await api.getAchievementById(id);
        setError(
          "Single achievement detail endpoint not implemented in backend"
        );
      } catch (err) {
        console.error("Failed to fetch achievement:", err);
        setError("Failed to load achievement details");
      } finally {
        setLoading(false);
      }
    };

    fetchAchievement();
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

  if (error || !achievement) {
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
              Achievement Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              {error ||
                "The achievement you're looking for doesn't exist or has been removed."}
            </p>
            <button
              onClick={() => navigate("/achievements")}
              className="btn btn-primary"
            >
              View All Achievements
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
        <ArrowLeftIcon className="w-5 h-5" /> Back to Achievements
      </button>

      {/* Achievement Header */}
      <div className="card bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-xl">
        <div className="card-body">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <TrophyIcon className="w-8 h-8" />
                <span className="badge badge-white/20 text-white">
                  Achievement
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-4">{achievement.title}</h1>
              <div className="flex items-center gap-4 text-white/80">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  <span>
                    {new Date(achievement.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4">Achievement Details</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {achievement.description}
                </p>
              </div>
            </div>
          </div>

          {/* Arabic Version if available */}
          {achievement.titleAr && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4 text-right" dir="rtl">
                  التفاصيل باللغة العربية
                </h2>
                <div className="prose max-w-none text-right" dir="rtl">
                  <h3 className="text-xl font-bold mb-3">
                    {achievement.titleAr}
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {achievement.descriptionAr}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Media Gallery */}
          {achievement.media && achievement.media.length > 0 && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4 flex items-center gap-2">
                  <PhotoIcon className="w-5 h-5" />
                  Media Gallery
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievement.media.map((media, index) => (
                    <div key={index} className="relative group">
                      {media.type === "image" ? (
                        <img
                          src={media.url}
                          alt={`Achievement media ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() => window.open(media.url, "_blank")}
                        />
                      ) : (
                        <video
                          src={media.url}
                          controls
                          className="w-full h-48 object-cover rounded-lg shadow-md"
                        />
                      )}
                    </div>
                  ))}
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
              <h3 className="card-title text-lg">Achievement Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Type:</span>
                  <span className="badge badge-warning gap-1">
                    <TrophyIcon className="w-3 h-3" />
                    Achievement
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Media:</span>
                  <span className="badge badge-outline">
                    {achievement.media?.length || 0} items
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Date:</span>
                  <span className="text-sm">
                    {new Date(achievement.date).toLocaleDateString()}
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
                  onClick={() => navigate("/achievements")}
                  className="btn btn-outline btn-block"
                >
                  View All Achievements
                </button>
                <button
                  onClick={() => window.print()}
                  className="btn btn-ghost btn-block"
                >
                  Print Achievement
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
