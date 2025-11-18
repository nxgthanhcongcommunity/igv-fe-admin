"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Table, Input, Spin, Avatar } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { userService, User } from "@/services/user-service";

export default function UsersPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Fetch users
    const { data: response, isLoading, error } = useQuery({
        queryKey: ["users", { search: searchQuery, page: pageIndex, pageSize }],
        queryFn: () =>
            userService.GetAll({
                page: pageIndex,
                pageSize,
                search: searchQuery,
            }),
    });

    const users = response?.items || [];
    const totalItems = response?.totalItems || 0;

    const antdColumns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 80,
        },
        {
            title: "Avatar",
            dataIndex: "avatar",
            key: "avatar",
            width: 80,
            render: (avatar: string, record: User) => (
                <Avatar src={avatar} alt={record.name} />
            ),
        },
        {
            title: "Tên",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Google ID",
            dataIndex: "googleId",
            key: "googleId",
            render: (text: string) => (
                <span className="text-xs text-gray-500 truncate">{text}</span>
            ),
        },
    ];

    const antdDataSource = users.map((user) => ({
        ...user,
        key: user.id,
    }));

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                Lỗi: {error instanceof Error ? error.message : "Unknown error"}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Người dùng</h1>
            </div>

            {/* Search */}
            <Input
                placeholder="Tìm kiếm người dùng..."
                prefix={<SearchOutlined />}
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPageIndex(1);
                }}
                size="large"
            />

            {/* Table */}
            <Spin spinning={isLoading}>
                <Table
                    columns={antdColumns}
                    dataSource={antdDataSource}
                    pagination={{
                        current: pageIndex,
                        pageSize,
                        total: totalItems,
                        onChange: (page, pageSize) => {
                            setPageIndex(page);
                            setPageSize(pageSize);
                        },
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "20", "50", "100"],
                    }}
                    locale={{
                        emptyText: "Không tìm thấy kết quả",
                    }}
                />
            </Spin>
        </div>
    );
}