// User Types
export interface Staff {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: 'ADMIN' | 'STAFF';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  membershipId: string;
  fullName: string;
  phoneNumber: string;
  loyaltyPoints: number;
  totalSpent: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Product Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  imageUrl?: string;
  buyingPrice: number;
  sellingPrice: number;
  discountPercent: number;
  stockQuantity: number;
  minimumStock: number;
  status: 'ACTIVE' | 'INACTIVE';
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  updatedById: string;
  previousStock: number;
  newStock: number;
  changeAmount: number;
  reason: string;
  createdAt: string;
}

// Billing Types
export interface BillItem {
  id: string;
  billId: string;
  productId: string;
  quantity: number;
  productPrice: number;
  discount: number;
  total: number;
}

export interface Bill {
  id: string;
  billNumber: string;
  createdById: string;
  memberId?: string;
  subtotal: number;
  totalDiscount: number;
  finalAmount: number;
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
  paymentMethod: 'CASH' | 'CARD' | 'ONLINE';
  createdAt: string;
  billItems: BillItem[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Auth Types
export interface LoginRequest {
  email?: string;
  membershipId?: string;
  password: string;
}

export interface AuthResponse {
  user: Staff | Member;
  token: string;
}

// Store/Context Types
export interface AuthContextType {
  user: (Staff | Member) | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userType: 'staff' | 'member' | null;
  login: (credentials: LoginRequest, userType: 'staff' | 'member') => Promise<void>;
  logout: () => void;
  setUser: (user: Staff | Member | null) => void;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CartContextType {
  items: CartItem[];
  total: number;
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}
