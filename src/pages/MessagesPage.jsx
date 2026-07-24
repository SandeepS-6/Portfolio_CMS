import { useEffect, useMemo, useState } from "react";
import { CheckCheck, Inbox, Trash2 } from "lucide-react";
import { messagesApi } from "../services/api";
import {
  EmptyState,
  LoadingBlock,
  PageHeader,
  Panel,
  SearchToolbar,
  StatusBanner,
} from "../components/ui";
import "./pages.css";

function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  async function load() {
    setMessages(await messagesApi.list());
  }

  useEffect(() => {
    setLoading(true);
    load()
      .catch((err) => setStatus(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function markRead(id) {
    await messagesApi.markRead(id);
    await load();
  }

  async function remove(id) {
    await messagesApi.remove(id);
    await load();
  }

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return messages;
    return messages.filter((msg) =>
      [msg.name, msg.email, msg.subject, msg.body]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [messages, query]);

  const unread = messages.filter((msg) => !msg.isRead).length;

  return (
    <section className="page">
      <PageHeader
        eyebrow="Engage"
        title="Messages"
        lead="Inbox from the portfolio contact form."
      />

      <StatusBanner status={status} />

      <Panel
        title="Inbox"
        meta={`${messages.length} messages${unread ? ` · ${unread} unread` : ""}`}
        flush
      >
        {loading ? (
          <LoadingBlock />
        ) : (
          <>
            <SearchToolbar
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search messages…"
              countLabel={`${filtered.length} shown`}
            />

            {filtered.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title={messages.length === 0 ? "Inbox is empty" : "No matches"}
                detail={
                  messages.length === 0
                    ? "New contact form submissions will show up here."
                    : "Try a different search term."
                }
              />
            ) : (
              <ul className="list">
                {filtered.map((msg) => (
                  <li key={msg.id} className="list__item list__item--block">
                    <div>
                      <strong>
                        {msg.name}
                        {!msg.isRead ? <span className="badge">New</span> : null}
                      </strong>
                      <p>
                        &lt;{msg.email}&gt; · {msg.subject || "(no subject)"}
                      </p>
                      <p>{msg.body}</p>
                      <small>{new Date(msg.createdAt).toLocaleString()}</small>
                    </div>
                    <div className="list__actions">
                      {!msg.isRead && (
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => markRead(msg.id)}
                        >
                          <CheckCheck size={14} aria-hidden="true" />
                          Mark read
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn--danger btn--sm"
                        onClick={() => remove(msg.id)}
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

export default MessagesPage;
