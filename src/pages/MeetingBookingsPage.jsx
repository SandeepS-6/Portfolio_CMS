import { useEffect, useMemo, useState } from "react";
import { Ban, CalendarCheck, Trash2 } from "lucide-react";
import { meetingApi } from "../services/api";
import {
  EmptyState,
  LoadingBlock,
  PageHeader,
  Panel,
  SearchToolbar,
  StatusBanner,
} from "../components/ui";
import "./pages.css";

function MeetingBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  async function load() {
    setBookings(await meetingApi.listBookings());
  }

  useEffect(() => {
    setLoading(true);
    load()
      .catch((err) => setStatus(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function cancel(id) {
    await meetingApi.cancelBooking(id);
    await load();
  }

  async function remove(id) {
    await meetingApi.removeBooking(id);
    await load();
  }

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return bookings;
    return bookings.filter((booking) =>
      [
        booking.guestName,
        booking.guestEmail,
        booking.subject,
        booking.notes,
        booking.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [bookings, query]);

  return (
    <section className="page">
      <PageHeader
        eyebrow="Engage"
        title="Meeting Bookings"
        lead="Booked calls from the public Let's Talk scheduler."
      />

      <StatusBanner status={status} />

      <Panel title="Bookings" meta={`${bookings.length} total`} flush>
        {loading ? (
          <LoadingBlock />
        ) : (
          <>
            <SearchToolbar
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search bookings…"
              countLabel={`${filtered.length} shown`}
            />

            {filtered.length === 0 ? (
              <EmptyState
                icon={CalendarCheck}
                title={bookings.length === 0 ? "No bookings yet" : "No matches"}
                detail={
                  bookings.length === 0
                    ? "Confirmed meetings will appear here."
                    : "Try a different search term."
                }
              />
            ) : (
              <ul className="list">
                {filtered.map((booking) => (
                  <li key={booking.id} className="list__item list__item--block">
                    <div>
                      <strong>
                        {booking.guestName}
                        {booking.status !== "confirmed" ? (
                          <span className="badge badge--warning">{booking.status}</span>
                        ) : (
                          <span className="badge badge--success">confirmed</span>
                        )}
                      </strong>
                      <p>
                        &lt;{booking.guestEmail}&gt; ·{" "}
                        {new Date(booking.startAt).toLocaleString()} ·{" "}
                        {booking.durationMin} min · {booking.locationLabel}
                      </p>
                      {booking.subject ? <p><em>{booking.subject}</em></p> : null}
                      {booking.notes ? <p>{booking.notes}</p> : null}
                      <small>{booking.timezone}</small>
                    </div>
                    <div className="list__actions">
                      {booking.status === "confirmed" && (
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => cancel(booking.id)}
                        >
                          <Ban size={14} aria-hidden="true" />
                          Cancel
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn--danger btn--sm"
                        onClick={() => remove(booking.id)}
                      >
                        <Trash2 size={14} aria-hidden="true" />
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </Panel>
    </section>
  );
}

export default MeetingBookingsPage;
