import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Edit3, ListChecks, Plus, RefreshCw, ShieldOff } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import {
  createWatchlistEntry,
  disableWatchlistEntry,
  getWatchlist,
  updateWatchlistEntry,
} from '../services/api';
import type { WatchlistCreatePayload, WatchlistEntry } from '../services/api';

type WatchlistForm = WatchlistCreatePayload;

const emptyForm: WatchlistForm = {
  entity_type: 'VEHICLE',
  entity_identifier: '',
  name: '',
  description: '',
  priority: 'MEDIUM',
  is_active: true,
};

export default function Watchlist() {
  const [entries, setEntries] = useState<WatchlistEntry[]>([]);
  const [form, setForm] = useState<WatchlistForm>(emptyForm);
  const [editing, setEditing] = useState<WatchlistEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadEntries = async () => {
    try {
      setLoading(true);
      setError('');
      setEntries(await getWatchlist());
    } catch (requestError) {
      console.error(requestError);
      setError('Unable to load watchlist entries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const updateField = (field: keyof WatchlistForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setSuccess('');
  };

  const openEdit = (entry: WatchlistEntry) => {
    setEditing(entry);
    setForm({
      entity_type: entry.entity_type,
      entity_identifier: entry.entity_identifier,
      name: entry.name,
      description: entry.description || '',
      priority: entry.priority,
      is_active: entry.is_active,
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      if (editing) {
        await updateWatchlistEntry(editing.id, form);
        setSuccess('Watchlist entry updated.');
      } else {
        await createWatchlistEntry(form);
        setSuccess('Watchlist entry created.');
      }
      setEditing(null);
      setForm(emptyForm);
      await loadEntries();
    } catch (requestError: any) {
      console.error(requestError);
      setError(requestError?.response?.data?.detail || 'Unable to save watchlist entry.');
    } finally {
      setSaving(false);
    }
  };

  const handleDisable = async (entry: WatchlistEntry) => {
    if (!window.confirm(`Disable ${entry.entity_identifier} from the watchlist?`)) return;
    try {
      setError('');
      await disableWatchlistEntry(entry.id);
      setSuccess('Watchlist entry disabled.');
      await loadEntries();
    } catch (requestError: any) {
      console.error(requestError);
      setError(requestError?.response?.data?.detail || 'Unable to disable watchlist entry.');
    }
  };

  return (
    <MainLayout>
      <div className='page-header'>
        <div>
          <h1>Vehicle &amp; Entity Watchlist</h1>
          <p>Manage synthetic vehicles and entities used for detection matching.</p>
        </div>
        <button className='primary-button' type='button' onClick={openCreate}>
          <Plus size={16} /> Add Entry
        </button>
      </div>

      {error && <div className='error-banner'>{error}</div>}
      {success && <div className='success-banner'>{success}</div>}

      <section className='panel'>
        <div className='panel-title'>
          <div>
            <h2>{editing ? 'Edit Watchlist Entry' : 'Add Watchlist Entry'}</h2>
            <span>Use synthetic identifiers such as DL01AB1234 for demonstrations.</span>
          </div>
        </div>
        <form className='search-form' onSubmit={handleSubmit}>
          <label>Entity Type<select value={form.entity_type} onChange={(event) => updateField('entity_type', event.target.value)}><option value='VEHICLE'>Vehicle</option><option value='PERSON'>Person</option><option value='ENTITY'>Entity</option></select></label>
          <label>Identifier<input value={form.entity_identifier} onChange={(event) => updateField('entity_identifier', event.target.value)} placeholder='e.g. DL01AB1234' required /></label>
          <label>Name<input value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder='Synthetic watchlist entry' required /></label>
          <label>Priority<select value={form.priority} onChange={(event) => updateField('priority', event.target.value)}><option value='LOW'>Low</option><option value='MEDIUM'>Medium</option><option value='HIGH'>High</option></select></label>
          <label>Description<input value={form.description} onChange={(event) => updateField('description', event.target.value)} placeholder='Reason for monitoring' /></label>
          <div className='search-actions'><button className='primary-button' type='submit' disabled={saving}>{editing ? 'Save Changes' : 'Create Entry'}</button>{editing && <button className='secondary-button' type='button' onClick={openCreate}>Cancel</button>}</div>
        </form>
      </section>

      <section className='panel' style={{ marginTop: 18 }}>
        <div className='panel-title'>
          <div><h2>Managed Entries</h2><span>{entries.length} watchlist entr{entries.length === 1 ? 'y' : 'ies'}</span></div>
          <button className='outline-button' type='button' onClick={loadEntries} disabled={loading}><RefreshCw size={14} /> Refresh</button>
        </div>
        {loading ? <div className='empty-panel'>Loading watchlist...</div> : entries.length === 0 ? <div className='empty-panel'><ListChecks size={30} /><p>No watchlist entries configured.</p></div> : <div className='table-wrap'><table><thead><tr><th>Type</th><th>Identifier</th><th>Name</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead><tbody>{entries.map((entry) => <tr key={entry.id}><td>{entry.entity_type}</td><td><strong>{entry.entity_identifier}</strong></td><td>{entry.name}<small>{entry.description || 'No description'}</small></td><td>{entry.priority}</td><td>{entry.is_active ? 'ACTIVE' : 'DISABLED'}</td><td><div className='table-actions'><button className='icon-action' type='button' title='Edit entry' onClick={() => openEdit(entry)}><Edit3 size={15} /></button>{entry.is_active && <button className='icon-action danger' type='button' title='Disable entry' onClick={() => handleDisable(entry)}><ShieldOff size={15} /></button>}</div></td></tr>)}</tbody></table></div>}
      </section>
    </MainLayout>
  );
}
