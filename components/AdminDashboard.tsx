
import React, { useState, useRef, useEffect } from 'react';
import { 
  Role, Product, Order, Repair, ShopProfile, 
  OrderStatus, RepairStatus, Category, PaymentMethod, SaleType 
} from '../types';
import { 
  LayoutDashboard, Package, ShoppingBag, Wrench, Settings, 
  LogOut, Plus, Trash2, Edit, TrendingUp, AlertTriangle, 
  Search, BarChart3, Bell, Download, Upload, CheckCircle2, Clock, Smartphone, User, DollarSign, Tag, Percent, Store, MousePointer2, PencilLine
} from 'lucide-react';

interface Props {
  store: any;
  onUpdateStore: (updater: any) => void;
  onLogout: () => void;
}

const AdminDashboard: React.FC<Props> = ({ store, onUpdateStore, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dash' | 'products' | 'orders' | 'repairs' | 'reports' | 'profile' | 'sale'>('dash');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddRepair, setShowAddRepair] = useState(false);
  const [showInStoreSaleModal, setShowInStoreSaleModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingRepair, setEditingRepair] = useState<Repair | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // In-Store Sale Form state
  const [posMode, setPosMode] = useState<'inventory' | 'custom'>('inventory');
  const [posProduct, setPosProduct] = useState<string>('');
  const [posQty, setPosQty] = useState<number>(1);
  const [posCustomer, setPosCustomer] = useState<string>('Guest Customer');
  const [posMobile, setPosMobile] = useState<string>('');
  const [posCustomName, setPosCustomName] = useState<string>('');
  const [posCustomPrice, setPosCustomPrice] = useState<number>(0);

  // Form refs for Product modal
  const nRef = useRef<HTMLInputElement>(null);
  const cRef = useRef<HTMLSelectElement>(null);
  const bRef = useRef<HTMLInputElement>(null);
  const sRef = useRef<HTMLInputElement>(null);
  const qRef = useRef<HTMLInputElement>(null);

  // Form refs for Repair modal
  const rCustNameRef = useRef<HTMLInputElement>(null);
  const rMobileRef = useRef<HTMLInputElement>(null);
  const rDeviceRef = useRef<HTMLInputElement>(null);
  const rProblemRef = useRef<HTMLInputElement>(null);
  const rChargesRef = useRef<HTMLInputElement>(null);
  const rKharchaRef = useRef<HTMLInputElement>(null);

  // Calculate statistics for the dashboard
  const stats = {
    totalSales: store.orders.reduce((acc: number, o: Order) => acc + (o.status === OrderStatus.DELIVERED || o.saleType === SaleType.IN_STORE ? o.total : 0), 0) + 
                store.repairs.reduce((acc: number, r: Repair) => acc + (r.status === RepairStatus.DELIVERED ? r.estimatedCharges : 0), 0),
    onlineRevenue: store.orders.reduce((acc: number, o: Order) => acc + (o.saleType === SaleType.ONLINE && o.status === OrderStatus.DELIVERED ? o.total : 0), 0),
    inStoreRevenue: store.orders.reduce((acc: number, o: Order) => acc + (o.saleType === SaleType.IN_STORE ? o.total : 0), 0),
    pendingOrders: store.orders.filter((o: Order) => o.status === OrderStatus.PENDING).length,
    activeRepairs: store.repairs.filter((r: Repair) => r.status !== RepairStatus.DELIVERED).length,
    lowStock: store.products.filter((p: Product) => p.stock < 5).length,
    totalCost: store.orders.reduce((acc: number, o: Order) => {
      if (o.status === OrderStatus.DELIVERED || o.saleType === SaleType.IN_STORE) {
        const orderCost = o.items.reduce((itemAcc, item) => {
          const product = store.products.find((p: Product) => p.id === item.productId);
          return itemAcc + ((product?.buyPrice || 0) * item.quantity);
        }, 0);
        return acc + orderCost;
      }
      return acc;
    }, 0) + store.repairs.reduce((acc: number, r: Repair) => acc + (r.cost || 0), 0),
  };

  const notifications = [
    ...store.products.filter((p: Product) => p.stock < 5).map((p: Product) => ({ id: `s-${p.id}`, type: 'stock', text: `Low stock alert: ${p.name} (${p.stock} left)` })),
    ...store.orders.filter((o: Order) => o.status === OrderStatus.PENDING).map((o: Order) => ({ id: `o-${o.id}`, type: 'order', text: `New order from ${o.customerName} for Rs. ${o.total}` }))
  ];

  const handleBackup = () => {
    const dataStr = JSON.stringify(store, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `paktech_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        onUpdateStore(() => json);
        alert("Backup restored successfully!");
      } catch (err) {
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  };

  const deleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      onUpdateStore((prev: any) => ({ ...prev, products: prev.products.filter((p: Product) => p.id !== id) }));
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowAddProduct(true);
  };

  const saveProduct = () => {
    const n = nRef.current?.value || '';
    const c = cRef.current?.value as Category;
    const b = Number(bRef.current?.value || 0);
    const s = Number(sRef.current?.value || 0);
    const q = Number(qRef.current?.value || 0);

    if (!n) return alert('Product name is required');

    onUpdateStore((prev: any) => {
      let updatedProducts = [...prev.products];
      if (editingProduct) {
        updatedProducts = updatedProducts.map(p => 
          p.id === editingProduct.id 
            ? { ...p, name: n, category: c, buyPrice: b, sellPrice: s, stock: q } 
            : p
        );
      } else {
        const newProduct: Product = {
          id: `PRD-${Date.now()}`,
          name: n,
          category: c,
          buyPrice: b,
          sellPrice: s,
          stock: q,
          image: `https://picsum.photos/seed/${n}/200`,
          isAvailable: true,
          warranty: '1 Year',
          description: ''
        };
        updatedProducts = [newProduct, ...updatedProducts];
      }
      return { ...prev, products: updatedProducts };
    });

    closeProductModal();
  };

  const closeProductModal = () => {
    setShowAddProduct(false);
    setEditingProduct(null);
  };

  const closeRepairModal = () => {
    setShowAddRepair(false);
    setEditingRepair(null);
  };

  const saveRepair = () => {
    const custName = rCustNameRef.current?.value || '';
    const mobile = rMobileRef.current?.value || '';
    const device = rDeviceRef.current?.value || '';
    const problem = rProblemRef.current?.value || '';
    const charges = Number(rChargesRef.current?.value || 0);
    const cost = Number(rKharchaRef.current?.value || 0);

    if (!custName || !mobile) return alert('Customer name and mobile are required');

    onUpdateStore((prev: any) => {
      let updatedRepairs = [...prev.repairs];
      if (editingRepair) {
        updatedRepairs = updatedRepairs.map(r => 
          r.id === editingRepair.id 
            ? { ...r, customerName: custName, mobile, deviceType: device, problem, estimatedCharges: charges, cost } 
            : r
        );
      } else {
        const newRepair: Repair = {
          id: `REP-${Date.now()}`,
          customerName: custName,
          mobile,
          deviceType: device,
          problem,
          estimatedCharges: charges,
          cost,
          status: RepairStatus.PENDING,
          deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          entryDate: new Date().toLocaleDateString()
        };
        updatedRepairs = [newRepair, ...updatedRepairs];
      }
      return { ...prev, repairs: updatedRepairs };
    });

    closeRepairModal();
  };

  const handleInStoreSale = () => {
    let saleItemName = '';
    let saleItemPrice = 0;
    let saleItemId = '';

    if (posMode === 'inventory') {
      if (!posProduct) return alert('Please select a product');
      const product = store.products.find((p: Product) => p.id === posProduct);
      if (!product) return;
      if (product.stock < posQty) return alert('Not enough stock available!');
      
      saleItemName = product.name;
      saleItemPrice = product.sellPrice;
      saleItemId = product.id;
    } else {
      if (!posCustomName || posCustomPrice <= 0) return alert('Please enter item name and price');
      saleItemName = posCustomName;
      saleItemPrice = posCustomPrice;
      saleItemId = `CUSTOM-${Date.now()}`;
    }

    const newOrder: Order = {
      id: `DUKAN-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      customerId: 'walk-in',
      customerName: posCustomer,
      customerMobile: posMobile,
      items: [{ productId: saleItemId, name: saleItemName, price: saleItemPrice, quantity: posQty }],
      total: saleItemPrice * posQty,
      status: OrderStatus.DELIVERED,
      paymentMethod: PaymentMethod.CASH,
      address: 'In-Shop Purchase',
      date: new Date().toLocaleDateString(),
      saleType: SaleType.IN_STORE
    };

    onUpdateStore((prev: any) => {
      const updatedOrders = [newOrder, ...prev.orders];
      const updatedProducts = prev.products.map((p: Product) => 
        (posMode === 'inventory' && p.id === saleItemId) ? { ...p, stock: p.stock - posQty } : p
      );
      return { ...prev, orders: updatedOrders, products: updatedProducts };
    });

    setShowInStoreSaleModal(false);
    resetPosForm();
    alert('Dukan Sale recorded successfully!');
  };

  const resetPosForm = () => {
    setPosProduct('');
    setPosQty(1);
    setPosCustomer('Guest Customer');
    setPosMobile('');
    setPosCustomName('');
    setPosCustomPrice(0);
    setPosMode('inventory');
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    onUpdateStore((prev: any) => ({ ...prev, orders: prev.orders.map((o: Order) => o.id === id ? { ...o, status } : o) }));
  };

  const updateRepairStatus = (id: string, status: RepairStatus) => {
    onUpdateStore((prev: any) => ({ ...prev, repairs: prev.repairs.map((r: Repair) => r.id === id ? { ...r, status } : r) }));
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100">
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col z-20">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-blue-400">PakTech</h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Admin</p>
          </div>
          <div className="relative group cursor-pointer">
            <Bell size={20} className={notifications.length > 0 ? 'text-orange-400 animate-pulse' : 'text-slate-500'} />
            <div className="absolute left-full top-0 ml-4 w-64 bg-white text-slate-900 rounded-xl shadow-2xl p-4 hidden group-hover:block z-50 border border-slate-200">
              <h4 className="font-bold text-xs mb-2 uppercase text-slate-400">Notifications</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? <p className="text-xs">No alerts</p> : notifications.map(n => (
                  <div key={n.id} className="text-[10px] p-2 bg-slate-50 rounded-lg border">{n.text}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavItem active={activeTab === 'dash'} onClick={() => setActiveTab('dash')} icon={<LayoutDashboard size={18}/>} label="Dashboard" />
          <NavItem active={activeTab === 'sale'} onClick={() => setActiveTab('sale')} icon={<Store size={18}/>} label="Dukan Sale" />
          <NavItem active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<Package size={18}/>} label="Inventory" />
          <NavItem active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<ShoppingBag size={18}/>} label="App Orders" />
          <NavItem active={activeTab === 'repairs'} onClick={() => setActiveTab('repairs')} icon={<Wrench size={18}/>} label="Repairs" />
          <NavItem active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<BarChart3 size={18}/>} label="Reports" />
          <NavItem active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<Settings size={18}/>} label="Settings" />
        </nav>
        <button onClick={onLogout} className="p-6 border-t border-slate-800 flex items-center gap-2 text-slate-400 hover:text-white">
          <LogOut size={18} /> Logout
        </button>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {activeTab === 'dash' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold">Market Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="In-Store (Dukan)" value={`Rs. ${stats.inStoreRevenue.toLocaleString()}`} icon={<Store className="text-blue-500" />} />
              <StatCard label="Online (App)" value={`Rs. ${stats.onlineRevenue.toLocaleString()}`} icon={<Smartphone className="text-emerald-500" />} />
              <StatCard label="Active Repairs" value={stats.activeRepairs} icon={<Wrench className="text-orange-500" />} />
              <StatCard label="Low Stock" value={stats.lowStock} icon={<AlertTriangle className="text-red-500" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-2xl border">
                <h3 className="font-bold mb-4">Recent Shop Sales</h3>
                <div className="space-y-3">
                  {store.orders.filter((o: Order) => o.saleType === SaleType.IN_STORE).slice(0, 5).map((o: Order) => (
                    <div key={o.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-bold text-sm">{o.items[0].name}</p>
                        <p className="text-[10px] text-slate-400">Qty: {o.items[0].quantity} • {o.customerName}</p>
                      </div>
                      <span className="font-black text-blue-600">Rs. {o.total.toLocaleString()}</span>
                    </div>
                  ))}
                  {store.orders.filter((o: Order) => o.saleType === SaleType.IN_STORE).length === 0 && <p className="text-xs text-slate-400 italic">No in-store sales recorded yet.</p>}
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border">
                <h3 className="font-bold mb-4">Recent Online Orders</h3>
                <div className="space-y-3">
                  {store.orders.filter((o: Order) => o.saleType === SaleType.ONLINE).slice(0, 5).map((o: Order) => (
                    <div key={o.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-bold text-sm">{o.customerName}</p>
                        <p className="text-[10px] text-slate-400">{o.customerMobile}</p>
                      </div>
                      <span className={`text-[8px] px-2 py-1 rounded-full uppercase font-bold ${getStatusColor(o.status)}`}>{o.status}</span>
                    </div>
                  ))}
                  {store.orders.filter((o: Order) => o.saleType === SaleType.ONLINE).length === 0 && <p className="text-xs text-slate-400 italic">No app orders yet.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sale' && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
             <div className="flex justify-between items-center bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-100">
               <div>
                  <h2 className="text-3xl font-black tracking-tight">Dukan Sales Center</h2>
                  <p className="text-blue-100 font-bold mt-1 uppercase tracking-widest text-[10px]">Manage In-Store (Physical) Purchases</p>
               </div>
               <button 
                onClick={() => setShowInStoreSaleModal(true)}
                className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg hover:bg-blue-50 transition-all active:scale-95"
               >
                 <Plus size={18} /> New Dukan Sale
               </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard label="Today's Shop Cash" value={`Rs. ${store.orders.filter((o:Order) => o.saleType === SaleType.IN_STORE && o.date === new Date().toLocaleDateString()).reduce((acc:any, o:any) => acc + o.total, 0).toLocaleString()}`} icon={<DollarSign className="text-blue-600"/>} />
                <StatCard label="Items Sold In-Store" value={store.orders.filter((o:Order) => o.saleType === SaleType.IN_STORE).reduce((acc:any, o:any) => acc + o.items[0].quantity, 0)} icon={<Package className="text-blue-600"/>} />
                <StatCard label="Walk-in Customers" value={store.orders.filter((o:Order) => o.saleType === SaleType.IN_STORE).length} icon={<User className="text-blue-600"/>} />
             </div>

             <div className="bg-white rounded-3xl border overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center">
                   <h3 className="font-black text-slate-900">Recent Shop Transactions</h3>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase">
                        <tr>
                          <th className="px-6 py-4">Bill ID</th>
                          <th className="px-6 py-4">Product Sold</th>
                          <th className="px-6 py-4">Customer</th>
                          <th className="px-6 py-4">Total bill</th>
                          <th className="px-6 py-4">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-sm">
                        {store.orders.filter((o: Order) => o.saleType === SaleType.IN_STORE).map((o: Order) => (
                           <tr key={o.id} className="hover:bg-blue-50/20 transition-colors">
                              <td className="px-6 py-4 font-bold text-slate-500">#{o.id}</td>
                              <td className="px-6 py-4 font-bold text-slate-900">{o.items[0].name} (x{o.items[0].quantity})</td>
                              <td className="px-6 py-4 text-slate-600">{o.customerName}</td>
                              <td className="px-6 py-4 font-black text-blue-600">Rs. {o.total.toLocaleString()}</td>
                              <td className="px-6 py-4 text-xs font-bold text-slate-400">{o.date}</td>
                           </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Inventory</h2>
              <button onClick={() => setShowAddProduct(true)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-200"><Plus size={18} /> Add Item</button>
            </div>
            <div className="bg-white rounded-2xl border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
                    <tr><th className="px-6 py-4">Product</th><th className="px-6 py-4">Stock</th><th className="px-6 py-4">Price</th><th className="px-6 py-4 text-right">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {store.products.map((p: Product) => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-bold">
                           <p>{p.name}</p>
                           <p className="text-[10px] text-slate-400 uppercase tracking-widest">{p.category}</p>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-600">{p.stock} Units</td>
                        <td className="px-6 py-4 font-black text-blue-600">Rs. {p.sellPrice.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleEditProduct(p)} className="p-2 text-slate-400 hover:text-blue-600"><Edit size={16} /></button>
                            <button onClick={() => deleteProduct(p.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">App Orders Management</h2>
            <div className="bg-white rounded-2xl border overflow-hidden">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
                    <tr><th className="px-6 py-4">Order ID</th><th className="px-6 py-4">Customer Details</th><th className="px-6 py-4">Items Ordered</th><th className="px-6 py-4">Total Bill</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Update</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {store.orders.filter((o:Order) => o.saleType === SaleType.ONLINE).map((o: Order) => (
                      <tr key={o.id}>
                        <td className="px-6 py-4 font-bold text-xs">#{o.id}</td>
                        <td className="px-6 py-4">
                           <p className="font-bold">{o.customerName}</p>
                           <p className="text-xs text-blue-600 font-bold mt-0.5">{o.customerMobile}</p>
                        </td>
                        <td className="px-6 py-4">
                           <div className="max-w-xs truncate text-[10px] font-medium text-slate-500 uppercase">
                             {o.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                           </div>
                        </td>
                        <td className="px-6 py-4 font-black text-slate-900">Rs. {o.total.toLocaleString()}</td>
                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getStatusColor(o.status)}`}>{o.status}</span></td>
                        <td className="px-6 py-4 text-right">
                          <select className="border-2 border-slate-100 rounded-xl p-2 text-xs font-bold bg-white" value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}>
                            {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {activeTab === 'repairs' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Repair Tickets</h2>
                <button 
                  onClick={() => setShowAddRepair(true)}
                  className="bg-orange-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-orange-100">
                    <Plus size={18} /> New Entry
                </button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {store.repairs.map((r: Repair) => (
                  <div key={r.id} className="bg-white p-6 rounded-3xl border shadow-sm flex flex-col relative group">
                    <div className="flex justify-between items-start mb-4 pr-16">
                      <h3 className="font-bold">{r.deviceType}</h3>
                      <span className={`text-[8px] font-black uppercase px-2 py-1 rounded ${getRepairStatusColor(r.status)}`}>{r.status}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">{r.problem}</p>
                    <div className="space-y-2 text-[10px] uppercase font-bold text-slate-400 border-t pt-4 mt-auto">
                      <div className="flex justify-between"><span>Customer</span><span className="text-slate-900">{r.customerName}</span></div>
                      <div className="flex justify-between"><span>Bill</span><span className="text-blue-600">Rs. {r.estimatedCharges.toLocaleString()}</span></div>
                    </div>
                    <select className="mt-4 w-full border rounded-xl p-2 text-xs font-bold" value={r.status} onChange={(e) => updateRepairStatus(r.id, e.target.value as RepairStatus)}>
                       {Object.values(RepairStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-bold">Financial Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-600 text-white p-8 rounded-[2rem] shadow-xl shadow-blue-100">
                <p className="text-xs uppercase font-bold text-blue-200">Total Sales (Orders + Repairs)</p>
                <h3 className="text-3xl font-black mt-2">Rs. {stats.totalSales.toLocaleString()}</h3>
              </div>
              <div className="bg-slate-900 text-white p-8 rounded-[2rem]">
                <p className="text-xs uppercase font-bold text-slate-400">Total Expenses (Cost + Kharcha)</p>
                <h3 className="text-3xl font-black mt-2 text-red-400">Rs. {stats.totalCost.toLocaleString()}</h3>
              </div>
              <div className="bg-white text-slate-900 border-2 border-slate-900 p-8 rounded-[2rem]">
                <p className="text-xs uppercase font-bold text-slate-500">Net Profit</p>
                <h3 className="text-3xl font-black mt-2 text-green-600">Rs. {(stats.totalSales - stats.totalCost).toLocaleString()}</h3>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl border">
              <h4 className="font-bold mb-6">Inventory Value</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Object.values(Category).map(cat => {
                  const value = store.products.filter((p: Product) => p.category === cat).reduce((acc: number, p: Product) => acc + (p.buyPrice * p.stock), 0);
                  return (
                    <div key={cat} className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] uppercase font-bold text-slate-400">{cat}</p>
                      <p className="font-black text-slate-900">Rs. {value.toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-8">
            <h2 className="text-2xl font-bold">Shop Profile</h2>
            <div className="space-y-4">
               <ProfileField label="Shop Name" value={store.shop.name} />
               <ProfileField label="Address" value={store.shop.address} />
            </div>
            <div className="pt-8 border-t space-y-4">
              <h3 className="font-bold flex items-center gap-2"><Download size={20}/> Data Tools</h3>
              <div className="flex gap-4">
                <button onClick={handleBackup} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold">Download Backup</button>
                <button onClick={() => fileInputRef.current?.click()} className="flex-1 border-2 py-4 rounded-2xl font-bold hover:bg-slate-50">Upload / Restore</button>
                <input type="file" ref={fileInputRef} onChange={handleRestore} className="hidden" accept=".json" />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* In-Store Sale Modal (Dukan Sales) */}
      {showInStoreSaleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full animate-in zoom-in-95 shadow-2xl">
            <h2 className="text-xl font-bold mb-6">Record Dukan Sale</h2>
            
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
              <button 
                onClick={() => setPosMode('inventory')}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${posMode === 'inventory' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <MousePointer2 size={14} /> Shop Inventory
              </button>
              <button 
                onClick={() => setPosMode('custom')}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${posMode === 'custom' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <PencilLine size={14} /> Custom Entry
              </button>
            </div>

            <div className="space-y-4">
              {posMode === 'inventory' ? (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Select Product</label>
                  <select 
                    className="w-full border p-3 rounded-xl bg-slate-50 outline-none focus:ring-2 ring-blue-500 font-bold"
                    value={posProduct}
                    onChange={(e) => setPosProduct(e.target.value)}
                  >
                    <option value="">Choose a Product...</option>
                    {store.products.filter((p:Product) => p.stock > 0).map((p: Product) => (
                      <option key={p.id} value={p.id}>{p.name} (Rs. {p.sellPrice})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Item Name</label>
                    <input 
                      type="text"
                      className="w-full border p-3 rounded-xl bg-slate-50 outline-none focus:ring-2 ring-blue-500 font-bold"
                      placeholder="e.g. Memory Card / USB Box"
                      value={posCustomName}
                      onChange={(e) => setPosCustomName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Sale Price (Rs)</label>
                    <input 
                      type="number"
                      className="w-full border p-3 rounded-xl bg-slate-50 outline-none focus:ring-2 ring-blue-500 font-bold"
                      placeholder="Rs."
                      value={posCustomPrice || ''}
                      onChange={(e) => setPosCustomPrice(Number(e.target.value))}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Quantity</label>
                  <input 
                    type="number" min="1"
                    className="w-full border p-3 rounded-xl bg-slate-50 outline-none focus:ring-2 ring-blue-500 font-bold"
                    value={posQty}
                    onChange={(e) => setPosQty(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Sub-Total</label>
                  <div className="w-full border p-3 rounded-xl bg-slate-100 text-slate-400 font-bold">
                    {posMode === 'inventory' 
                      ? (posProduct ? (store.products.find((p:any) => p.id === posProduct)?.sellPrice * posQty).toLocaleString() : '0')
                      : (posCustomPrice * posQty).toLocaleString()
                    }
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Customer Name (Optional)</label>
                <input 
                  type="text"
                  className="w-full border p-3 rounded-xl bg-slate-50 outline-none focus:ring-2 ring-blue-500 font-bold"
                  placeholder="e.g. Ahmad Ali"
                  value={posCustomer}
                  onChange={(e) => setPosCustomer(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowInStoreSaleModal(false)} className="flex-1 border py-3 rounded-xl font-bold">Cancel</button>
                <button onClick={handleInStoreSale} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-100">Record Sale</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full animate-in zoom-in-95 shadow-2xl">
            <h2 className="text-xl font-bold mb-6">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Product Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Dell Monitor 24\" 
                  className="w-full border p-3 rounded-xl outline-none focus:ring-2 ring-blue-500 bg-slate-50" 
                  ref={nRef}
                  defaultValue={editingProduct?.name || ''}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Category</label>
                <select 
                  className="w-full border p-3 rounded-xl outline-none focus:ring-2 ring-blue-500 bg-slate-50" 
                  ref={cRef}
                  defaultValue={editingProduct?.category || Category.LAPTOP}
                >
                  {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Buy Price (Rs)</label>
                  <input 
                    type="number" 
                    placeholder="Buy Price" 
                    className="w-full border p-3 rounded-xl outline-none focus:ring-2 ring-blue-500 bg-slate-50" 
                    ref={bRef}
                    defaultValue={editingProduct?.buyPrice || ''}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Sell Price (Rs)</label>
                  <input 
                    type="number" 
                    placeholder="Sell Price" 
                    className="w-full border p-3 rounded-xl outline-none focus:ring-2 ring-blue-500 bg-slate-50" 
                    ref={sRef}
                    defaultValue={editingProduct?.sellPrice || ''}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Stock Quantity</label>
                <input 
                  type="number" 
                  placeholder="Stock" 
                  className="w-full border p-3 rounded-xl outline-none focus:ring-2 ring-blue-500 bg-slate-50" 
                  ref={qRef}
                  defaultValue={editingProduct?.stock || ''}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={closeProductModal} className="flex-1 border py-3 rounded-xl font-bold hover:bg-slate-50">Cancel</button>
                <button 
                  onClick={saveProduct}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100"
                >
                  {editingProduct ? 'Save Changes' : 'Add to Shop'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Repair Modal */}
      {showAddRepair && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full animate-in zoom-in-95 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                <Wrench size={24} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">{editingRepair ? 'Edit Repair' : 'New Repair Entry'}</h2>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1 flex items-center gap-1.5"><User size={12}/> Customer Name</label>
                <input type="text" ref={rCustNameRef} defaultValue={editingRepair?.customerName || ''} placeholder="e.g. Ahmad Khan" className="w-full border-2 border-slate-50 p-4 rounded-2xl bg-slate-50 outline-none focus:bg-white focus:border-orange-500 transition-all font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1 flex items-center gap-1.5"><Smartphone size={12}/> Phone Number</label>
                <input type="tel" ref={rMobileRef} defaultValue={editingRepair?.mobile || ''} placeholder="03xx-xxxxxxx" className="w-full border-2 border-slate-50 p-4 rounded-2xl bg-slate-50 outline-none focus:bg-white focus:border-orange-500 transition-all font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1 flex items-center gap-1.5"><Package size={12}/> Repairing Thing (Device)</label>
                <input type="text" ref={rDeviceRef} defaultValue={editingRepair?.deviceType || ''} placeholder="e.g. HP Laptop / Samsung Phone" className="w-full border-2 border-slate-50 p-4 rounded-2xl bg-slate-50 outline-none focus:bg-white focus:border-orange-500 transition-all font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Problem Description</label>
                <input type="text" ref={rProblemRef} defaultValue={editingRepair?.problem || ''} placeholder="e.g. Screen replacement / Slow" className="w-full border-2 border-slate-50 p-4 rounded-2xl bg-slate-50 outline-none focus:bg-white focus:border-orange-500 transition-all font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1 flex items-center gap-1.5"><DollarSign size={12}/> My Bill (Charge)</label>
                  <input type="number" ref={rChargesRef} defaultValue={editingRepair?.estimatedCharges || ''} placeholder="Rs." className="w-full border-2 border-slate-50 p-4 rounded-2xl bg-slate-50 outline-none focus:bg-white focus:border-orange-500 transition-all font-bold text-blue-600" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1 flex items-center gap-1.5"><DollarSign size={12}/> My Kharcha (Cost)</label>
                  <input type="number" ref={rKharchaRef} defaultValue={editingRepair?.cost || ''} placeholder="Rs." className="w-full border-2 border-slate-50 p-4 rounded-2xl bg-slate-50 outline-none focus:bg-white focus:border-orange-500 transition-all font-bold text-red-500" />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={closeRepairModal} className="flex-1 py-4 rounded-2xl font-black text-slate-400 border-2 border-slate-100 hover:bg-slate-50 transition-all">Cancel</button>
                <button onClick={saveRepair} className="flex-1 bg-orange-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-orange-100 hover:bg-orange-700 transition-all flex items-center justify-center gap-2">
                  <CheckCircle2 size={20} /> {editingRepair ? 'Save Changes' : 'Add Entry'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
    {icon} <span className="font-bold text-sm">{label}</span>
  </button>
);

const StatCard = ({ label, value, icon }: any) => (
  <div className="bg-white p-6 rounded-3xl border shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">{icon}</div>
    <div>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{label}</p>
      <p className="text-xl font-black">{value}</p>
    </div>
  </div>
);

const ProfileField = ({ label, value }: any) => (
  <div className="space-y-1">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input type="text" defaultValue={value} className="w-full border p-4 rounded-2xl bg-slate-50 font-bold outline-none focus:bg-white focus:border-blue-600" />
  </div>
);

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.DELIVERED: return 'bg-green-100 text-green-700';
    case OrderStatus.PENDING: return 'bg-yellow-100 text-yellow-700';
    case OrderStatus.CONFIRMED: return 'bg-blue-100 text-blue-700';
    default: return 'bg-slate-100 text-slate-600';
  }
};

const getRepairStatusColor = (status: RepairStatus) => {
  switch (status) {
    case RepairStatus.COMPLETED: return 'bg-blue-100 text-blue-700';
    case RepairStatus.DELIVERED: return 'bg-green-100 text-green-700';
    default: return 'bg-orange-100 text-orange-700';
  }
};

export default AdminDashboard;
