import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

export const MenuManagement = () => {
  // Categories
  const [categories, setCategories] = useState([])
  const [catForm, setCatForm] = useState({ name: '', description: '' })
  const [catError, setCatError] = useState('')
  const [catEditId, setCatEditId] = useState(null)

  // Groups
  const [groups, setGroups] = useState([])
  const [groupForm, setGroupForm] = useState({ name: '', description: '' })
  const [groupError, setGroupError] = useState('')
  const [groupEditId, setGroupEditId] = useState(null)

  // Items
  const [items, setItems] = useState([])
  const [itemForm, setItemForm] = useState({ name: '', price: '', categoryId: '', groupId: '', description: '', active: true })
  const [itemError, setItemError] = useState('')
  const [itemEditId, setItemEditId] = useState(null)

  useEffect(() => {
    fetchCategories()
    fetchGroups()
    fetchItems()
  }, [])

  // --- Category CRUD ---
  const fetchCategories = async () => {
    const { data } = await supabase.from('menu_categories').select('*').order('name')
    setCategories(data || [])
  }
  const handleCatSubmit = async (e) => {
    e.preventDefault()
    setCatError('')
    if (!catForm.name) { setCatError('Name required'); return }
    if (catEditId) {
      await supabase.from('menu_categories').update({ name: catForm.name, description: catForm.description }).eq('id', catEditId)
    } else {
      await supabase.from('menu_categories').insert({ name: catForm.name, description: catForm.description })
    }
    setCatForm({ name: '', description: '' }); setCatEditId(null); fetchCategories()
  }
  const handleCatEdit = (cat) => { setCatForm({ name: cat.name, description: cat.description }); setCatEditId(cat.id) }
  const handleCatDelete = async (id) => { await supabase.from('menu_categories').delete().eq('id', id); fetchCategories() }

  // --- Group CRUD ---
  const fetchGroups = async () => {
    const { data } = await supabase.from('menu_groups').select('*').order('name')
    setGroups(data || [])
  }
  const handleGroupSubmit = async (e) => {
    e.preventDefault()
    setGroupError('')
    if (!groupForm.name) { setGroupError('Name required'); return }
    if (groupEditId) {
      await supabase.from('menu_groups').update({ name: groupForm.name, description: groupForm.description }).eq('id', groupEditId)
    } else {
      await supabase.from('menu_groups').insert({ name: groupForm.name, description: groupForm.description })
    }
    setGroupForm({ name: '', description: '' }); setGroupEditId(null); fetchGroups()
  }
  const handleGroupEdit = (group) => { setGroupForm({ name: group.name, description: group.description }); setGroupEditId(group.id) }
  const handleGroupDelete = async (id) => { await supabase.from('menu_groups').delete().eq('id', id); fetchGroups() }

  // --- Item CRUD ---
  const fetchItems = async () => {
    const { data } = await supabase.from('menu_items').select('*').order('name')
    setItems(data || [])
  }
  const handleItemSubmit = async (e) => {
    e.preventDefault()
    setItemError('')
    if (!itemForm.name || !itemForm.price || !itemForm.categoryId) { setItemError('Name, price, and category required'); return }
    const payload = {
      name: itemForm.name,
      price: parseFloat(itemForm.price),
      category_id: itemForm.categoryId,
      group_id: itemForm.groupId || null,
      description: itemForm.description,
      active: itemForm.active
    }
    if (itemEditId) {
      await supabase.from('menu_items').update(payload).eq('id', itemEditId)
    } else {
      await supabase.from('menu_items').insert(payload)
    }
    setItemForm({ name: '', price: '', categoryId: '', groupId: '', description: '', active: true }); setItemEditId(null); fetchItems()
  }
  const handleItemEdit = (item) => {
    setItemForm({
      name: item.name,
      price: item.price,
      categoryId: item.category_id,
      groupId: item.group_id,
      description: item.description,
      active: item.active
    });
    setItemEditId(item.id)
  }
  const handleItemDelete = async (id) => { await supabase.from('menu_items').delete().eq('id', id); fetchItems() }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Menu Management</h1>
      {/* Categories */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Categories</h2>
        <form onSubmit={handleCatSubmit} className="flex gap-2 mb-2">
          <input type="text" placeholder="Name" value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} className="p-2 border rounded" />
          <input type="text" placeholder="Description" value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} className="p-2 border rounded" />
          <button className="btn-primary">{catEditId ? 'Update' : 'Add'}</button>
          {catEditId && <button type="button" className="btn-secondary" onClick={() => { setCatForm({ name: '', description: '' }); setCatEditId(null) }}>Cancel</button>}
          {catError && <span className="text-red-600 ml-2">{catError}</span>}
        </form>
        <ul>
          {categories.map(cat => (
            <li key={cat.id} className="flex gap-2 items-center mb-1">
              <span className="font-medium">{cat.name}</span>
              <span className="text-gray-500 text-sm">{cat.description}</span>
              <button className="btn-secondary" onClick={() => handleCatEdit(cat)}>Edit</button>
              <button className="btn-danger" onClick={() => handleCatDelete(cat.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
      {/* Groups */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Groups</h2>
        <form onSubmit={handleGroupSubmit} className="flex gap-2 mb-2">
          <input type="text" placeholder="Name" value={groupForm.name} onChange={e => setGroupForm(f => ({ ...f, name: e.target.value }))} className="p-2 border rounded" />
          <input type="text" placeholder="Description" value={groupForm.description} onChange={e => setGroupForm(f => ({ ...f, description: e.target.value }))} className="p-2 border rounded" />
          <button className="btn-primary">{groupEditId ? 'Update' : 'Add'}</button>
          {groupEditId && <button type="button" className="btn-secondary" onClick={() => { setGroupForm({ name: '', description: '' }); setGroupEditId(null) }}>Cancel</button>}
          {groupError && <span className="text-red-600 ml-2">{groupError}</span>}
        </form>
        <ul>
          {groups.map(group => (
            <li key={group.id} className="flex gap-2 items-center mb-1">
              <span className="font-medium">{group.name}</span>
              <span className="text-gray-500 text-sm">{group.description}</span>
              <button className="btn-secondary" onClick={() => handleGroupEdit(group)}>Edit</button>
              <button className="btn-danger" onClick={() => handleGroupDelete(group.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
      {/* Items */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Menu Items</h2>
        <form onSubmit={handleItemSubmit} className="flex flex-wrap gap-2 mb-2">
          <input type="text" placeholder="Name" value={itemForm.name} onChange={e => setItemForm(f => ({ ...f, name: e.target.value }))} className="p-2 border rounded" />
          <input type="number" placeholder="Price" value={itemForm.price} onChange={e => setItemForm(f => ({ ...f, price: e.target.value }))} className="p-2 border rounded" />
          <select value={itemForm.categoryId} onChange={e => setItemForm(f => ({ ...f, categoryId: e.target.value }))} className="p-2 border rounded">
            <option value="">Category</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
          <select value={itemForm.groupId} onChange={e => setItemForm(f => ({ ...f, groupId: e.target.value }))} className="p-2 border rounded">
            <option value="">Group (optional)</option>
            {groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
          </select>
          <input type="text" placeholder="Description" value={itemForm.description} onChange={e => setItemForm(f => ({ ...f, description: e.target.value }))} className="p-2 border rounded" />
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={itemForm.active} onChange={e => setItemForm(f => ({ ...f, active: e.target.checked }))} /> Active
          </label>
          <button className="btn-primary">{itemEditId ? 'Update' : 'Add'}</button>
          {itemEditId && <button type="button" className="btn-secondary" onClick={() => { setItemForm({ name: '', price: '', categoryId: '', groupId: '', description: '', active: true }); setItemEditId(null) }}>Cancel</button>}
          {itemError && <span className="text-red-600 ml-2">{itemError}</span>}
        </form>
        <ul>
          {items.map(item => (
            <li key={item.id} className="flex gap-2 items-center mb-1">
              <span className="font-medium">{item.name}</span>
              <span className="text-gray-500 text-sm">         </span>
              <span className="text-green-700 font-bold">         </span>
              <span className="text-sm">{categories.find(c => c.id === item.category_id)?.name || 'No Category'}</span>
              <span className="text-sm">{groups.find(g => g.id === item.group_id)?.name || ''}</span>
              <span className="text-sm">₹{item.price}</span>
              <span className="text-xs text-gray-500">{item.active ? 'Active' : 'Inactive'}</span>
              <button className="btn-secondary" onClick={() => handleItemEdit(item)}>Edit</button>
              <button className="btn-danger" onClick={() => handleItemDelete(item.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
} 