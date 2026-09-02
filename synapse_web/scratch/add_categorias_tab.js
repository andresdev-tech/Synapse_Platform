const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/AdminDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const categoriasView = `      {activeTab === "categorias" ? (
        <div className="bg-white p-8 rounded-3xl shadow-lg shadow-indigo-100/50 border border-slate-100">
          <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Administrar Categorías</h2>
              <p className="text-slate-500 mt-1">Crea nuevas categorías para organizar los anuncios y recursos del portal.</p>
            </div>
          </div>
          
          <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Añadir nueva categoría</h3>
            <div className="flex gap-4">
              <input 
                type="text" 
                id="newCategoryName"
                placeholder="Ej. Bienestar, Eventos, Académico..." 
                className="flex-1 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
              <button 
                onClick={async () => {
                  const input = document.getElementById('newCategoryName') as HTMLInputElement;
                  if (!input || !input.value.trim()) return;
                  try {
                    await fetch('/api/categories', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name: input.value.trim() })
                    });
                    input.value = '';
                    fetchCategories();
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Crear Categoría
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Categorías existentes ({categories.length})</h3>
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-shadow group">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center mr-4">
                    <Tag className="w-5 h-5 text-indigo-500" />
                  </div>
                  <span className="font-bold text-slate-700">{cat.name}</span>
                </div>
                <button 
                  onClick={async () => {
                    if(!confirm('¿Eliminar esta categoría? Se desvinculará de los anuncios que la tengan.')) return;
                    await fetch('/api/categories/' + cat.id, { method: 'DELETE' });
                    fetchCategories();
                  }}
                  className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Eliminar categoría"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === "sugerencias" ? (`;

content = content.replace('{activeTab === "sugerencias" ? (', categoriasView);
fs.writeFileSync(filePath, content);
