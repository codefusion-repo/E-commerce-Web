"use client";

import "./languageSelector.css";
import { LOCALE_DETAILS, Locale, SUPPORTED_LOCALES } from "../../i18n/config";
import { useI18n } from "../../i18n/client";

export default function LanguageSelector() {
  const { locale, setLocale, t } = useI18n();

  const onSelectLocale = (selectedLocale: Locale) => {
    setLocale(selectedLocale);
  };

  return (
    <div
      className="language-selector"
      role="group"
      aria-label={t("Seleccionar idioma")}
    >
      <span className="language-selector__label">{t("Idioma")}</span>
      <div
        className="language-selector__options"
        aria-label={t("Seleccionar idioma")}
      >
        {SUPPORTED_LOCALES.map((availableLocale) => (
          <button
            key={availableLocale}
            type="button"
            className={`language-selector__button ${
              availableLocale === locale ? "language-selector__button--active" : ""
            }`}
            onClick={() => onSelectLocale(availableLocale)}
            aria-label={`${t("Seleccionar idioma")}: ${
              LOCALE_DETAILS[availableLocale].label
            }`}
            aria-pressed={availableLocale === locale}
          >
            {LOCALE_DETAILS[availableLocale].shortLabel}
          </button>
        ))}
      </div>
    </div>
  );
}
