import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { meetingApi } from "../services/api";
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

const FIELDS = [
  "hostName",
  "hostInitials",
  "title",
  "durations",
  "locationLabel",
  "meetUrl",
  "timezone",
  "workDays",
  "dayStartHour",
  "dayEndHour",
  "slotIntervalMin",
  "bufferMinutes",
  "bookingWindowDays",
  "isActive",
];

const TEMPLATE_FIELDS = [
  "guestEmailSubject",
  "guestEmailBody",
  "hostEmailSubject",
  "hostEmailBody",
];

const HINTS = {
  durations: "Comma-separated minutes, e.g. 30, 60",
  workDays: "0=Sun … 6=Sat, e.g. 1, 2, 3, 4, 5",
  dayStartHour: "Hour 0–23. Example: 9 = 9:00am",
  dayEndHour: "Hour 0–23. Example: 20 = 8:00pm",
  guestEmailSubject: "Sent to the guest. Tokens: {{guestName}} {{hostName}} {{title}} {{when}}",
  guestEmailBody:
    "Tokens: {{guestName}} {{guestEmail}} {{hostName}} {{title}} {{subject}} {{notes}} {{when}} {{duration}} {{location}} {{timezone}} {{meetUrl}}",
  hostEmailSubject: "Sent to you (MAIL_TO). Same tokens as guest.",
  hostEmailBody: "Same tokens as the guest template.",
  meetUrl: "Optional fallback Meet link. Unique Meet links need GOOGLE_REFRESH_TOKEN.",
};

const DEFAULT_TEMPLATES = {
  guestEmailSubject:
    "Your 30-minute session with {{hostName}} is confirmed.",
  guestEmailBody: [
    "Hi {{guestName}},",
    "",
    "Thanks for booking a call. I'm looking forward to our conversation — use the Google Meet button below to join at the scheduled time.",
    "",
    "Talk soon,",
    "{{hostName}}",
  ].join("\n"),
  hostEmailSubject: "New booking: {{guestName}} — {{when}}",
  hostEmailBody: [
    "Hi,",
    "",
    "A new 30-minute session was booked on the portfolio scheduler.",
    "",
    "Guest notes:",
    "{{notes}}",
  ].join("\n"),
};

function minutesToHour(minutes) {
  const n = Number(minutes);
  if (!Number.isFinite(n)) return "";
  return String(Math.floor(n / 60));
}

function hourToMinutes(hour) {
  const n = Number(hour);
  if (!Number.isFinite(n)) return 0;
  return Math.min(23, Math.max(0, Math.floor(n))) * 60;
}

function MeetingSettingsPage() {
  const [form, setForm] = useState(null);
  const [hostImageUrl, setHostImageUrl] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    meetingApi
      .getSettings()
      .then((data) => {
        const next = {};
        FIELDS.forEach((key) => {
          if (key === "dayStartHour") {
            next[key] = minutesToHour(data.dayStartMinutes);
            return;
          }
          if (key === "dayEndHour") {
            next[key] = minutesToHour(data.dayEndMinutes);
            return;
          }
          if (Array.isArray(data[key])) next[key] = data[key].join(", ");
          else if (typeof data[key] === "boolean") next[key] = data[key];
          else next[key] = data[key] ?? "";
        });
        TEMPLATE_FIELDS.forEach((key) => {
          next[key] = data[key] || DEFAULT_TEMPLATES[key];
        });
        setForm(next);
        setHostImageUrl(data.hostImageUrl || "");
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
      const { dayStartHour, dayEndHour, ...rest } = form;
      await meetingApi.updateSettings({
        ...rest,
        hostImageUrl: hostImageUrl || null,
        durations: String(form.durations)
          .split(",")
          .map((s) => Number(s.trim()))
          .filter((n) => Number.isFinite(n)),
        workDays: String(form.workDays)
          .split(",")
          .map((s) => Number(s.trim()))
          .filter((n) => Number.isFinite(n)),
        dayStartMinutes: hourToMinutes(dayStartHour),
        dayEndMinutes: hourToMinutes(dayEndHour),
        slotIntervalMin: Number(form.slotIntervalMin),
        bufferMinutes: Number(form.bufferMinutes),
        bookingWindowDays: Number(form.bookingWindowDays),
        isActive: !!form.isActive,
        guestEmailSubject: form.guestEmailSubject || null,
        guestEmailBody: form.guestEmailBody || null,
        hostEmailSubject: form.hostEmailSubject || null,
        hostEmailBody: form.hostEmailBody || null,
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
        lead="Scheduler hours, host photo, and dual email templates (guest + you)."
      />

      <Panel
        title="Scheduler config"
        meta="Type hours as 9 and 20 (24h). Work days: 0=Sun … 6=Sat."
      >
        <form className="form form--grid" onSubmit={onSubmit}>
          <FileUpload
            label="Host photo"
            value={hostImageUrl}
            accept="image/*"
            onChange={setHostImageUrl}
            hint="Shown instead of initials. Medium corners on the Meet card."
          />
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
                type={
                  name === "dayStartHour" || name === "dayEndHour"
                    ? "number"
                    : "text"
                }
                value={form[name]}
                onChange={onChange}
                hint={HINTS[name]}
              />
            ),
          )}

          <div className="form__span-full">
            <h3 className="panel__subtitle">Email to guest</h3>
            <p className="form__hint">
              Subject/body copy only. HTML card layout is built in the backend
              mailer. Tokens: {"{{guestName}}"}, {"{{when}}"}, etc.
            </p>
          </div>
          <Field
            label="Guest subject"
            name="guestEmailSubject"
            value={form.guestEmailSubject}
            onChange={onChange}
            hint={HINTS.guestEmailSubject}
            full
          />
          <Field
            label="Guest body"
            name="guestEmailBody"
            value={form.guestEmailBody}
            onChange={onChange}
            hint={HINTS.guestEmailBody}
            rows={8}
            full
          />

          <div className="form__span-full">
            <h3 className="panel__subtitle">Email to you (host)</h3>
            <p className="form__hint">Goes to MAIL_TO / SMTP inbox.</p>
          </div>
          <Field
            label="Host subject"
            name="hostEmailSubject"
            value={form.hostEmailSubject}
            onChange={onChange}
            hint={HINTS.hostEmailSubject}
            full
          />
          <Field
            label="Host body"
            name="hostEmailBody"
            value={form.hostEmailBody}
            onChange={onChange}
            hint={HINTS.hostEmailBody}
            rows={8}
            full
          />

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
