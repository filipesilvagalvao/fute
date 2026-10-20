"use client";

import { useEffect } from "react";

export default function MonetagPopup() {
  useEffect(() => {
    const script = document.createElement("script");

    script.dataset.zone = "12083476";
    script.src = "https://al5sm.com/tag.min.js";
    script.async = true;

    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return null;
}