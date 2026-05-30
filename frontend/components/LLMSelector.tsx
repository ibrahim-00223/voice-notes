"use client";

export type Provider = "openrouter" | "anthropic" | "openai" | "mistral";

export interface LLMConfig {
  provider: Provider;
  model: string;
}

const PROVIDERS: Record<Provider, { label: string; defaultModel: string }> = {
  openrouter: { label: "OpenRouter", defaultModel: "openai/gpt-4o" },
  anthropic:  { label: "Anthropic",  defaultModel: "claude-opus-4-5" },
  openai:     { label: "OpenAI",     defaultModel: "gpt-4o" },
  mistral:    { label: "Mistral",    defaultModel: "mistral-large-latest" },
};

interface Props {
  value: LLMConfig;
  onChange: (v: LLMConfig) => void;
}

const selectStyle = {
  background: "#1a1a1a",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#fff",
  borderRadius: "0.5rem",
  padding: "0.375rem 0.625rem",
  fontSize: "0.8125rem",
  outline: "none",
  cursor: "pointer",
};

const inputStyle = {
  ...selectStyle,
  cursor: "text",
  width: "100%",
};

export default function LLMSelector({ value, onChange }: Props) {
  const defaultModel = PROVIDERS[value.provider].defaultModel;

  const handleProvider = (provider: Provider) => {
    onChange({ provider, model: "" });
  };

  const handleModel = (model: string) => {
    onChange({ ...value, model });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        value={value.provider}
        onChange={(e) => handleProvider(e.target.value as Provider)}
        style={selectStyle}
      >
        {(Object.keys(PROVIDERS) as Provider[]).map((p) => (
          <option key={p} value={p}>
            {PROVIDERS[p].label}
          </option>
        ))}
      </select>

      <div style={{ minWidth: 180 }}>
        <input
          type="text"
          value={value.model}
          onChange={(e) => handleModel(e.target.value)}
          placeholder={defaultModel}
          style={inputStyle}
          onFocus={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(230,0,76,0.5)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 2px rgba(230,0,76,0.12)";
          }}
          onBlur={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }}
        />
      </div>
    </div>
  );
}
