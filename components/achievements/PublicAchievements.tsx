import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../services/api";
import { Achievement } from "../../types";
import { useLangStore } from "../../store";
import {
  TrophyIcon,
  CalendarIcon,
  PhotoIcon,
  VideoCameraIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { CardSkeleton } from "../shared/LoadingStates";

export const PublicAchievements: React.FC = () => {
  const { t, lang } = useLangStore();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentAchievement, setCurrentAchievement] =
    useState<Achievement | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getLocalizedText = (en: string, ar?: string) => {
    return lang === "ar" && ar ? ar : en;
  };

  const openGallery = (achievement: Achievement, startIndex: number = 0) => {
    setCurrentAchievement(achievement);
    setCurrentImageIndex(startIndex);
    setGalleryOpen(true);
  };

  const closeGallery = () => {
    setGalleryOpen(false);
    setCurrentAchievement(null);
    setCurrentImageIndex(0);
  };

  const nextImage = useCallback(() => {
    if (currentAchievement) {
      setCurrentImageIndex((prev) =>
        prev === currentAchievement.media.length - 1 ? 0 : prev + 1
      );
    }
  }, [currentAchievement]);

  const prevImage = useCallback(() => {
    if (currentAchievement) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? currentAchievement.media.length - 1 : prev - 1
      );
    }
  }, [currentAchievement]);

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  useEffect(() => {
    api.getAchievements().then((data) => {
      setAchievements(data);
      setLoading(false);
    });
  }, []);

  // Keyboard navigation for gallery
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!galleryOpen) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          prevImage();
          break;
        case "ArrowRight":
          e.preventDefault();
          nextImage();
          break;
        case "Escape":
          e.preventDefault();
          closeGallery();
          break;
      }
    };

    if (galleryOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when gallery is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [galleryOpen, nextImage, prevImage]);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="text-center max-w-2xl mx-auto py-10">
        <div className="w-16 h-16 bg-brand-accent/20 text-brand-accent rounded-full flex items-center justify-center mx-auto mb-4">
          <TrophyIcon className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold text-brand-primary dark:text-brand-accent font-cairo mb-4">
          {t("achieve.title")}
        </h1>
        <p className="text-gray-500">
          Celebrating the progress and success stories of our community in the
          Fifth Block.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group"
            >
              <figure className="relative h-56">
                {ach.media.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <PhotoIcon className="w-12 h-12" />
                  </div>
                ) : ach.media.length === 1 ? (
                  ach.media[0].type === "video" ? (
                    <video
                      src={ach.media[0].url}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 cursor-pointer"
                      controls
                      onClick={() => openGallery(ach, 0)}
                    />
                  ) : (
                    <img
                      src={ach.media[0].url}
                      alt={ach.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 cursor-pointer"
                      onClick={() => openGallery(ach, 0)}
                    />
                  )
                ) : (
                  <div className="grid grid-cols-2 gap-1 h-full">
                    {ach.media.slice(0, 4).map((media, index) => (
                      <div key={index} className="relative overflow-hidden">
                        {media.type === "video" ? (
                          <video
                            src={media.url}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 cursor-pointer"
                            muted
                            onClick={() => openGallery(ach, index)}
                          />
                        ) : (
                          <img
                            src={media.url}
                            alt={`${ach.title} ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 cursor-pointer"
                            onClick={() => openGallery(ach, index)}
                          />
                        )}
                        {index === 3 && ach.media.length > 4 && (
                          <div
                            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center cursor-pointer"
                            onClick={() => openGallery(ach, 3)}
                          >
                            <span className="text-white font-bold text-lg">
                              +{ach.media.length - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </figure>
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <h2 className="card-title font-cairo text-xl font-bold text-brand-primary dark:text-white">
                    {getLocalizedText(ach.title, ach.titleAr)}
                  </h2>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2 text-xs text-brand-accent font-bold uppercase tracking-wider">
                      <CalendarIcon className="w-4 h-4" /> {ach.date}
                    </div>
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
                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3">
                  {getLocalizedText(ach.description, ach.descriptionAr)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Gallery Modal */}
      {galleryOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black bg-opacity-95 flex items-center justify-center"
          onClick={closeGallery}
        >
          <div
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeGallery}
              className="absolute top-4 right-4 z-50 btn btn-circle btn-ghost text-white hover:bg-white hover:bg-opacity-20"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {/* Navigation Buttons */}
            {currentAchievement && currentAchievement.media.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-50 btn btn-circle btn-ghost text-white hover:bg-white hover:bg-opacity-20"
                >
                  <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-50 btn btn-circle btn-ghost text-white hover:bg-white hover:bg-opacity-20"
                >
                  <ChevronRightIcon className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Main Image/Video Display */}
            <div className="max-w-4xl max-h-screen p-4">
              {currentAchievement &&
                currentAchievement.media[currentImageIndex] && (
                  <div className="relative">
                    {currentAchievement.media[currentImageIndex].type ===
                    "video" ? (
                      <video
                        src={currentAchievement.media[currentImageIndex].url}
                        className="max-w-full max-h-screen object-contain"
                        controls
                        autoPlay
                      />
                    ) : (
                      <img
                        src={currentAchievement.media[currentImageIndex].url}
                        alt={getLocalizedText(
                          currentAchievement.title,
                          currentAchievement.titleAr
                        )}
                        className="max-w-full max-h-screen object-contain"
                      />
                    )}

                    {/* Image Counter */}
                    {currentAchievement.media.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} /{" "}
                        {currentAchievement.media.length}
                      </div>
                    )}
                  </div>
                )}
            </div>

            {/* Thumbnail Navigation */}
            {currentAchievement && currentAchievement.media.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black bg-opacity-50 rounded-lg p-2">
                {currentAchievement.media.map((media, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`w-12 h-12 rounded overflow-hidden border-2 ${
                      index === currentImageIndex
                        ? "border-white"
                        : "border-transparent hover:border-gray-400"
                    }`}
                  >
                    {media.type === "video" ? (
                      <video
                        src={media.url}
                        className="w-full h-full object-cover"
                        muted
                      />
                    ) : (
                      <img
                        src={media.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
