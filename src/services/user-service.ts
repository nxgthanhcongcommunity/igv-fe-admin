const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface User {
    id: string;
    googleId: string;
    email: string;
    name: string;
    avatar: string;
}

export interface GetUsersResponse {
    items: User[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface ApiResponse<T> {
    succeed: boolean;
    data: T;
}

export interface GetUsersFilters {
    page?: number;
    pageSize?: number;
    search?: string;
}

class UserService {
    async GetAll(filters: GetUsersFilters = {}): Promise<GetUsersResponse> {
        const params = new URLSearchParams();
        if (filters.page) params.append("page", filters.page.toString());
        if (filters.pageSize) params.append("pageSize", filters.pageSize.toString());
        if (filters.search) params.append("search", filters.search);

        const response = await fetch(
            `${API_BASE_URL}/users?${params.toString()}`,
            {
                method: "GET",
                headers: { accept: "*/*" },
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch users: ${response.statusText}`);
        }

        const result: ApiResponse<GetUsersResponse> = await response.json();
        return result.data;
    }
}

export const userService = new UserService();