import { useEffect, useMemo, useState } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import StatusBadge from '../../components/ui/StatusBadge';
import ToastMessage from '../../components/ui/ToastMessage';
import { createTable, deleteTable, getTables, updateStatus, updateTable } from '../../api/tableApi';
import { createWalkIn } from '../../api/reservationApi';

const navItems = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/tables', label: 'Tables' },
  { to: '/admin/reservations', label: 'Reservations' },
  { to: '/admin/menu', label: 'Menu' },
  { to: '/admin/users', label: 'Users' },
];

const initialForm = {
  tableNumber: '',
  capacity: 2,
  location: '',
  floorNumber: 1,
  status: 'AVAILABLE',
};

function TableManagement() {
  const [tables, setTables] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ type: 'error', message: '' });
  const [walkInTable, setWalkInTable] = useState(null);
  const [walkInForm, setWalkInForm] = useState({ guestCount: 1, customerName: '' });

  useEffect(() => {
    loadTables();
  }, []);

  const filteredTables = useMemo(() => {
    if (filter === 'ALL') return tables;
    return tables.filter((table) => table.status === filter);
  }, [filter, tables]);

  const loadTables = async () => {
    try {
      setLoading(true);
      const data = await getTables();
      setTables(data);
    } catch (error) {
      setToast({ type: 'error', message: extractError(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      capacity: Number(form.capacity),
      floorNumber: Number(form.floorNumber),
    };

    try {
      if (editingId) {
        await updateTable(editingId, payload);
        setToast({ type: 'success', message: 'Table updated successfully.' });
      } else {
        await createTable(payload);
        setToast({ type: 'success', message: 'Table created successfully.' });
      }
      setForm(initialForm);
      setEditingId(null);
      await loadTables();
    } catch (error) {
      setToast({ type: 'error', message: extractError(error) });
    }
  };

  const handleEdit = (table) => {
    setEditingId(table.id);
    setForm({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      location: table.location,
      floorNumber: table.floorNumber,
      status: table.status,
    });
  };

  const handleDelete = async (id) => {
    try {
      await deleteTable(id);
      setToast({ type: 'success', message: 'Table deleted successfully.' });
      await loadTables();
    } catch (error) {
      setToast({ type: 'error', message: extractError(error) });
    }
  };

  const handleStatusToggle = async (table) => {
    const nextStatus = nextTableStatus(table.status);
    try {
      await updateStatus(table.id, nextStatus);
      setToast({ type: 'success', message: `Table ${table.tableNumber} moved to ${nextStatus}.` });
      await loadTables();
    } catch (error) {
      setToast({ type: 'error', message: extractError(error) });
    }
  };

  const handleWalkInInit = (table) => {
    setWalkInTable(table);
    setWalkInForm({ guestCount: table.capacity, customerName: '' });
  };

  const handleWalkInSubmit = async (e) => {
    e.preventDefault();
    try {
      await createWalkIn({
        tableId: walkInTable.id,
        guestCount: Number(walkInForm.guestCount),
        customerName: walkInForm.customerName,
      });
      setToast({ type: 'success', message: `Walk-in confirmed for Table ${walkInTable.tableNumber}.` });
      setWalkInTable(null);
      await loadTables();
    } catch (error) {
      setToast({ type: 'error', message: extractError(error) });
    }
  };

  return (
    <DashboardShell
      title="Table Management"
      subtitle="Maintain live inventory, floor layout details, and operational table status transitions."
      navItems={navItems}
    >
      <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast({ type: 'error', message: '' })} />

      {walkInTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-[color:var(--text-primary)]">Quick Walk-in: {walkInTable.tableNumber}</h3>
            <p className="mt-1 text-sm text-[color:var(--text-secondary)]">Enter guest details to immediately occupy this table.</p>
            
            <form onSubmit={handleWalkInSubmit} className="mt-6 space-y-4">
              <FormField label="Guest Count">
                <input 
                  type="number" 
                  min="1" 
                  max={walkInTable.capacity} 
                  className="input" 
                  value={walkInForm.guestCount}
                  onChange={(e) => setWalkInForm({ ...walkInForm, guestCount: e.target.value })}
                  required
                />
              </FormField>
              <FormField label="Customer Name (Optional)">
                <input 
                  type="text" 
                  className="input" 
                  placeholder="e.g. John Doe"
                  value={walkInForm.customerName}
                  onChange={(e) => setWalkInForm({ ...walkInForm, customerName: e.target.value })}
                />
              </FormField>
              
              <div className="mt-8 flex gap-3">
                <button type="submit" className="btn-accent flex-1">Confirm Walk-in</button>
                <button type="button" className="btn-outline" onClick={() => setWalkInTable(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.25fr]">
        <form className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]" onSubmit={handleSubmit}>
          <h3 className="text-xl font-semibold text-[color:var(--text-primary)]">{editingId ? 'Edit table' : 'Add table'}</h3>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <FormField label="Table number">
              <input className="input" value={form.tableNumber} onChange={(event) => setForm({ ...form, tableNumber: event.target.value })} />
            </FormField>
            <FormField label="Capacity">
              <input type="number" min="1" className="input" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} />
            </FormField>
            <FormField label="Location">
              <input className="input" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} />
            </FormField>
            <FormField label="Floor number">
              <input type="number" className="input" value={form.floorNumber} onChange={(event) => setForm({ ...form, floorNumber: event.target.value })} />
            </FormField>
            <div className="md:col-span-2">
              <FormField label="Status">
                <select className="input" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                  <option value="AVAILABLE">Available</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="OCCUPIED">Occupied</option>
                </select>
              </FormField>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="submit" className="btn-accent">{editingId ? 'Update table' : 'Create table'}</button>
            {editingId ? (
              <button type="button" className="btn-outline" onClick={() => { setEditingId(null); setForm(initialForm); }}>
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>

        <section className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-[color:var(--text-primary)]">Current inventory</h3>
              <p className="text-sm text-[color:var(--text-secondary)]">Filter by operational status and manage each table directly.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {['ALL', 'AVAILABLE', 'RESERVED', 'OCCUPIED'].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={[
                    'rounded-full px-3 py-2 text-xs font-semibold transition',
                    filter === item ? 'bg-[color:var(--primary)] text-white' : 'bg-[color:var(--surface-alt)] text-[color:var(--text-secondary)]',
                  ].join(' ')}
                  onClick={() => setFilter(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {loading ? <p className="text-sm text-[color:var(--text-secondary)]">Loading tables...</p> : null}
            {!loading && filteredTables.length === 0 ? <p className="text-sm text-[color:var(--text-secondary)]">No tables found for this filter.</p> : null}

            {filteredTables.map((table) => (
              <article key={table.id} className="rounded-2xl border border-[color:var(--border)] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-semibold text-[color:var(--text-primary)]">{table.tableNumber}</h4>
                    <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
                      {table.capacity} guests | {table.location} | Floor {table.floorNumber}
                    </p>
                  </div>
                  <StatusBadge status={table.status} />
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button type="button" className="btn-outline" onClick={() => handleEdit(table)}>Edit</button>
                  {table.status === 'AVAILABLE' && (
                    <button type="button" className="btn-accent" onClick={() => handleWalkInInit(table)}>Walk-in</button>
                  )}
                  <button type="button" className="btn-outline" onClick={() => handleStatusToggle(table)}>Next status</button>
                  <button type="button" className="btn-ghost" onClick={() => handleDelete(table.id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </DashboardShell>
  );
}

function FormField({ label, children }) {
  return (
    <label>
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

function nextTableStatus(status) {
  const order = {
    AVAILABLE: 'RESERVED',
    RESERVED: 'OCCUPIED',
    OCCUPIED: 'AVAILABLE',
  };
  return order[status] || 'AVAILABLE';
}

function extractError(error) {
  return error?.response?.data?.error || error?.response?.data?.message || 'Unable to complete the table action.';
}

export default TableManagement;
