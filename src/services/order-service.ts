const API_ROOT =
    process.env.NEXT_PUBLIC_API_ROOT ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

export interface Order {
    id: number;
    code?: string;
    totalAmount: string;
    status: string;
    userId: string;
    userName: string;
    userEmail: string;
}

export interface QrSession {
    id: number;
    orderId: number;
    qrToken: string;
    bankCode: string;
    accountNumber: string;
    amount: string;
    expiredAt: string;
    status: string;
}

export interface OrderDetail {
    id: number;
    quantity: number;
    productId: number;
    orderId: number;
    price: string;
    productCode: string;
    productName: string;
    createdAt: string;
}

export interface GetOrdersResponse {
    items: Order[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface ApiResponse<T> {
    succeed: boolean;
    data: T;
}

export interface GetOrdersFilters {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
}

class OrderService {
    async GetAll(filters: GetOrdersFilters = {}): Promise<GetOrdersResponse> {
        const params = new URLSearchParams();
        if (filters.page) params.append("page", String(filters.page));
        if (filters.pageSize) params.append("pageSize", String(filters.pageSize));
        if (filters.search) params.append("search", filters.search);
        if (filters.status) params.append("status", filters.status);

        const res = await fetch(`${API_ROOT}/orders?${params.toString()}`, {
            method: "GET",
            headers: { accept: "*/*" },
        });
        if (!res.ok) throw new Error(`Failed to fetch orders: ${res.statusText}`);
        const result: ApiResponse<GetOrdersResponse> = await res.json();
        return result.data;
    }

    async GetById(id: number): Promise<Order> {
        const res = await fetch(`${API_ROOT}/orders/${id}`, { method: "GET", headers: { accept: "*/*" } });
        if (!res.ok) throw new Error(`Failed to fetch order: ${res.statusText}`);
        const result: ApiResponse<Order> = await res.json();
        return result.data;
    }

    async GetQrSessions(orderId: number): Promise<QrSession[]> {
        const res = await fetch(`${API_ROOT}/orders/${orderId}/qr-sessions`, { method: "GET", headers: { accept: "*/*" } });
        if (!res.ok) throw new Error(`Failed to fetch qr sessions: ${res.statusText}`);
        const result: ApiResponse<QrSession[]> = await res.json();
        return result.data;
    }

    async GetDetails(orderId: number): Promise<OrderDetail[]> {
        const res = await fetch(`${API_ROOT}/orders/${orderId}/details`, { method: "GET", headers: { accept: "*/*" } });
        if (!res.ok) throw new Error(`Failed to fetch order details: ${res.statusText}`);
        const result: ApiResponse<OrderDetail[]> = await res.json();
        return result.data;
    }
}

export const orderService = new OrderService();