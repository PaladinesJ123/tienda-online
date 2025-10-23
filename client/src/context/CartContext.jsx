import { createContext, useContext, useState } from "react";
export const CartCtx = createContext(null);
export const useCart = ()=> useContext(CartCtx);

export default function CartProvider({ children }) {
  const [items, setItems] = useState([]); // {product, quantity}
  const add = (product, q=1)=>{
    setItems(prev=>{
      const i = prev.find(x=>x.product.id===product.id);
      if (i) return prev.map(x=> x.product.id===product.id ? {...x, quantity:x.quantity+q} : x);
      return [...prev, {product, quantity:q}];
    });
  };
  const remove = (id)=> setItems(prev=>prev.filter(x=>x.product.id!==id));
  const clear = ()=> setItems([]);
  const total = items.reduce((s,i)=> s + Number(i.product.price)*i.quantity, 0);
  return <CartCtx.Provider value={{ items, add, remove, clear, total }}>{children}</CartCtx.Provider>;
}
