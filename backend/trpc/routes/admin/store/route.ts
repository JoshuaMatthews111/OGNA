import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

let mockProducts = [
  {
    id: '1',
    name: 'Faith Walk T-Shirt',
    description: 'Comfortable cotton t-shirt with inspirational message',
    price: 25.00,
    currency: 'USD',
    category: 'apparel',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'],
    stock: 50,
    isActive: true,
    shippingInfo: { weight: 0.5, dimensions: '30x20x2 cm' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

let mockOrders = [
  {
    id: '1',
    userId: 'user1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    items: [{ productId: '1', productName: 'Faith Walk T-Shirt', quantity: 2, price: 25.00, subtotal: 50.00 }],
    subtotal: 50.00,
    shipping: 5.00,
    tax: 4.50,
    total: 59.50,
    currency: 'USD',
    status: 'pending' as const,
    shippingAddress: { name: 'John Doe', street: '123 Main St', city: 'New York', state: 'NY', zip: '10001', country: 'USA', phone: '+1234567890' },
    paymentMethod: 'card' as const,
    paymentStatus: 'pending' as const,
    trackingNumber: '',
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const listProductsProcedure = publicProcedure
  .input(z.object({
    category: z.string().optional(),
    isActive: z.boolean().optional(),
  }).optional())
  .query(({ input }) => {
    let products = mockProducts;
    if (input?.category) products = products.filter(p => p.category === input.category);
    if (input?.isActive !== undefined) products = products.filter(p => p.isActive === input.isActive);
    return products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

export const getProductProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(({ input }) => {
    const product = mockProducts.find(p => p.id === input.id);
    if (!product) throw new Error('Product not found');
    return product;
  });

export const createProductProcedure = publicProcedure
  .input(z.object({
    name: z.string(),
    description: z.string(),
    price: z.number().positive(),
    currency: z.string().default('USD'),
    category: z.string(),
    images: z.array(z.string().url()),
    stock: z.number().int().min(0),
    shippingInfo: z.object({
      weight: z.number().positive(),
      dimensions: z.string(),
    }).optional(),
  }))
  .mutation(({ input }) => {
    const newProduct = {
      id: Date.now().toString(),
      ...input,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockProducts.push(newProduct);
    return newProduct;
  });

export const updateProductProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
    price: z.number().positive().optional(),
    category: z.string().optional(),
    images: z.array(z.string().url()).optional(),
    stock: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
    shippingInfo: z.object({
      weight: z.number().positive(),
      dimensions: z.string(),
    }).optional(),
  }))
  .mutation(({ input }) => {
    const productIndex = mockProducts.findIndex(p => p.id === input.id);
    if (productIndex === -1) throw new Error('Product not found');
    mockProducts[productIndex] = { ...mockProducts[productIndex], ...input, updatedAt: new Date().toISOString() };
    return mockProducts[productIndex];
  });

export const deleteProductProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ input }) => {
    mockProducts = mockProducts.filter(p => p.id !== input.id);
    return { success: true, message: 'Product deleted successfully' };
  });

export const listOrdersProcedure = publicProcedure
  .input(z.object({
    status: z.enum(['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
    userId: z.string().optional(),
  }).optional())
  .query(({ input }) => {
    let orders = mockOrders;
    if (input?.status && input.status !== 'all') orders = orders.filter(o => o.status === input.status);
    if (input?.userId) orders = orders.filter(o => o.userId === input.userId);
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

export const getOrderProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(({ input }) => {
    const order = mockOrders.find(o => o.id === input.id);
    if (!order) throw new Error('Order not found');
    return order;
  });

export const updateOrderStatusProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
    trackingNumber: z.string().optional(),
    notes: z.string().optional(),
  }))
  .mutation(({ input }) => {
    const orderIndex = mockOrders.findIndex(o => o.id === input.id);
    if (orderIndex === -1) throw new Error('Order not found');
    mockOrders[orderIndex] = {
      ...mockOrders[orderIndex],
      status: input.status,
      trackingNumber: input.trackingNumber || mockOrders[orderIndex].trackingNumber,
      notes: input.notes || mockOrders[orderIndex].notes,
      updatedAt: new Date().toISOString(),
    };
    return mockOrders[orderIndex];
  });

export const createOrderProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
    userName: z.string(),
    userEmail: z.string().email(),
    items: z.array(z.object({
      productId: z.string(),
      productName: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
      subtotal: z.number().positive(),
    })),
    subtotal: z.number().positive(),
    shipping: z.number().min(0),
    tax: z.number().min(0),
    total: z.number().positive(),
    currency: z.string().default('USD'),
    shippingAddress: z.object({
      name: z.string(),
      street: z.string(),
      city: z.string(),
      state: z.string(),
      zip: z.string(),
      country: z.string(),
      phone: z.string(),
    }),
    paymentMethod: z.enum(['card', 'paypal', 'cash']),
  }))
  .mutation(({ input }) => {
    const newOrder = {
      id: Date.now().toString(),
      ...input,
      status: 'pending' as const,
      paymentStatus: 'pending' as const,
      trackingNumber: '',
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockOrders.push(newOrder);
    return newOrder;
  });

export const getStoreStatsProcedure = publicProcedure
  .query(() => {
    const totalRevenue = mockOrders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0);
    const pendingOrders = mockOrders.filter(o => o.status === 'pending').length;
    const activeProducts = mockProducts.filter(p => p.isActive).length;
    const lowStock = mockProducts.filter(p => p.stock < 10).length;
    
    return {
      totalRevenue,
      pendingOrders,
      activeProducts,
      lowStock,
      totalOrders: mockOrders.length,
      totalProducts: mockProducts.length,
    };
  });
