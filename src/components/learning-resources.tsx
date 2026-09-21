import { Icon } from "@/components/ui/icon";

type LearningResource = { label: string; url: string };

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
      {videos.length > 0 ? <div className="embedded-video-grid">{videos.map((video) => (
        <article className="embedded-video-card" key={video.url}>
          <div className="video-frame"><iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" src={video.embedUrl} title={video.label} /></div>
          <div><Icon name="play" /><strong>{video.label}</strong></div>
        </article>
      ))}</div> : null}
      {readings.length > 0 ? <div className="reading-resource-list">{readings.map((resource) => (
        <a href={resource.url} key={resource.url} rel={resource.url.startsWith("http") ? "noreferrer" : undefined} target={resource.url.startsWith("http") ? "_blank" : undefined}>
          <span><Icon name="document" /></span><div><small>Reading</small><strong>{resource.label}</strong></div><Icon name="arrow-right" />
        </a>
      ))}</div> : null}
    </div>
  );
}
