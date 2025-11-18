"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, Input, Spin, Button, Modal, Form, message } from "antd";
import { SearchOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { categoryService, Category } from "@/services/category-service";

export default function ProductTypesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [editForm] = Form.useForm();
    const [createForm] = Form.useForm();
    const queryClient = useQueryClient();

    // Fetch categories
    const { data: categories = [], isLoading, error } = useQuery({
        queryKey: ["categories", { search: searchQuery }],
        queryFn: () => categoryService.GetAll({ search: searchQuery }),
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (values: any) =>
            categoryService.Update(selectedCategory!.id, values),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            setIsEditModalOpen(false);
            editForm.resetFields();
            setSelectedCategory(null);
            message.success("Cập nhật loại sản phẩm thành công");
        },
        onError: (error) => {
            message.error(error instanceof Error ? error.message : "Cập nhật thất bại");
        },
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (values: any) => categoryService.Create(values),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            setIsCreateModalOpen(false);
            createForm.resetFields();
            message.success("Tạo loại sản phẩm thành công");
        },
        onError: (error) => {
            message.error(error instanceof Error ? error.message : "Tạo thất bại");
        },
    });

    const handleEdit = (record: Category) => {
        setSelectedCategory(record);
        editForm.setFieldsValue({
            code: record.code,
            name: record.name,
            description: record.description || "",
        });
        setIsEditModalOpen(true);
    };

    const handleEditOk = () => {
        editForm.validateFields().then((values) => {
            updateMutation.mutate(values);
        });
    };

    const handleCreateOk = () => {
        createForm.validateFields().then((values) => {
            createMutation.mutate(values);
        });
    };

    const antdColumns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 80,
        },
        {
            title: "Code",
            dataIndex: "code",
            key: "code",
        },
        {
            title: "Tên",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            render: (text: any) => text || "-",
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (text: string) => new Date(text).toLocaleDateString("vi-VN"),
        },
        {
            title: "Hành động",
            key: "action",
            width: 120,
            render: (text: any, record: Category) => (
                <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(record)}
                >
                    Sửa
                </Button>
            ),
        },
    ];

    const antdDataSource = categories.map((cat) => ({
        ...cat,
        key: cat.id,
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
                <h1 className="text-2xl font-bold text-gray-800">Loại sản phẩm</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    Tạo mới
                </Button>
            </div>

            {/* Search */}
            <Input
                placeholder="Tìm kiếm loại sản phẩm..."
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
                        total: categories.length,
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

            {/* Edit Modal */}
            <Modal
                title="Sửa loại sản phẩm"
                open={isEditModalOpen}
                onOk={handleEditOk}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    editForm.resetFields();
                    setSelectedCategory(null);
                }}
                confirmLoading={updateMutation.isPending}
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item
                        label="Code"
                        name="code"
                        rules={[{ required: true, message: "Vui lòng nhập code" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Tên"
                        name="name"
                        rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item label="Mô tả" name="description">
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Create Modal */}
            <Modal
                title="Tạo loại sản phẩm"
                open={isCreateModalOpen}
                onOk={handleCreateOk}
                onCancel={() => {
                    setIsCreateModalOpen(false);
                    createForm.resetFields();
                }}
                confirmLoading={createMutation.isPending}
            >
                <Form form={createForm} layout="vertical">
                    <Form.Item
                        label="Code"
                        name="code"
                        rules={[{ required: true, message: "Vui lòng nhập code" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Tên"
                        name="name"
                        rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item label="Mô tả" name="description">
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}