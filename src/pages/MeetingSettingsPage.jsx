import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { meetingApi } from "../services/api";
import {
  Field,
  LoadingBlock,
  PageHeader,
  Panel,
  StatusBanner,
  Toggle,
  labelize,
} from "../components/ui";
import "./pages.css";

const FIELDS = [
  "hostName",
  "hostInitials",
  "title",
  "durations",
  "locationLabel",
  "timezone",
  "workDays",
  "dayStartMinutes",
  "dayEndMinutes",
  "slotIntervalMin",
  "bufferMinutes",
  "bookingWindowDays",
  "isActive",
];

const HINTS = {
  durations: "Comma-separated minutes, e.g. 30, 60",
  workDays: "0=Sun … 6=Sat, e.g. 1, 2, 3, 4, 5",
  dayStartMinutes: "Minutes from midnight, e.g. 1020 = 5:00pm",
  dayEndMinutes: "Minutes from midnight, e.g. 1290 = 9:30pm",
};

function MeetingSettingsPage() {
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    meetingApi
      .getSettings()
      .then((data) => {
        const next = {};
        FIELDS.forEach((key) => {
          if (Array.isArray(data[key])) next[key] = data[key].join(", ");
          else if (typeof data[key] === "boolean") next[key] = data[key];
          else next[key] = data[key] ?? "";
        });
        setForm(next);
      })
      .catch((err) => setStatus(err.message));
  }, []);

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("Saving...");
    try {
      await meetingApi.updateSettings({
        ...form,
        durations: String(form.durations)
          .split(",")
          .map((s) => Number(s.trim()))
          .filter((n) => Number.isFinite(n)),
        workDays: String(form.workDays)
          .split(",")
          .map((s) => Number(s.trim()))
          .filter((n) => Number.isFinite(n)),
        dayStartMinutes: Number(form.dayStartMinutes),
        dayEndMinutes: Number(form.dayEndMinutes),
        slotIntervalMin: Number(form.slotIntervalMin),
        bufferMinutes: Number(form.bufferMinutes),
        bookingWindowDays: Number(form.bookingWindowDays),
        isActive: !!form.isActive,
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
          eyebrow="Engage"
          title="Meeting Settings"
          lead="Controls the Let's Talk scheduler."
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
        eyebrow="Engage"
        title="Meeting Settings"
        lead="Controls the Let's Talk scheduler on the public contact page."
      />

      <Panel
        title="Scheduler config"
        meta="Work days use 0=Sun … 6=Sat. Day times are minutes from midnight."
      >
        <form className="form form--grid" onSubmit={onSubmit}>
          {FIELDS.map((name) =>
            name === "isActive" ? (
              <Toggle
                key={name}
                name={name}
                checked={!!form[name]}
                onChange={onChange}
                label="Active"
              />
            ) : (
              <Field
                key={name}
                label={labelize(name)}
                name={name}
                value={form[name]}
                onChange={onChange}
                hint={HINTS[name]}
              />
            ),
          )}
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

export default MeetingSettingsPage;
