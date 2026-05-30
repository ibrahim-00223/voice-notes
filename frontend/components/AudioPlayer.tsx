"use client";

interface Props {
  url: string | null;
  filename?: string;
}

export default function AudioPlayer({ url, filename = "audio" }: Props) {
  const handleDownload = () => {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.webm`;
    a.target = "_blank";
    a.click();
  };

  if (!url) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
        style={{
          background: "#1a1a1a",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.28)",
        }}
      >
        <svg className="animate-spin w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Chargement audio…
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-3 px-3 py-2 rounded-lg"
      style={{
        background: "#1a1a1a",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <audio
        controls
        src={url}
        className="flex-1 min-w-0"
        style={{ height: "36px", accentColor: "#E6004C" }}
      />
      <button
        onClick={handleDownload}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0"
        style={{
          background: "rgba(74,222,128,0.08)",
          border: "1px solid rgba(74,222,128,0.2)",
          color: "#4ade80",
        }}
        onMouseOver={(e) => {
          (e.currentTarget as HTMLElement).style.background = "rgba(74,222,128,0.15)";
        }}
        onMouseOut={(e) => {
          (e.currentTarget as HTMLElement).style.background = "rgba(74,222,128,0.08)";
        }}
        title="Télécharger l'audio"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Télécharger
      </button>
    </div>
  );
}
