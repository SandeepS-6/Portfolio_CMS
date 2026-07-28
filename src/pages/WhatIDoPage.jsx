import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { whatIDoApi } from "../services/api";
import {
  Field,
  LoadingBlock,
  PageHeader,
  Panel,
  StatusBanner,
} from "../components/ui";
import "./pages.css";

function WhatIDoPage() {
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    whatIDoApi
      .get()
      .then((data) => {
        setForm({
          title: data.title || "",
          lead: data.lead || "",
          cinemaTitle: data.cinemaTitle || "",
          marqueeText: data.marqueeText || "",
          items: JSON.stringify(data.items || [], null, 2),
        });
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
      const items = JSON.parse(form.items || "[]");
      if (!Array.isArray(items)) {
        throw new Error("Items must be a JSON array");
      }
      await whatIDoApi.update({
        title: form.title,
        lead: form.lead,
        cinemaTitle: form.cinemaTitle,
        marqueeText: form.marqueeText,
        items,
      });
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
          title="What I Do"
          lead="Capability cards and section copy."
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
        title="What I Do"
        lead="How I work — title, lead, marquee, and capability cards."
      />

      <Panel title="Section copy" meta="Updates appear on the live site after save">
        <form className="form form--grid" onSubmit={onSubmit}>
          <Field label="Title" name="title" value={form.title} onChange={onChange} />
          <Field
            label="Cinema title"
            name="cinemaTitle"
            value={form.cinemaTitle}
            onChange={onChange}
          />
          <Field
            label="Marquee text"
            name="marqueeText"
            value={form.marqueeText}
            onChange={onChange}
          />
          <Field
            label="Lead"
            name="lead"
            type="textarea"
            rows={3}
            value={form.lead}
            onChange={onChange}
            full
          />
          <Field
            label="Items (JSON array)"
            name="items"
            type="textarea"
            mono
            rows={18}
            value={form.items}
            onChange={onChange}
            full
            hint='Each item: id, phase, title, detail, icon, span (1|2), accentPeriod, accentDot'
          />
          <div className="form__footer form__span-full">
            <button type="submit" className="btn">
              <Save size={16} aria-hidden="true" />
              Save What I Do
            </button>
            <StatusBanner status={status} />
          </div>
        </form>
      </Panel>
    </section>
  );
}

export default WhatIDoPage;
