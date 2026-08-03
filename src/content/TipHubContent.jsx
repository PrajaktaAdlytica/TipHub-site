import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@sanity/client";
import { fallbackContent } from "./fallbackContent";

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
const dataset = import.meta.env.VITE_SANITY_DATASET || "production";
const apiVersion = import.meta.env.VITE_SANITY_API_VERSION || "2026-07-27";
const cmsEnabled = Boolean(projectId);

const client = cmsEnabled
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
      perspective: "published",
    })
  : null;

const contentQuery = `{
  "siteSettings": *[_type == "siteSettings"][0]{
    companyName,
    tagline,
    companyDescription,
    pitchEmail,
    generalEmail,
    linkedinUrl,
    legalName,
    legalAddress,
    copyrightYear,
    provisional
  },
  "fundProfile": *[_type == "fundProfile"][0]{
    fundName,
    fundSize,
    stages,
    firstCheque,
    partnership,
    followOn,
    geography,
    investmentThesis,
    sectors,
    provisional
  },
  "thesisThemes": *[_type == "thesisTheme"] | order(order asc){
    "id": code,
    title,
    "short": coalesce(shortTitle, title),
    description,
    signal,
    "tags": array::join(tags, " / ")
  },
  "convictionSteps": *[_type == "convictionStep"] | order(order asc){
    "id": code,
    title,
    text
  },
  "portfolio": *[_type == "portfolioCompany" && approvedForPublication == true] | order(order asc){
    "id": coalesce(slug.current, string(order)),
    name,
    description,
    founders,
    "theme": coalesce(theme->shortTitle, theme->title),
    stage,
    yearInvested,
    region,
    status,
    website,
    "logo": logo.asset->url
  },
  "team": *[_type == "teamMember" && approvedForPublication == true] | order(order asc){
    name,
    role,
    "image": headshot.asset->url,
    "bio": shortBio,
    location,
    focus,
    linkedinUrl,
    email,
    previousExperience
  },
  "notes": *[_type == "fieldNote" && published == true] | order(publishedAt desc){
    "id": coalesce(slug.current, string(order)),
    "slug": slug.current,
    theme,
    title,
    excerpt,
    "date": publishedAt,
    publishedAt,
    readingTime,
    "image": coverImage.asset->url,
    "author": author->name,
    body
  },
  "founderModules": *[_type == "founderModule"] | order(order asc){
    "id": string(order),
    title,
    description,
    category,
    "tags": array::join(tags, " / "),
    ctaLabel,
    ctaUrl
  }
}`;

function keepFallbackWhenEmpty(incoming, fallback) {
  return Array.isArray(incoming) && incoming.length ? incoming : fallback;
}

function formatPublishedDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function mergeContent(incoming = {}) {
  const notes = keepFallbackWhenEmpty(incoming.notes, fallbackContent.notes).map(
    (note) => ({
      ...note,
      date: formatPublishedDate(note.date),
    }),
  );
  const founderModules = keepFallbackWhenEmpty(
    incoming.founderModules,
    fallbackContent.founderModules,
  ).map((module, index) => ({
    ...module,
    id: String(module.id || index + 1).padStart(2, "0"),
  }));

  return {
    siteSettings: {
      ...fallbackContent.siteSettings,
      ...(incoming.siteSettings || {}),
    },
    fundProfile: {
      ...fallbackContent.fundProfile,
      ...(incoming.fundProfile || {}),
    },
    thesisThemes: keepFallbackWhenEmpty(
      incoming.thesisThemes,
      fallbackContent.thesisThemes,
    ),
    convictionSteps: keepFallbackWhenEmpty(
      incoming.convictionSteps,
      fallbackContent.convictionSteps,
    ),
    portfolio: Array.isArray(incoming.portfolio)
      ? incoming.portfolio
      : fallbackContent.portfolio,
    team: Array.isArray(incoming.team) ? incoming.team : fallbackContent.team,
    notes,
    founderModules,
  };
}

const TipHubContentContext = createContext({
  content: fallbackContent,
  cmsStatus: cmsEnabled ? "loading" : "fallback",
});

export function TipHubContentProvider({ children }) {
  const [content, setContent] = useState(fallbackContent);
  const [cmsStatus, setCmsStatus] = useState(
    cmsEnabled ? "loading" : "fallback",
  );

  useEffect(() => {
    if (!client) return undefined;
    let cancelled = false;

    client
      .fetch(contentQuery)
      .then((incoming) => {
        if (cancelled) return;
        setContent(mergeContent(incoming));
        setCmsStatus("connected");
      })
      .catch(() => {
        if (cancelled) return;
        setContent(fallbackContent);
        setCmsStatus("fallback");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({ content, cmsStatus }),
    [content, cmsStatus],
  );

  return (
    <TipHubContentContext.Provider value={value}>
      {children}
    </TipHubContentContext.Provider>
  );
}

export function useTipHubContent() {
  return useContext(TipHubContentContext);
}
