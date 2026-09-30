"use client";

import { useState } from "react";

import { Icon } from "@/components/ui/icon";

type LearningResource = { label: string; url: string };

function VideoResource({ label, embedUrl }: { label: string; embedUrl: string }) {
  const [playing, setPlaying] = useState(false);
  const videoId = embedUrl.split("/").at(-1) ?? "";

  return <article className="embedded-video-card">
    <div className="video-frame">
      {playing ? <iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" src={`${embedUrl}?autoplay=1`} title={label} /> :
        <button aria-label={`Play video: ${label}`} className="video-play-button" onClick={() => setPlaying(true)} style={{ backgroundImage: `linear-gradient(rgba(7, 24, 21, 0.15), rgba(7, 24, 21, 0.35)), url(https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg)` }} type="button">
          <span><Icon name="play" /></span>
        </button>}
    </div>
    <div><Icon name="play" /><strong>{label}</strong></div>
  </article>;
}

function youtubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);
    let videoId = "";
    if (parsed.hostname === "youtu.be") videoId = parsed.pathname.slice(1);
    else if (parsed.hostname.endsWith("youtube.com")) videoId = parsed.searchParams.get("v") ?? parsed.pathname.split("/").filter(Boolean).at(-1) ?? "";
    return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}

export function LearningResources({ resources }: { resources: LearningResource[] }) {
  const videos = resources.flatMap((resource) => {
    const embedUrl = youtubeEmbedUrl(resource.url);
    return embedUrl ? [{ ...resource, embedUrl }] : [];
  });
  const readings = resources.filter((resource) => !youtubeEmbedUrl(resource.url));

  return (
    <div className="resource-gallery">
      {videos.length > 0 ? <div className="embedded-video-grid">{videos.map((video) => <VideoResource embedUrl={video.embedUrl} key={video.url} label={video.label} />)}</div> : null}
      {readings.length > 0 ? <div className="reading-resource-list">{readings.map((resource) => (
        <a href={resource.url} key={resource.url} rel={resource.url.startsWith("http") ? "noreferrer" : undefined} target={resource.url.startsWith("http") ? "_blank" : undefined}>
          <span><Icon name="document" /></span><div><small>Reading</small><strong>{resource.label}</strong></div><Icon name="arrow-right" />
        </a>
      ))}</div> : null}
    </div>
  );
}
