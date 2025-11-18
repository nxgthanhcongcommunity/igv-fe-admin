const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface GetAllFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export interface UpdateCategoryPayload {
  code: string;
  name: string;
  description?: string;
}

export interface CreateCategoryPayload {
  code: string;
  name: string;
  description?: string;
}

class CategoryService {
  async GetAll(filters: GetAllFilters = {}): Promise<Category[]> {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const response = await fetch(
      `${API_BASE_URL}/categories?${params.toString()}`,
      {
        method: "GET",
        headers: { accept: "*/*" },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || [];
  }

  async Update(id: number, payload: UpdateCategoryPayload): Promise<Category> {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to update category: ${response.statusText}`);
    }

    const result: ApiResponse<Category> = await response.json();
    return result.data;
  }

  async Create(payload: CreateCategoryPayload): Promise<Category> {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to create category: ${response.statusText}`);
    }

    const result: ApiResponse<Category> = await response.json();
    return result.data;
  }
}

export const categoryService = new CategoryService();