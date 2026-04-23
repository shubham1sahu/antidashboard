import React from 'react';
import AdminLayout from '../../components/layout/AdminLayout';

const AdminBillingPage = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-6">Billing & Payments</h1>
        <div className="bg-[var(--bg-secondary)] rounded-xl shadow-sm border border-[var(--border-color)] p-8 text-center text-[var(--text-secondary)]">
          <p className="text-lg">Billing overview dashboard will be implemented here.</p>
          <p className="mt-2">You will be able to view all generated bills, payment statuses, and transaction details.</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBillingPage;
