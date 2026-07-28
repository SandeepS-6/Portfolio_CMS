import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { heroApi } from "../services/api";
import {
  Field,
  LoadingBlock,
  PageHeader,
  Panel,
  StatusBanner,
  labelize,
} from "../components/ui";
import "./pages.css";

const TEXT_FIELDS = [
  "firstName",
  "lastName",
  "role",
  "quote",
  "dateOfBirth",
  "dateLabel",
  "greeting",
  "headline",
  "ctaLabel",
  "ctaHref",
];

function HeroPage() {
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    heroApi
      .get()
      .then((data) => {
        setForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          role: data.role || "",
          quote: data.quote || "",
          dateOfBirth: data.dateOfBirth || "",
          dateLabel: data.dateLabel || "Present",
          greeting: data.greeting || "",
          headline: data.headline || "",
          bio: data.bio || "",
          ctaLabel: data.primaryCta?.label || "Know me better",
          ctaHref: data.primaryCta?.href || "#about",
        });
      })
      .catch((err) => setStatus(err.message));
  }, []);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("Saving...");
    try {
      await heroApi.update({
        ...form,
        primaryCta: { label: form.ctaLabel, href: form.ctaHref },
      });
      setStatus("Saved.");
    } catch (err) {
      setStatus(err.response?.data?.error || err.message);
    }
  }

  if (!form) {
    return (
      <section className="page">
        <PageHeader eyebrow="Content" title="Hero" lead="Identity and opening pitch." />
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
        title="Hero"
        lead="Centered story hero: name, headline, subtitle, intro, and CTA."
      />

      <Panel title="Hero content" meta="Updates appear on the live site after save">
        <form className="form form--grid" onSubmit={onSubmit}>
          {TEXT_FIELDS.map((name) => (
            <Field
              key={name}
              label={labelize(name)}
              name={name}
              value={form[name]}
              onChange={onChange}
            />
          ))}
          <Field
            label="Bio"
            name="bio"
            type="textarea"
            rows={4}
            value={form.bio}
            onChange={onChange}
            full
          />
          <div className="form__footer form__span-full">
            <button type="submit" className="btn">
              <Save size={16} aria-hidden="true" />
              Save Hero
            </button>
            <StatusBanner status={status} />
          </div>
        </form>
      </Panel>
    </section>
  );
}

export default HeroPage;
