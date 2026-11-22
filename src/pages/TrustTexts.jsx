import { useCallback, useEffect, useState } from "react";
import { Header, Panel } from "../components/UI";
import { trustTextApi } from "../services/api";

const blankForm = { text: "", icon: "", display_order: "0", is_active: true };

function errorMessage(error, fallback) {
  const data = error.response?.data;
  if (typeof data === "string") return data;
  if (data?.detail) return data.detail;
  if (data && typeof data === "object") {
    return Object.entries(data).map(([field, messages]) =>
      `${field}: ${Array.isArray(messages) ? messages.join(" ") : messages}`
    ).join(" ");
  }
  return fallback;
}

export default function TrustTexts() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await trustTextApi.list();
      const items = Array.isArray(data) ? data : data?.results;
      if (!Array.isArray(items)) throw new Error("The Trust Text API returned an unexpected response.");
      setEntries(items);
    } catch (err) {
      setError(err.message === "The Trust Text API returned an unexpected response."
        ? err.message : errorMessage(err, "Unable to load Trust Text entries."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  const openCreate = () => {
    setEditing(null);
    setForm(blankForm);
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (entry) => {
    setEditing(entry);
    setForm({
      text: entry.text ?? "",
      icon: entry.icon ?? "",
      display_order: String(entry.display_order ?? 0),
      is_active: entry.is_active ?? entry.active ?? false,
    });
    setFormError("");
    setFormOpen(true);
  };

  const submitForm = async (event) => {
    event.preventDefault();
    const order = Number(form.display_order);
    if (!form.text.trim()) return setFormError("Text is required.");
    if (!form.icon.trim()) return setFormError("Icon identifier is required.");
    if (!Number.isInteger(order) || order < 0) return setFormError("Display order must be a non-negative integer.");

    const payload = { text: form.text.trim(), icon: form.icon.trim(), display_order: order, is_active: form.is_active };
    setSaving(true);
    setFormError("");
    try {
      if (editing) await trustTextApi.update(editing.id, payload);
      else await trustTextApi.create(payload);
      setFormOpen(false);
      await loadEntries();
    } catch (err) {
      setFormError(errorMessage(err, "Unable to save Trust Text entry."));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (entry) => {
    const active = entry.is_active ?? entry.active ?? false;
    setBusyId(entry.id);
    setError("");
    try {
      await trustTextApi.update(entry.id, { is_active: !active });
      await loadEntries();
    } catch (err) {
      setError(errorMessage(err, "Unable to update Trust Text status."));
    } finally {
      setBusyId(null);
    }
  };

  const deleteEntry = async (entry) => {
    if (!window.confirm(`Delete “${entry.text}”? This cannot be undone.`)) return;
    setBusyId(entry.id);
    setError("");
    try {
      await trustTextApi.remove(entry.id);
      setEntries((current) => current.filter((item) => item.id !== entry.id));
    } catch (err) {
      setError(errorMessage(err, "Unable to delete Trust Text entry."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <Header title="Trust Text" desc="Manage the trust messages shown on your storefront.">
        <button className="btn" type="button" onClick={openCreate}>+ Add Trust Text</button>
      </Header>

      <Panel className="trust-text-panel">
        {loading && <div className="empty-state" role="status">Loading Trust Text entries...</div>}
        {!loading && error && <div className="trust-text-error" role="alert">
          <p>{error}</p><button className="btn secondary" type="button" onClick={loadEntries}>Retry</button>
        </div>}
        {!loading && !error && entries.length === 0 && <div className="empty-state">No Trust Text entries found.</div>}
        {!loading && !error && entries.length > 0 && <div className="trust-text-table-wrap">
          <table className="trust-text-table">
            <thead><tr><th>Text</th><th>Icon</th><th>Display order</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{entries.map((entry, index) => {
              const active = entry.is_active ?? entry.active;
              const rowBusy = busyId === entry.id;
              return <tr key={entry.id ?? `${entry.text}-${index}`}>
                <td data-label="Text"><strong>{entry.text ?? "—"}</strong></td>
                <td data-label="Icon"><code>{entry.icon ?? "—"}</code></td>
                <td data-label="Display order">{entry.display_order ?? "—"}</td>
                <td data-label="Status"><span className={`trust-status ${active === true ? "is-active" : "is-inactive"}`}>{active ? "Active" : "Inactive"}</span></td>
                <td data-label="Actions" className="trust-row-actions">
                  <button className="btn secondary trust-action" type="button" disabled={rowBusy} onClick={() => openEdit(entry)}>Edit</button>
                  <button className="btn secondary trust-action" type="button" disabled={rowBusy} onClick={() => toggleActive(entry)}>{rowBusy ? "Saving…" : active ? "Deactivate" : "Activate"}</button>
                  <button className="btn danger trust-action" type="button" disabled={rowBusy} onClick={() => deleteEntry(entry)}>Delete</button>
                </td>
              </tr>;
            })}</tbody>
          </table>
        </div>}
      </Panel>

      {formOpen && <div className="trust-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setFormOpen(false); }}>
        <section className="trust-modal" role="dialog" aria-modal="true" aria-labelledby="trust-modal-title">
          <div className="trust-modal-head">
            <div><h2 id="trust-modal-title">{editing ? "Edit Trust Text" : "Add Trust Text"}</h2><p>Set the message and how it appears in the storefront bar.</p></div>
            <button className="trust-modal-close" type="button" aria-label="Close" disabled={saving} onClick={() => setFormOpen(false)}>×</button>
          </div>
          <form onSubmit={submitForm}>
            <label className="trust-field">Text<input autoFocus maxLength={255} value={form.text} onChange={(event) => setForm({ ...form, text: event.target.value })} required /></label>
            <label className="trust-field">Icon identifier<input maxLength={100} placeholder="e.g. truck" value={form.icon} onChange={(event) => setForm({ ...form, icon: event.target.value })} required /></label>
            <label className="trust-field">Display order<input type="number" min="0" step="1" value={form.display_order} onChange={(event) => setForm({ ...form, display_order: event.target.value })} required /></label>
            <label className="trust-active-field"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} /><span>Active</span></label>
            {formError && <div className="trust-form-error" role="alert">{formError}</div>}
            <div className="trust-modal-actions"><button className="btn secondary" type="button" disabled={saving} onClick={() => setFormOpen(false)}>Cancel</button><button className="btn" type="submit" disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Add Trust Text"}</button></div>
          </form>
        </section>
      </div>}
    </>
  );
}
