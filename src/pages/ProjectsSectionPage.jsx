import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { projectsSectionApi } from "../services/api";
import {
  Field,
  LoadingBlock,
  PageHeader,
  Panel,
  StatusBanner,
  labelize,
} from "../components/ui";
import "./pages.css";

const JSON_FIELDS = [
  "squircle",
  "labels",
  "intro",
  "bottom",
  "kinds",
  "hiddenProjects",
];

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
        setForm(next);
      })
      .catch((err) => setStatus(err.message));
  }, []);

  function onChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setStatus("Saving...");
    try {
      const body = {};
      for (const key of JSON_FIELDS) {
        body[key] = JSON.parse(form[key] || "null");
      }
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

      <Panel title="Section JSON" meta="Keep each field valid JSON before saving">
        <form className="form" onSubmit={onSubmit}>
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
          <div className="form__footer">
            <button type="submit" className="btn">
              <Save size={16} aria-hidden="true" />
              Save
            </button>
            <StatusBanner status={status} />
          </div>
        </form>
      </Panel>
    </section>
  );
}

export default ProjectsSectionPage;
