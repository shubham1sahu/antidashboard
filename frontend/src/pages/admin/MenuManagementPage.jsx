import React, { useEffect, useState } from 'react';
import useMenuStore from '../../store/menuStore';
import useCategoryStore from '../../store/categoryStore';
import MenuItemForm from '../../components/admin/MenuItemForm';
import DashboardShell from '../../components/layout/DashboardShell';

const navItems = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/tables', label: 'Tables' },
  { to: '/admin/reservations', label: 'Reservations' },
  { to: '/admin/menu', label: 'Menu' },
  { to: '/admin/users', label: 'Users' },
];

const MenuManagementPage = () => {
  const { menuItems, isLoading, error, fetchMenuItems, addMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability } = useMenuStore();
  const { categories, fetchCategories, addCategory } = useCategoryStore();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, [fetchMenuItems, fetchCategories]);

  const handleOpenAddForm = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (item) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleSubmitForm = async (formData) => {
    if (selectedItem) {
      await updateMenuItem(selectedItem.id, formData);
    } else {
      await addMenuItem(formData);
    }
    setIsFormOpen(false);
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setIsDeleting(true);
      await deleteMenuItem(itemToDelete.id);
      setItemToDelete(null);
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchCategory = filterCategory === 'ALL' || item.category?.name === filterCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <DashboardShell
      title="Menu Management"
      subtitle="Manage your restaurant offerings, prices, and specials."
      navItems={navItems}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            <button
              onClick={() => setFilterCategory('ALL')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                filterCategory === 'ALL' 
                  ? 'bg-[color:var(--primary)] text-white' 
                  : 'bg-white text-[color:var(--text-secondary)] border border-[color:var(--border)] hover:bg-[color:var(--surface-alt)]'
              }`}
            >
              All Items
            </button>
            {categories?.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                  filterCategory === cat.name 
                    ? 'bg-[color:var(--primary)] text-white' 
                    : 'bg-white text-[color:var(--text-secondary)] border border-[color:var(--border)] hover:bg-[color:var(--surface-alt)]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative">
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-full border border-[color:var(--border)] outline-none focus:border-[color:var(--accent)] transition-colors shadow-sm w-full sm:w-64"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            {showCategoryInput ? (
              <div className="flex items-center gap-2">
                <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="New Category" className="border px-2 py-1.5 rounded outline-none text-sm focus:border-[color:var(--accent)]" />
                <button onClick={() => { if(newCategoryName){ addCategory(newCategoryName); setNewCategoryName(''); setShowCategoryInput(false); } }} className="btn-accent text-sm py-1.5 px-3">Save</button>
                <button onClick={() => setShowCategoryInput(false)} className="text-gray-500 font-bold hover:text-gray-700">X</button>
              </div>
            ) : (
              <button onClick={() => setShowCategoryInput(true)} className="px-4 py-2 rounded-full border border-dashed border-gray-300 text-gray-500 hover:border-gray-500 text-sm font-medium whitespace-nowrap">
                + Category
              </button>
            )}
            <button
              onClick={handleOpenAddForm}
              className="btn-accent whitespace-nowrap"
            >
              + Add New Item
            </button>
          </div>
        </div>

        {error && <div className="bg-red-100 text-red-800 p-4 rounded-md mb-6">{error}</div>}

        {isLoading && menuItems.length === 0 ? (
          <p className="text-center py-10 text-gray-500">Loading menu...</p>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map(item => (
                  <tr key={item.id} className={item.available ? "hover:bg-gray-50" : "bg-red-50 hover:bg-red-100"}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 relative">
                          {item.imageUrl ? (
                            <img className="h-10 w-10 rounded-full object-cover" src={item.imageUrl} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 text-lg font-bold">
                              {item.name.charAt(0)}
                            </div>
                          )}
                          {item.special && (
                            <span className="absolute -top-1 -right-1 text-orange-500 drop-shadow-sm text-sm" title="Seasonal/Special">⭐</span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500 break-words max-w-xs">{item.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {item.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat(item.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => toggleAvailability(item.id)}
                        className={`px-3 py-1 text-xs rounded-full cursor-pointer transition ${item.available ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                      >
                        {item.available ? 'Available' : 'Out of Stock'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleOpenEditForm(item)} 
                        className="text-[color:var(--accent)] hover:opacity-80 mr-4 font-bold"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(item)} 
                        className="text-[color:var(--error)] hover:opacity-80 font-bold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No menu items found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isFormOpen && (
        <MenuItemForm
          item={selectedItem}
          categories={categories}
          onSubmit={handleSubmitForm}
          onCancel={() => setIsFormOpen(false)}
          isLoading={isLoading}
        />
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">Confirm Deletion</h3>
            <p className="mb-6 text-slate-600">
              Are you sure you want to delete <span className="font-semibold text-slate-900">{itemToDelete.name}</span>? 
              This action cannot be undone and will permanently remove this item from your menu.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setItemToDelete(null)}
                disabled={isDeleting}
                className="flex-1 rounded-xl border border-slate-200 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 rounded-xl bg-red-600 py-3 font-semibold text-white hover:bg-red-700 shadow-lg shadow-red-200 transition disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
};

export default MenuManagementPage;
