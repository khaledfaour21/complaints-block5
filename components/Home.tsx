import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLangStore } from "../store";
import { api } from "../services/api";
import { Announcement } from "../types";
import {
  MegaphoneIcon,
  PlusCircleIcon,
  DocumentMagnifyingGlassIcon,
  TrophyIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export const Home: React.FC = () => {
  const { t, lang } = useLangStore();
  const [stickyAnnouncements, setStickyAnnouncements] = useState<
    Announcement[]
  >([]);

  useEffect(() => {
    api.getAnnouncements().then((res) => {
      setStickyAnnouncements(res.filter((a) => a.isSticky));
    });
  }, []);

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Sticky Announcements */}
      {stickyAnnouncements.length > 0 && (
        <div className="space-y-2">
          {stickyAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className="alert bg-brand-accent text-brand-secondary shadow-lg border-l-8 border-brand-secondary rounded-lg"
            >
              <MegaphoneIcon className="w-6 h-6 animate-pulse" />
              <div>
                <h3 className="font-bold uppercase tracking-wide text-xs">
                  {t("home.announcement")}
                </h3>
                <div className="font-bold text-lg">{ann.title}</div>
                <div className="text-sm opacity-90">{ann.description}</div>
              </div>
              <Link to="/announcements" className="btn btn-sm btn-ghost">
                {t("home.view_all")}
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Hero Section */}
      <div className="hero min-h-[400px] rounded-3xl overflow-hidden relative bg-brand-primary text-brand-lightBg">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10"></div>
        <div className="hero-content text-center z-10 py-12">
          <div className="max-w-xl">
            <h1 className="text-5xl font-bold font-cairo mb-4 leading-tight">
              {t("home.welcome")}
            </h1>
            <p className="py-6 text-lg opacity-90">{t("hero.subtitle")}</p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/submit"
                className="btn btn-lg text-white border-none hover:opacity-90"
                style={{ backgroundColor: "#428177" }}
              >
                {t("home.submit_card")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/submit"
          className="card bg-base-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-transparent hover:border-brand-accent"
        >
          <div className="card-body items-center text-center">
            <div className="w-16 h-16 bg-brand-lightBg rounded-full flex items-center justify-center text-brand-primary mb-4">
              <PlusCircleIcon className="w-8 h-8" />
            </div>
            <h2 className="card-title font-cairo">{t("home.submit_card")}</h2>
            <p className="text-sm text-gray-500">{t("home.submit_desc")}</p>
            <div
              className="mt-4 flex items-center gap-1 font-bold text-sm group"
              style={{ color: "#428177" }}
            >
              {t("home.go_now")}{" "}
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform rtl:group-hover:-translate-x-1" />
            </div>
          </div>
        </Link>

        <Link
          to="/track"
          className="card bg-base-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-transparent hover:border-brand-accent"
        >
          <div className="card-body items-center text-center">
            <div className="w-16 h-16 bg-brand-lightBg rounded-full flex items-center justify-center text-brand-primary mb-4">
              <DocumentMagnifyingGlassIcon className="w-8 h-8" />
            </div>
            <h2 className="card-title font-cairo">{t("home.track_card")}</h2>
            <p className="text-sm text-gray-500">{t("home.track_desc")}</p>
            <div
              className="mt-4 flex items-center gap-1 font-bold text-sm group"
              style={{ color: "#428177" }}
            >
              {t("home.go_now")}{" "}
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform rtl:group-hover:-translate-x-1" />
            </div>
          </div>
        </Link>

        <Link
          to="/achievements"
          className="card bg-base-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-transparent hover:border-brand-accent"
        >
          <div className="card-body items-center text-center">
            <div className="w-16 h-16 bg-brand-lightBg rounded-full flex items-center justify-center text-brand-primary mb-4">
              <TrophyIcon className="w-8 h-8" />
            </div>
            <h2 className="card-title font-cairo">{t("home.achieve_card")}</h2>
            <p className="text-sm text-gray-500">{t("home.achieve_desc")}</p>
            <div
              className="mt-4 flex items-center gap-1 font-bold text-sm group"
              style={{ color: "#428177" }}
            >
              {t("home.go_now")}{" "}
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform rtl:group-hover:-translate-x-1" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};
