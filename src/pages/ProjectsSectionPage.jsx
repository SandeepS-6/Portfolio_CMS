import { useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { projectsSectionApi } from "../services/api";
import {
  Field,
  FileUpload,
  LoadingBlock,
  PageHeader,
  Panel,
  StatusBanner,
  labelize,
} from "../components/ui";
import "./pages.css";
import "../components/ui/GalleryField.css";

const JSON_FIELDS = ["squircle", "labels", "intro", "bottom", "kinds"];

function emptyHidden() {
  return {
    id: `lab-${Date.now()}`,
    name: "",
    phase: "",
    summary: "",
    image: { src: "", alt: "" },
  };
}

function normalizeHidden(list) {
  if (!Array.isArray(list)) return [];
  return list.map((item, index) => ({
    id: item.id || `lab-${index + 1}`,
    name: item.name || "",
    phase: item.phase || "",
    summary: item.summary || item.description || "",
    image: {
      src: item.image?.src || item.image || "",
      alt: item.image?.alt || item.name || "",
    },
  }));
}

function ProjectsSectionPage() {
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    projectsSectionApi
      .get()
      .then((data) => {
        const next = {};
        JSON_FIELDS.forEach((key) => {
          next[key] = JSON.stringify(data[key] ?? {}, null, 2);
        });
        next.hiddenProjects = normalizeHidden(data.hiddenProjects);
        setForm(next);
      })
      .catch((err) => setStatus(err.message));
  }, []);

  function onChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function setHidden(next) {
    setForm((prev) => ({ ...prev, hiddenProjects: next }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setStatus("Saving...");
    try {
      const body = {};
      for (const key of JSON_FIELDS) {
        body[key] = JSON.parse(form[key] || "null");
      }
      body.hiddenProjects = (form.hiddenProjects || [])
        .filter((item) => item.name.trim() || item.image?.src)
        .map(({ id, name, phase, summary, image }) => ({
          id,
          name,
          phase,
          summary,
          image: {
            src: image?.src || "",
            alt: image?.alt || name || "",
          },
        }));
      await projectsSectionApi.update(body);
      setStatus("Saved.");
    } catch (err) {
      setStatus(err.response?.data?.error || err.message);
    }
  }

  if (!form) {
    return (
      <section className="page">
        <PageHeader
          eyebrow="Content"
          title="Projects Section"
          lead="Section copy for the public Projects UI."
        />
        <Panel>
          <LoadingBlock />
        </Panel>
      </section>
    );
  }

  return (
    <section className="page">
      <PageHeader
        eyebrow="Content"
        title="Projects Section"
        lead="Section copy for the public Projects UI (labels, intro, kinds, lab)."
      />

      <form className="form" onSubmit={onSubmit}>
        <Panel title="Section JSON" meta="Keep each field valid JSON before saving">
          {JSON_FIELDS.map((name) => (
            <Field
              key={name}
              label={labelize(name)}
              name={name}
              type="textarea"
              mono
              rows={name === "labels" || name === "bottom" ? 10 : 6}
              value={form[name]}
              onChange={onChange}
            />
          ))}
        </Panel>

        <Panel
          title="Hidden / lab projects"
          meta="Experimental cards — upload each cover image"
        >
          <div className="gallery-field__list">
            {(form.hiddenProjects || []).map((item, index) => (
              <div key={item.id} className="gallery-field__card">
                <div className="gallery-field__head">
                  <p className="gallery-field__title">
                    {item.name?.trim() || `Lab project ${index + 1}`}
                  </p>
                  <button
                    type="button"
                    className="btn btn--danger btn--sm"
                    onClick={() =>
                      setHidden(form.hiddenProjects.filter((_, i) => i !== index))
                    }
                  >
                    <Trash2 size={14} aria-hidden="true" />
                    Remove
                  </button>
                </div>
                <div className="form form--grid">
                  <Field
                    label="Name"
                    value={item.name}
                    onChange={(e) => {
                      const next = form.hiddenProjects.slice();
                      next[index] = { ...item, name: e.target.value };
                      setHidden(next);
                    }}
                  />
                  <Field
                    label="Phase"
                    value={item.phase}
                    onChange={(e) => {
                      const next = form.hiddenProjects.slice();
                      next[index] = { ...item, phase: e.target.value };
                      setHidden(next);
                    }}
                  />
                  <Field
                    label="Summary"
                    type="textarea"
                    rows={2}
                    value={item.summary}
                    onChange={(e) => {
                      const next = form.hiddenProjects.slice();
                      next[index] = { ...item, summary: e.target.value };
                      setHidden(next);
                    }}
                    full
                  />
                  <FileUpload
                    label="Cover image"
                    value={item.image?.src || ""}
                    accept="image/*"
                    onChange={(url) => {
                      const next = form.hiddenProjects.slice();
                      next[index] = {
                        ...item,
                        image: { ...item.image, src: url },
                      };
                      setHidden(next);
                    }}
                  />
                  <Field
                    label="Image alt"
                    value={item.image?.alt || ""}
                    onChange={(e) => {
                      const next = form.hiddenProjects.slice();
                      next[index] = {
                        ...item,
                        image: { ...item.image, alt: e.target.value },
                      };
                      setHidden(next);
                    }}
                    full
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => setHidden([...(form.hiddenProjects || []), emptyHidden()])}
          >
            <Plus size={16} aria-hidden="true" />
            Add lab project
          </button>
        </Panel>

        <div className="form__footer">
          <button type="submit" className="btn">
            <Save size={16} aria-hidden="true" />
            Save
          </button>
          <StatusBanner status={status} />
        </div>
      </form>
    </section>
  );
}

export default ProjectsSectionPage;
