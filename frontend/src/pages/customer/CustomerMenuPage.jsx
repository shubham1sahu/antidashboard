import React, { useEffect, useState } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import useMenuStore from '../../store/menuStore';
import useCategoryStore from '../../store/categoryStore';

const navItems = [
  { to: '/customer', label: 'Dashboard', end: true },
  { to: '/customer/menu', label: 'Menu' },
  { to: '/customer/reservations', label: 'Reservations' },
];

function CustomerMenuPage() {
  const { menuItems, fetchMenuItems, isLoading } = useMenuStore();
  const { categories, fetchCategories } = useCategoryStore();
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [imgErrors, setImgErrors] = useState({});

  useEffect(() => {
    // Force a fetch so the store populates
    fetchMenuItems(true); // only fetch available natively 
    fetchCategories();
  }, [fetchMenuItems, fetchCategories]);

  const availableItems = menuItems.filter(item => item.available);
  
  const filteredItems = activeCategory === 'ALL' 
    ? availableItems 
    : availableItems.filter(item => item.category?.name === activeCategory);

  return (
    <DashboardShell title="Digital Menu" subtitle="Browse our finest selections before your reservation." navItems={navItems}>
      
      {/* Category Navigation */}
      <div className="mb-8 flex flex-wrap gap-3">
        <button
          onClick={() => setActiveCategory('ALL')}
          className={`px-5 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 transform outline-none ${
            activeCategory === 'ALL' 
              ? 'bg-[color:var(--accent)] text-white shadow-lg scale-105' 
              : 'bg-white text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-alt)] border border-[color:var(--border)] hover:shadow-md'
          }`}
        >
          Everything
        </button>
        {categories?.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.name)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 transform outline-none ${
              activeCategory === cat.name 
                ? 'bg-[color:var(--accent)] text-white shadow-lg scale-105' 
                : 'bg-white text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-alt)] border border-[color:var(--border)] hover:shadow-md'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 rounded-full border-t-4 border-[color:var(--accent)] animate-spin"></div>
            <p className="mt-4 text-[color:var(--accent)] font-semibold">Loading delicacies...</p>
          </div>
        </div>
      ) : (
        <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <article 
              key={item.id} 
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
            >
              <div className="aspect-[4/3] w-full overflow-hidden relative bg-gray-100">
                {item.imageUrl && !imgErrors[item.id] ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    onError={() => setImgErrors(prev => ({ ...prev, [item.id]: true }))}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center p-6 text-center" style={{background: 'var(--primary-light)'}}>
                    <span className="text-4xl text-white drop-shadow-sm font-bold opacity-30 whitespace-nowrap overflow-hidden">
                      {item.category?.name || 'Dish'}
                    </span>
                  </div>
                )}
                
                {/* Overlapping Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm max-w-[120px] truncate">
                    {item.category?.name || 'Dish'}
                  </span>
                </div>
                {item.special && (
                  <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md shadow-orange-500/30 animate-pulse">
                    Chef's Special
                  </div>
                )}
              </div>

              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[color:var(--text-primary)] group-hover:text-[color:var(--accent)] transition-colors">
                    {item.name}
                  </h3>
                  <p className="mt-2 text-sm text-[color:var(--text-secondary)] line-clamp-3">
                    {item.description}
                  </p>
                </div>
                
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-2xl font-black text-[color:var(--primary)]">
                    ${item.price.toFixed(2)}
                  </p>
                  
                  {/* Decorative button/icon indicating interactivity */}
                  <div className="h-10 w-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundColor: 'var(--accent)', color: 'white' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </article>
          ))}
          
          {filteredItems.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-gray-300">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No items available</h3>
              <p className="mt-1 text-sm text-gray-500">We're updating our menu. Check back soon!</p>
            </div>
          )}
        </section>
      )}
    </DashboardShell>
  );
}

export default CustomerMenuPage;
