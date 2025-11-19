const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface ProductImage {
    id: number;
    imageUrl: string;
    isMain: boolean;
    sortOrder: number;
}

export interface GetProductImagesResponse {
    items: ProductImage[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface ApiResponse<T> {
    succeed: boolean;
    data: T;
}

export interface GetProductImagesFilters {
    page?: number;
    pageSize?: number;
    search?: string;
}

export interface CreateProductImagePayload {
    product_id: number;
    image_url: string;
    is_main: boolean;
    sort_order: number;
}

class ProductImageService {
    async GetAll(filters: GetProductImagesFilters = {}): Promise<GetProductImagesResponse> {
        const params = new URLSearchParams();
        if (filters.page) params.append("page", filters.page.toString());
        if (filters.pageSize) params.append("pageSize", filters.pageSize.toString());
        if (filters.search) params.append("search", filters.search);

        const response = await fetch(
            `${API_BASE_URL}/product-image?${params.toString()}`,
            {
                method: "GET",
                headers: { accept: "*/*" },
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch product images: ${response.statusText}`);
        }

        const result: ApiResponse<GetProductImagesResponse> = await response.json();
        return result.data;
    }

    async Create(payload: CreateProductImagePayload): Promise<ProductImage> {
        const response = await fetch(`${API_BASE_URL}/product-image`, {
            method: "POST",
            headers: {
                accept: "*/*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Failed to create product image: ${response.statusText}`);
        }

        const result: ApiResponse<ProductImage> = await response.json();
        return result.data;
    }

    // Add Delete method
    async Delete(id: number): Promise<ProductImage> {
        const response = await fetch(`${API_BASE_URL}/product-image/${id}`, {
            method: "DELETE",
            headers: { accept: "*/*" },
        });

        if (!response.ok) {
            throw new Error(`Failed to delete product image: ${response.statusText}`);
        }

        const result: ApiResponse<ProductImage> = await response.json();
        return result.data;
    }
}

export const productImageService = new ProductImageService();