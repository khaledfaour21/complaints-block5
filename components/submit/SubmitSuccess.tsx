import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useLangStore } from "../../store";
import {
  CheckCircleIcon,
  ShareIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export const SubmitSuccess: React.FC = () => {
  const { t } = useLangStore();
  const [searchParams] = useSearchParams();
  const trackingId = searchParams.get("id") || "UNKNOWN";

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 animate-fade-in-up">
      <div className="card w-full max-w-lg bg-base-100 shadow-2xl border-t-8 border-green-500">
        <div className="card-body items-center text-center p-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600 animate-bounce-slow">
            <CheckCircleIcon className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-cairo font-bold text-brand-primary mb-2">
            {t("form.success")}
          </h2>
          <p className="text-gray-500 mb-6">{t("form.success_msg")}</p>

          <div className="bg-brand-lightBg dark:bg-brand-primary/20 p-6 rounded-xl border border-dashed border-brand-primary/30 w-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-brand-accent text-white text-xs px-2 py-1 rounded-bl">
              SAVE THIS
            </div>
            <p className="text-sm uppercase tracking-widest text-gray-500 mb-2">
              {t("form.tracking")}
            </p>
            <div className="text-4xl font-mono font-bold text-brand-primary dark:text-brand-accent tracking-wider">
              {trackingId}
            </div>
          </div>

          <div className="alert alert-info mt-6 bg-blue-50 border-blue-100 text-blue-900 text-sm text-left">
            <ShareIcon className="w-5 h-5" />
            <span>{t("whatsapp.confirmation")}</span>
          </div>

          <div className="mt-8 flex flex-col w-full gap-3">
            <Link
              to={`/track?id=${trackingId}`}
              className="btn btn-primary text-white w-full"
            >
              {t("track.btn")} <ArrowRightIcon className="w-4 h-4" />
            </Link>
            <Link to="/" className="btn btn-ghost w-full">
              {t("error.home")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
