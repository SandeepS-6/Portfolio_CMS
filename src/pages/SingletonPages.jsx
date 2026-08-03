import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { contactInfoApi, footerApi } from "../services/api";
import {
  Field,
  FileUpload,
  LoadingBlock,
  PageHeader,
  Panel,
  StatusBanner,
  Toggle,
  labelize,
} from "../components/ui";
import "./pages.css";

function fieldName(field) {
  return typeof field === "string" ? field : field.name;
}

function fieldType(field) {
  return typeof field === "string" ? "text" : field.type || "text";
}

function SingletonPage({ title, eyebrow, lead, load, save, fields }) {
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    load()
      .then((data) => {
        const next = {};
        fields.forEach((field) => {
          const name = fieldName(field);
          next[name] = Array.isArray(data[name])
            ? data[name].join(", ")
            : (data[name] ?? "");
        });
        setForm(next);
      })
      .catch((err) => setStatus(err.message));
  }, []);

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  function setFormField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("Saving...");
    try {
      const body = { ...form };
      if (body.seoKeywords !== undefined) {
        body.seoKeywords = String(body.seoKeywords)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      if (body.maintenanceMode !== undefined) {
        body.maintenanceMode = !!body.maintenanceMode;
      }
      await save(body);
      setStatus("Saved.");
    } catch (err) {
      setStatus(err.response?.data?.error || err.message);
    }
  }

  if (!form) {
    return (
      <section className="page">
        <PageHeader eyebrow={eyebrow} title={title} lead={lead} />
        <Panel>
          <LoadingBlock />
        </Panel>
      </section>
    );
  }

  return (
    <section className="page">
      <PageHeader eyebrow={eyebrow} title={title} lead={lead} />

      <Panel title="Settings" meta="Changes sync to the live portfolio API">
        <form className="form form--grid" onSubmit={onSubmit}>
          {fields.map((field) => {
            const name = fieldName(field);
            const type = fieldType(field);

            if (name === "maintenanceMode") {
              return (
                <Toggle
                  key={name}
                  name={name}
                  checked={!!form[name]}
                  onChange={onChange}
                  label="Maintenance mode"
                />
              );
            }

            if (type === "image" || type === "file") {
              return (
                <FileUpload
                  key={name}
                  label={labelize(name)}
                  value={form[name] || ""}
                  accept={type === "file" ? "application/pdf,image/*" : "image/*"}
                  onChange={(url) => setFormField(name, url)}
                />
              );
            }

            return (
              <Field
                key={name}
                label={labelize(name)}
                name={name}
                type={
                  name === "siteDescription" || name === "description"
                    ? "textarea"
                    : "text"
                }
                rows={
                  name === "siteDescription" || name === "description" ? 3 : undefined
                }
                value={form[name]}
                onChange={onChange}
              />
            );
          })}
          <div className="form__footer form__span-full">
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

export function ContactInfoPage() {
  return (
    <SingletonPage
      eyebrow="Site"
      title="Contact Info"
      lead="Raw reachability fields used across the public site."
      load={contactInfoApi.get}
      save={contactInfoApi.update}
      fields={["email", "phone", "location", "availability"]}
    />
  );
}

export function FooterPage() {
  return (
    <SingletonPage
      eyebrow="Site"
      title="Footer / Contact Ending"
      lead="Contact ending copy, CTA, and credits on the homepage."
      load={async () => {
        const data = await footerApi.get();
        return {
          email: data.email ?? "",
          phone: data.phone ?? "",
          location: data.address ?? "",
          availability: data.availability?.label ?? "",
          eyebrow: data.eyebrow ?? "",
          ctaLabel: data.cta?.label ?? "",
          ctaHref: data.cta?.href ?? "",
          backgroundWords: Array.isArray(data.backgroundWords)
            ? data.backgroundWords.join(", ")
            : "",
          backToTopLabel: data.backToTopLabel ?? "",
          credits: data.credits ?? "",
          developerName: data.developerName ?? "",
          description: data.description ?? "",
          copyright: data.copyright ?? "",
          resumeUrl: data.resumeUrl ?? "",
          logoUrl: data.logo ?? data.logoUrl ?? "",
        };
      }}
      save={async (body) => {
        await footerApi.update({
          ...body,
          backgroundWords: String(body.backgroundWords || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        });
      }}
      fields={[
        "email",
        "phone",
        "location",
        "availability",
        "eyebrow",
        "ctaLabel",
        "ctaHref",
        "backgroundWords",
        "backToTopLabel",
        "credits",
        "developerName",
        "description",
        "copyright",
        { name: "logoUrl", type: "image" },
        { name: "resumeUrl", type: "file" },
      ]}
    />
  );
}
