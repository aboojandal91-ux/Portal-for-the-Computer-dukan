
import React, { useState, useEffect } from 'react';
import { Product, Order, OrderItem, OrderStatus, Category, PaymentMethod, Repair, RepairStatus, SaleType } from '../types';
// Fixed missing Wrench import and removed redundant User import
import { 
  ShoppingBag, Search, ShoppingCart, User as UserIcon, 
  ArrowLeft, Smartphone, CheckCircle2, Clock, X, Loader2, MapPin, Info, Minus, Plus as PlusIcon, Shield, CreditCard, LogOut, PackageCheck, ListFilter, Wrench
} from 'lucide-react';

interface Props {
  store: any;
  onUpdateStore: (updater: any) => void;
  onLogout: () => void;
}

const CustomerPortal: React.FC<Props> = ({ store, onUpdateStore, onLogout }) => {
  const [activeView, setActiveView] = useState<'browse' | 'cart' | 'profile' | 'repair-check' | 'orders'>('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<{ productId: string, quantity: number }[]>([]);
  const [repairCheckId, setRepairCheckId] = useState('');
  const [foundRepair, setFoundRepair] = useState<Repair | null>(null);
  const [ordering, setOrdering] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'All'>('All');
  
  // State for checkout details
  const [checkoutForm, setCheckoutForm] = useState({
    name: store.currentUser?.name || '',
    mobile: store.currentUser?.mobile || '',
    address: store.currentUser?.address || ''
  });

  // State for product detail/sale view
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [buyQuantity, setBuyQuantity] = useState(1);

  // Sync user info if it changes (e.g. login)
  useEffect(() => {
    if (store.currentUser) {
      setCheckoutForm({
        name: store.currentUser.name || '',
        mobile: store.currentUser.mobile || '',
        address: store.currentUser.address || ''
      });
    }
  }, [store.currentUser]);

  // Updated to explicitly exclude DUKAN_SALE
  const filteredProducts = store.products.filter((p: Product) => 
    p.category !== Category.DUKAN_SALE &&
    (selectedCategory === 'All' || p.category === selectedCategory) &&
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const myOrders = store.orders.filter((o: Order) => o.saleType === SaleType.ONLINE);
  const filteredOrders = myOrders.filter((o: Order) => orderStatusFilter === 'All' || o.status === orderStatusFilter);

  const addToCart = (productId: string, quantity: number = 1, goDirectToCart: boolean = false) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item => item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { productId, quantity }];
    });
    
    setSelectedProduct(null);
    setBuyQuantity(1);
    
    if (goDirectToCart) {
      setActiveView('cart');
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const product = store.products.find((p: Product) => p.id === productId);
        const maxStock = product?.stock || 99;
        const newQty = Math.max(1, Math.min(maxStock, item.quantity + delta));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const cartTotal = cart.reduce((acc, item) => {
    const product = store.products.find((p: Product) => p.id === item.productId);
    return acc + (product ? product.sellPrice * item.quantity : 0);
  }, 0);

  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);

  const placeOrder = () => {
    if (!checkoutForm.name.trim() || !checkoutForm.mobile.trim() || !checkoutForm.address.trim()) {
      alert("Please provide your Name, Phone Number, and Address to deliver your order.");
      return;
    }

    setOrdering(true);
    setTimeout(() => {
      const newOrder: Order = {
        id: `PT-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        customerId: store.currentUser?.id || 'guest',
        customerName: checkoutForm.name,
        customerMobile: checkoutForm.mobile,
        items: cart.map(c => {
          const p = store.products.find((prod: Product) => prod.id === c.productId)!;
          return { productId: p.id, name: p.name, price: p.sellPrice, quantity: c.quantity };
        }),
        total: cartTotal,
        status: OrderStatus.PENDING,
        paymentMethod: PaymentMethod.COD,
        address: checkoutForm.address,
        date: new Date().toLocaleDateString(),
        saleType: SaleType.ONLINE
      };

      onUpdateStore((prev: any) => ({ ...prev, orders: [newOrder, ...prev.orders] }));
      setCart([]);
      setOrdering(false);
      setActiveView('orders'); // Go to orders view to see status
      alert(`Order Confirmed! Thank you ${checkoutForm.name}. We will deliver to ${checkoutForm.address} soon.`);
    }, 1500);
  };

  const checkRepair = () => {
    const repair = store.repairs.find((r: Repair) => r.id.toLowerCase().includes(repairCheckId.toLowerCase()) || r.mobile === repairCheckId);
    setFoundRepair(repair || null);
    if (!repair) alert('Repair not found. Please double check the ID or Mobile number.');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 md:pb-0">
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-40 px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            {activeView !== 'browse' && (
              <button onClick={() => setActiveView('browse')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h1 className="text-xl font-black text-blue-600 tracking-tight">PakTech Shop</h1>
              {activeView === 'browse' && <p className="text-[10px] text-slate-400 font-bold uppercase">{store.shop.address}</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
               onClick={() => setActiveView('cart')} 
               className="relative p-3 bg-slate-100 rounded-2xl hover:bg-blue-50 transition-all hover:text-blue-600 group"
               title="View Shopping Bag"
             >
              <ShoppingCart size={22} className="group-hover:scale-110 transition-transform" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black animate-bounce shadow-sm">
                  {cart.length}
                </span>
              )}
            </button>

            <button 
              onClick={onLogout} 
              className="p-3 bg-slate-100 rounded-2xl hover:bg-red-50 transition-all hover:text-red-600 text-slate-500 group" 
              title="Logout / Sign Out"
            >
              <LogOut size={22} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        {activeView === 'browse' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Search laptops, mice, or printers..." 
                  className="w-full pl-12 pr-4 py-4 bg-white rounded-3xl border border-slate-200 focus:ring-4 ring-blue-50 shadow-sm outline-none transition-all font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex overflow-x-auto gap-2 no-scrollbar py-2">
                {/* Updated to filter out Category.DUKAN_SALE */}
                {['All', ...Object.values(Category).filter(cat => cat !== Category.DUKAN_SALE)].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-6 py-3 rounded-full whitespace-nowrap font-bold text-xs uppercase tracking-widest transition-all ${
                      selectedCategory === cat ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-105' : 'bg-white border border-slate-200 text-slate-500 hover:border-blue-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((p: Product) => (
                <div 
                  key={p.id} 
                  onClick={() => setSelectedProduct(p)}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-2xl transition-all group flex flex-col hover:-translate-y-2 duration-500 cursor-pointer"
                >
                  <div className="aspect-square overflow-hidden relative">
                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.name} />
                    {p.stock < 5 && p.stock > 0 && (
                      <span className="absolute top-4 left-4 bg-orange-500 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest">Low Stock</span>
                    )}
                    {p.stock === 0 && (
                      <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center text-white font-black uppercase tracking-widest text-xs">Stock Out</div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mb-2">{p.category}</p>
                    <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 leading-tight">{p.name}</h3>
                    <div className="flex items-center justify-between mt-auto pt-4">
                      <p className="text-xl font-black text-slate-900">Rs. {p.sellPrice.toLocaleString()}</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); addToCart(p.id); }}
                        disabled={p.stock === 0}
                        className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-blue-600 disabled:opacity-20 disabled:grayscale transition-all shadow-lg active:scale-95"
                      >
                        <ShoppingCart size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedProduct && (
          <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4">
            <div className="bg-white w-full max-w-2xl rounded-t-[3rem] md:rounded-[3rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-500 max-h-[100vh] md:max-h-[95vh] flex flex-col">
              <div className="relative h-72 md:h-96 w-full shrink-0">
                <img src={selectedProduct.image} className="w-full h-full object-cover" alt={selectedProduct.name} />
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-6 right-6 p-3 bg-white/30 backdrop-blur-xl text-white rounded-2xl hover:bg-white/50 transition-all border border-white/20"
                >
                  <X size={24} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
              </div>
              
              <div className="p-8 overflow-y-auto space-y-6 flex-1">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-3 py-1.5 bg-blue-50 rounded-xl">{selectedProduct.category}</span>
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-3 py-1.5 bg-emerald-50 rounded-xl flex items-center gap-1">
                        <Shield size={10} /> {selectedProduct.warranty} Warranty
                      </span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 leading-tight">{selectedProduct.name}</h2>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-3xl font-black text-blue-600">Rs. {selectedProduct.sellPrice.toLocaleString()}</p>
                    <p className="text-[10px] font-black text-slate-300 uppercase mt-1">Direct from Shop</p>
                  </div>
                </div>

                <div className="space-y-3 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Info size={12} strokeWidth={3} /> Specifications
                  </h4>
                  <p className="text-slate-600 leading-relaxed font-semibold text-sm">
                    {selectedProduct.description || "Top-tier computing hardware from PakTech. This item is fully tested and verified by our engineering team. Includes shop warranty and technical support."}
                  </p>
                </div>

                <div className="flex items-center justify-between p-2 bg-slate-100 rounded-3xl">
                  <span className="ml-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity</span>
                  <div className="flex items-center gap-6 bg-white p-2 rounded-2xl border border-slate-200">
                    <button 
                      onClick={() => buyQuantity > 1 && setBuyQuantity(buyQuantity - 1)}
                      className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Minus size={20} strokeWidth={3} />
                    </button>
                    <span className="w-6 text-center font-black text-xl">{buyQuantity}</span>
                    <button 
                      onClick={() => buyQuantity < selectedProduct.stock && setBuyQuantity(buyQuantity + 1)}
                      className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-400 hover:text-green-500 transition-colors"
                    >
                      <PlusIcon size={20} strokeWidth={3} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-4">
                  <button 
                    onClick={() => addToCart(selectedProduct.id, buyQuantity, true)}
                    disabled={selectedProduct.stock === 0}
                    className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-blue-100 active:scale-95 disabled:opacity-50"
                  >
                    <CreditCard size={24} />
                    {selectedProduct.stock === 0 ? 'Out of Stock' : `Buy Direct Now`}
                  </button>
                  <button 
                    onClick={() => addToCart(selectedProduct.id, buyQuantity, false)}
                    disabled={selectedProduct.stock === 0}
                    className="w-full border-2 border-slate-100 text-slate-900 py-6 rounded-[2rem] font-black text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-20"
                  >
                    <ShoppingBag size={24} />
                    Add to Shop Bag
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'cart' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
            <h2 className="text-3xl font-black tracking-tight">Shopping Bag</h2>
            {cart.length === 0 ? (
              <div className="bg-white p-16 rounded-[2.5rem] text-center border-2 border-dashed border-slate-100">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag size={40} className="text-slate-200" />
                </div>
                <h3 className="text-xl font-bold mb-2">Your bag is empty</h3>
                <button onClick={() => setActiveView('browse')} className="bg-blue-600 text-white px-12 py-4 rounded-3xl font-bold shadow-xl shadow-blue-200">Start Shopping</button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-3">
                  {cart.map(item => {
                    const p = store.products.find((prod: Product) => prod.id === item.productId);
                    if (!p) return null;
                    return (
                      <div key={item.productId} className="bg-white p-4 rounded-3xl border border-slate-100 flex gap-4 items-center group">
                        <img src={p.image} className="w-20 h-20 rounded-2xl object-cover" alt="" />
                        <div className="flex-1">
                          <h4 className="font-bold text-sm text-slate-900 leading-tight">{p.name}</h4>
                          <p className="font-black text-blue-600 mt-1">Rs. {(p.sellPrice * item.quantity).toLocaleString()}</p>
                          
                          <div className="flex items-center gap-4 mt-2 bg-slate-50 w-fit p-1 rounded-xl border border-slate-100">
                            <button 
                              onClick={() => updateQuantity(item.productId, -1)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-slate-400 hover:text-red-500 transition-all active:scale-90"
                            >
                              <Minus size={14} strokeWidth={3} />
                            </button>
                            <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.productId, 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-slate-400 hover:text-green-500 transition-all active:scale-90"
                            >
                              <PlusIcon size={14} strokeWidth={3} />
                            </button>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(p.id)} className="p-3 text-slate-200 hover:text-red-500 transition-colors bg-slate-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={18} strokeWidth={3} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 space-y-8">
                  <div className="space-y-6">
                     <div className="flex items-center gap-3 text-slate-900 font-black">
                       <MapPin size={24} className="text-blue-600" />
                       <h3 className="text-xl">Delivery Details</h3>
                     </div>
                     
                     <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Order Breakdown</p>
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-bold text-slate-700">Ordering <strong>{cart.length}</strong> Products</p>
                          <p className="text-sm font-bold text-blue-700">Total Units: {totalQuantity}</p>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Full Name</label>
                          <div className="relative">
                            <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input 
                              type="text"
                              placeholder="Receiver's Name"
                              className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold"
                              value={checkoutForm.name}
                              onChange={(e) => setCheckoutForm({...checkoutForm, name: e.target.value})}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">WhatsApp / Mobile Number</label>
                          <div className="relative">
                            <Smartphone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input 
                              type="tel"
                              placeholder="03xx-xxxxxxx"
                              className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold"
                              value={checkoutForm.mobile}
                              onChange={(e) => setCheckoutForm({...checkoutForm, mobile: e.target.value})}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Delivery Address</label>
                          <div className="relative">
                            <MapPin size={18} className="absolute left-4 top-5 text-slate-300" />
                            <textarea 
                              rows={3}
                              placeholder="House #, Street, City..."
                              className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold resize-none"
                              value={checkoutForm.address}
                              onChange={(e) => setCheckoutForm({...checkoutForm, address: e.target.value})}
                            ></textarea>
                          </div>
                        </div>
                     </div>
                  </div>

                  <div className="border-t pt-8">
                    <div className="flex justify-between items-end mb-8">
                      <div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Total Amount</p>
                        <p className="text-[10px] text-slate-400">Including Delivery Charges</p>
                      </div>
                      <span className="text-4xl font-black text-slate-900">Rs. {cartTotal.toLocaleString()}</span>
                    </div>
                    <button 
                      onClick={placeOrder}
                      disabled={ordering}
                      className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100 flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
                    >
                      {ordering ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={24} />}
                      Confirm Order
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-6 font-medium">Payment Method: <strong>Cash on Delivery (COD)</strong></p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeView === 'orders' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
             <div className="flex justify-between items-end">
                <div>
                   <h2 className="text-3xl font-black tracking-tight text-slate-900">My Orders</h2>
                   <p className="text-slate-500 font-medium">Track your technology purchases</p>
                </div>
                <div className="bg-white p-2 rounded-2xl border shadow-sm flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                   <ListFilter size={14} /> Filter
                </div>
             </div>

             <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                <button 
                  onClick={() => setOrderStatusFilter('All')}
                  className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${orderStatusFilter === 'All' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-500'}`}
                >
                  All ({myOrders.length})
                </button>
                {Object.values(OrderStatus).map(status => {
                  const count = myOrders.filter((o: Order) => o.status === status).length;
                  return (
                    <button 
                      key={status}
                      onClick={() => setOrderStatusFilter(status)}
                      className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${orderStatusFilter === status ? getStatusTabColor(status) : 'bg-white border border-slate-200 text-slate-500'}`}
                    >
                      {status} ({count})
                    </button>
                  );
                })}
             </div>

             <div className="space-y-6">
                {filteredOrders.length === 0 ? (
                  <div className="bg-white p-12 rounded-[2.5rem] text-center border border-slate-100">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <ShoppingBag size={32} />
                    </div>
                    <p className="text-slate-400 font-bold">No orders found with this status.</p>
                  </div>
                ) : (
                  filteredOrders.map((o: Order) => (
                    <div key={o.id} className="bg-white p-8 rounded-[3rem] border border-slate-200 space-y-6 shadow-sm hover:shadow-md transition-shadow group">
                      <div className="flex justify-between border-b border-slate-50 pb-6">
                        <div>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</span>
                           <h4 className="font-black text-2xl mt-1 group-hover:text-blue-600 transition-colors">#{o.id}</h4>
                        </div>
                        <div className="text-right">
                           <span className="text-xs font-bold text-slate-400">{o.date}</span>
                           <div className={`mt-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(o.status)}`}>{o.status}</div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {o.items.map(i => (
                          <div key={i.productId} className="flex justify-between items-center text-sm font-bold">
                             <div className="flex items-center gap-3">
                               <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] font-black">{i.quantity}x</div>
                               <span className="text-slate-500">{i.name}</span>
                             </div>
                             <span className="text-slate-900">Rs. {(i.price * i.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                         <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                            <MapPin size={12} /> {o.address.slice(0, 20)}...
                         </div>
                         <span className="text-2xl font-black text-blue-600">Rs. {o.total.toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        )}

        {activeView === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">My Account</h2>
            <div className="bg-slate-900 p-8 rounded-[3rem] flex items-center gap-6 text-white shadow-2xl shadow-slate-200">
              <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-lg shadow-blue-900">
                <UserIcon size={48} />
              </div>
              <div>
                <h3 className="font-black text-3xl">{store.currentUser?.name || 'Customer'}</h3>
                <p className="text-blue-300 font-bold tracking-tight text-lg mt-1">{store.currentUser?.mobile || 'No Phone Attached'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <button 
                onClick={() => setActiveView('orders')}
                className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col items-center text-center gap-3 hover:bg-blue-50 transition-colors group"
               >
                 <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><PackageCheck size={24}/></div>
                 <span className="font-black uppercase text-[10px] tracking-widest text-slate-400">View Orders</span>
                 <span className="font-bold text-slate-900">{myOrders.length} Active Orders</span>
               </button>
               <button 
                onClick={() => setActiveView('repair-check')}
                className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col items-center text-center gap-3 hover:bg-orange-50 transition-colors group"
               >
                 <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><Wrench size={24}/></div>
                 <span className="font-black uppercase text-[10px] tracking-widest text-slate-400">Track Repairs</span>
                 <span className="font-bold text-slate-900">Check Status</span>
               </button>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border border-slate-200 space-y-6">
               <h4 className="font-black text-xl text-slate-900">Shop Information</h4>
               <div className="space-y-4 text-sm font-medium">
                  <div className="flex items-center gap-3 text-slate-500"><MapPin size={18} className="text-blue-600"/> {store.shop.address}</div>
                  <div className="flex items-center gap-3 text-slate-500"><Smartphone size={18} className="text-green-600"/> {store.shop.mobile}</div>
                  <div className="flex items-center gap-3 text-slate-500"><Clock size={18} className="text-orange-600"/> {store.shop.openingTime} - {store.shop.closingTime}</div>
               </div>
            </div>
          </div>
        )}

        {activeView === 'repair-check' && (
           <div className="max-w-md mx-auto space-y-12 pt-12 text-center animate-in fade-in duration-700">
              <div className="space-y-4">
                <div className="w-24 h-24 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-blue-600 shadow-inner">
                   <Smartphone size={48} />
                </div>
                <h2 className="text-4xl font-black tracking-tight text-slate-900">Repair Status</h2>
                <p className="text-slate-500 font-medium">Enter your Ticket ID or Mobile number to track.</p>
              </div>
              
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Ticket ID or Mobile" 
                  className="w-full p-6 bg-white border-2 border-slate-100 rounded-3xl outline-none focus:border-blue-500 shadow-sm transition-all font-black text-center text-xl"
                  value={repairCheckId}
                  onChange={(e) => setRepairCheckId(e.target.value)}
                />
                <button 
                  onClick={checkRepair}
                  className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-lg hover:bg-blue-600 shadow-xl transition-all active:scale-95"
                >
                  Check Live Status
                </button>
              </div>

              {foundRepair && (
                <div className="bg-white p-8 rounded-[3rem] border-2 border-blue-600 text-left space-y-6 animate-in slide-in-from-top-4 duration-500 shadow-2xl shadow-blue-100">
                   <div className="flex justify-between items-start">
                     <div>
                       <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Device</span>
                       <h3 className="font-black text-2xl mt-1 text-slate-900">{foundRepair.deviceType}</h3>
                     </div>
                     <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getRepairStatusColor(foundRepair.status)}`}>{foundRepair.status}</span>
                   </div>
                   <div className="space-y-4 text-sm font-medium border-t border-slate-50 pt-6">
                     <div className="flex justify-between items-center">
                        <span className="text-slate-400">Charges</span>
                        <span className="text-2xl font-black text-slate-900">Rs. {foundRepair.estimatedCharges.toLocaleString()}</span>
                     </div>
                   </div>
                </div>
              )}
           </div>
        )}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t flex justify-around py-4 px-8 z-50 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
        <NavButton active={activeView === 'browse'} onClick={() => setActiveView('browse')} icon={<ShoppingBag />} label="Shop" />
        <NavButton active={activeView === 'repair-check'} onClick={() => setActiveView('repair-check')} icon={<Smartphone />} label="Repair" />
        <NavButton active={activeView === 'orders'} onClick={() => setActiveView('orders')} icon={<PackageCheck />} label="Orders" />
        <NavButton active={activeView === 'cart'} onClick={() => setActiveView('cart')} icon={<ShoppingCart />} label="Bag" />
        <NavButton active={activeView === 'profile'} onClick={() => setActiveView('profile')} icon={<UserIcon />} label="Account" />
      </nav>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${active ? 'text-blue-600 scale-110' : 'text-slate-300 hover:text-slate-500'}`}>
    {React.cloneElement(icon as React.ReactElement, { size: active ? 24 : 20, strokeWidth: active ? 3 : 2 })}
    <span className={`text-[8px] font-black uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
  </button>
);

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.DELIVERED: return 'bg-green-100 text-green-700';
    case OrderStatus.PENDING: return 'bg-yellow-100 text-yellow-700';
    case OrderStatus.CONFIRMED: return 'bg-blue-100 text-blue-700';
    case OrderStatus.PACKED: return 'bg-purple-100 text-purple-700';
    case OrderStatus.CANCELLED: return 'bg-red-100 text-red-700';
    default: return 'bg-slate-100 text-slate-600';
  }
};

const getStatusTabColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.DELIVERED: return 'bg-green-600 text-white shadow-lg shadow-green-100';
    case OrderStatus.PENDING: return 'bg-yellow-500 text-white shadow-lg shadow-yellow-100';
    case OrderStatus.CONFIRMED: return 'bg-blue-600 text-white shadow-lg shadow-blue-100';
    case OrderStatus.PACKED: return 'bg-purple-600 text-white shadow-lg shadow-purple-100';
    case OrderStatus.CANCELLED: return 'bg-red-600 text-white shadow-lg shadow-red-100';
    default: return 'bg-slate-900 text-white shadow-lg';
  }
};

const getRepairStatusColor = (status: RepairStatus) => {
  switch (status) {
    case RepairStatus.COMPLETED: return 'bg-blue-100 text-blue-700';
    case RepairStatus.DELIVERED: return 'bg-green-100 text-green-700';
    case RepairStatus.IN_PROGRESS: return 'bg-orange-100 text-orange-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

export default CustomerPortal;
