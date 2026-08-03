import { useRef, useState } from "react";
import { FileText, ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { uploadApi } from "../../services/api";
import { mediaUrl } from "../../utils/mediaUrl";
import "./FileUpload.css";

function acceptsPdf(accept = "") {
  return accept.includes("pdf") || accept.includes("application/");
}

function acceptsImage(accept = "") {
  return !accept || accept.includes("image") || accept.includes("*/*");
}

function isImagePath(value = "", accept = "") {
  if (acceptsImage(accept) && !acceptsPdf(accept)) return true;
  return /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(value) || value.startsWith("/uploads/");
}

function acceptHint(accept = "") {
  const image = acceptsImage(accept);
  const pdf = acceptsPdf(accept);
  if (image && pdf) return "Images or PDF · max 8MB";
  if (pdf) return "PDF · max 8MB";
  return "Images · max 8MB";
}

export function FileUpload({
  label,
  value = "",
  onChange,
  accept = "image/*",
  hint,
  full = true,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function uploadFile(file) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const data = await uploadApi.upload(file);
      onChange?.(data.url, {
        fileName: data.fileName,
        mimeType: data.mimeType,
        size: data.size,
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  function onDrop(event) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer?.files?.[0];
    uploadFile(file);
  }

  const preview = value && isImagePath(value, accept) ? mediaUrl(value) : "";
  const showPdfBadge = value && !preview && (/\.pdf(\?|$)/i.test(value) || acceptsPdf(accept));

  return (
    <div className={`file-upload${full ? " form__span-full" : ""}`}>
      {label ? <span className="form__label">{label}</span> : null}

      <div
        className={`file-upload__drop${dragging ? " is-dragging" : ""}${busy ? " is-busy" : ""}`}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={onDrop}
      >
        {preview ? (
          <img className="file-upload__preview" src={preview} alt="" />
        ) : (
          <div className="file-upload__placeholder" aria-hidden="true">
            {showPdfBadge ? <FileText size={22} /> : <ImagePlus size={22} />}
          </div>
        )}

        <div className="file-upload__copy">
          <p className="file-upload__title">
            {busy ? "Uploading…" : "Drop a file here, or browse"}
          </p>
          <p className="file-upload__meta">
            {acceptHint(accept)}
            {value ? (
              <>
                {" · "}
                <a href={mediaUrl(value)} target="_blank" rel="noreferrer">
                  current file
                </a>
              </>
            ) : null}
          </p>
          <div className="file-upload__actions">
            <button
              type="button"
              className="btn btn--sm"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              {busy ? (
                <Loader2 size={14} className="file-upload__spin" aria-hidden="true" />
              ) : (
                <Upload size={14} aria-hidden="true" />
              )}
              {busy ? "Uploading" : "Select file"}
            </button>
            {value ? (
              <button
                type="button"
                className="btn btn--danger btn--sm"
                disabled={busy}
                onClick={() => onChange?.("")}
              >
                <Trash2 size={14} aria-hidden="true" />
                Clear
              </button>
            ) : null}
          </div>
        </div>

        <input
          ref={inputRef}
          className="file-upload__input"
          type="file"
          accept={accept}
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            uploadFile(file);
          }}
        />
      </div>

      <label className="form__field file-upload__url">
        <span className="form__label">Or paste URL / path</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="/uploads/… or https://…"
          disabled={busy}
        />
      </label>

      {hint ? <p className="form__hint">{hint}</p> : null}
      {error ? <p className="file-upload__error">{error}</p> : null}
    </div>
  );
}
