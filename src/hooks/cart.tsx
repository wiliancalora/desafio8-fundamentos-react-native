import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import { EventEmitter } from 'react-native';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const productsCart = await AsyncStorage.getItem(
        '@GoMarketplace:productsCart',
      );

      if (productsCart) {
        setProducts([...JSON.parse(productsCart)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const productsExists = products.find(p => p.id === product.id);

      if (productsExists) {
        setProducts(
          products.map(p =>
            p.id === product.id ? { ...product, quantity: p.quantity + 1 } : p,
          ),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }

      await AsyncStorage.setItem(
        '@goMarketplace:productsCart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const items = [...products];

      const productIndex = items.findIndex(product => product.id === id);
      if (productIndex !== -1) {
        const product = items[productIndex];
        product.quantity += 1;

        setProducts(items);
      }

      await AsyncStorage.setItem(
        '@goMarketplace:productsCart',
        JSON.stringify(items),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const items = [...products];

      const productIndex = items.findIndex(product => product.id === id);
      if (productIndex !== -1) {
        const product = items[productIndex];
        product.quantity -= 1;

        if (product.quantity <= 0) {
          items.splice(productIndex, 1);
        }

        setProducts(items);
      }

      await AsyncStorage.setItem(
        '@goMarketplace:productsCart',
        JSON.stringify(items),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
