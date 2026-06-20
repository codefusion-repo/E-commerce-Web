"use client";

import { ChangeEvent } from "react";
import "./languageSelector.css";
import { LOCALE_DETAILS, Locale, SUPPORTED_LOCALES } from "../../i18n/config";
import { useI18n } from "../../i18n/client";

export default function LanguageSelector() {
  const { locale, setLocale, t } = useI18n();

  const onChangeLocale = (event: ChangeEvent<HTMLSelectElement>) => {
    setLocale(event.target.value as Locale);
  };

  return (
    <div className="language-selector">
      <label
        className="language-selector__label"
        htmlFor="global-language-selector"
      >
        {t("Idioma")}
      </label>
      <select
        id="global-language-selector"
        className="language-selector__select"
        value={locale}
        onChange={onChangeLocale}
        aria-label={t("Seleccionar idioma")}
      >
        {SUPPORTED_LOCALES.map((availableLocale) => (
          <option key={availableLocale} value={availableLocale}>
            {LOCALE_DETAILS[availableLocale].label}
          </option>
        ))}
      </select>
    </div>
  );
}
