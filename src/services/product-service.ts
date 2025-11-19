const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface Product {
    id: number;
    code: string;
    slug: string;
    name: string;
    price: string;
    createdAt: string;
    categoryId: number;
    usernameLogAcc: string;
    passwordLogAcc: string;
    extraInfo: Record<string, any>;
    status: "active" | "inactive";
    updatedAt: string | null;
}

export interface GetProductsResponse {
    items: Product[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface ApiResponse<T> {
    succeed: boolean;
    data: T;
}

export interface GetProductsFilters {
    page?: number;
    pageSize?: number;
    search?: string;
}

export interface CreateProductPayload {
    code: string;
    slug: string;
    name: string;
    price: number;
    category_id: number;
    username_log_acc: string;
    password_log_acc: string;
    extra_info?: Record<string, any>;
    status: "active" | "inactive";
}

export interface UpdateProductPayload {
    code: string;
    slug: string;
    name: string;
    price: number;
    category_id: number;
    username_log_acc: string;
    password_log_acc: string;
    extra_info?: Record<string, any>;
    status: "active" | "inactive";
}

class ProductService {
    async GetAll(filters: GetProductsFilters = {}): Promise<GetProductsResponse> {
        const params = new URLSearchParams();
        if (filters.page) params.append("page", filters.page.toString());
        if (filters.pageSize) params.append("pageSize", filters.pageSize.toString());
        if (filters.search) params.append("search", filters.search);

        const response = await fetch(
            `${API_BASE_URL}/products?${params.toString()}`,
            {
                method: "GET",
                headers: { accept: "*/*" },
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch products: ${response.statusText}`);
        }

        const result: ApiResponse<GetProductsResponse> = await response.json();
        return result.data;
    }

    async Create(payload: CreateProductPayload): Promise<Product> {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: "POST",
            headers: {
                accept: "*/*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Failed to create product: ${response.statusText}`);
        }

        const result: ApiResponse<Product> = await response.json();
        return result.data;
    }

    async Update(id: number, payload: UpdateProductPayload): Promise<Product> {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: "PUT",
            headers: {
                accept: "*/*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Failed to update product: ${response.statusText}`);
        }

        const result: ApiResponse<Product> = await response.json();
        return result.data;
    }

    // Replace FindByCode with a more flexible Find method
    async Find(param: string | { code: string }): Promise<Product | null> {
        const code = typeof param === "string" ? param : param?.code;
        if (!code) return null;

        const params = new URLSearchParams({ code });
        const response = await fetch(
            `${API_BASE_URL}/products/find?${params.toString()}`,
            {
                method: "GET",
                headers: { accept: "*/*" },
            }
        );

        if (response.status === 404) return null;
        if (!response.ok) {
            throw new Error(`Failed to find product: ${response.statusText}`);
        }

        const result: ApiResponse<Product> = await response.json();
        return result?.data ?? null;
    }
}

export const productService = new ProductService();