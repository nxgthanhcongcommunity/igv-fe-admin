"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, Input, Spin, Tag, Button, Modal, Form, Select, message } from "antd";
import { SearchOutlined, PlusOutlined, EditOutlined } from "@ant-design/icons";
import { productService, Product } from "@/services/product-service";
import { categoryService } from "@/services/category-service";

export default function ProductsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const queryClient = useQueryClient();

    // Fetch products
    const { data: response, isLoading, error } = useQuery({
        queryKey: ["products", { search: searchQuery, page: pageIndex, pageSize }],
        queryFn: () =>
            productService.GetAll({
                page: pageIndex,
                pageSize,
                search: searchQuery,
            }),
    });

    // Fetch categories
    const { data: categories = [] } = useQuery({
        queryKey: ["categories"],
        queryFn: () => categoryService.GetAll(),
    });

    const products = response?.items || [];
    const totalItems = response?.totalItems || 0;

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (values: any) => productService.Create(values),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            setIsCreateModalOpen(false);
            createForm.resetFields();
            message.success("Tạo sản phẩm thành công");
        },
        onError: (error) => {
            message.error(error instanceof Error ? error.message : "Tạo thất bại");
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (values: any) =>
            productService.Update(selectedProduct!.id, values),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            setIsEditModalOpen(false);
            editForm.resetFields();
            setSelectedProduct(null);
            message.success("Cập nhật sản phẩm thành công");
        },
        onError: (error) => {
            message.error(error instanceof Error ? error.message : "Cập nhật thất bại");
        },
    });

    const handleCreateOk = () => {
        createForm.validateFields().then((values) => {
            createMutation.mutate({
                ...values,
                extra_info: values.extra_info ? JSON.parse(values.extra_info) : {},
            });
        });
    };

    const handleEdit = (record: Product) => {
        setSelectedProduct(record);
        editForm.setFieldsValue({
            code: record.code,
            slug: record.slug,
            name: record.name,
            price: parseFloat(record.price),
            category_id: record.categoryId,
            username_log_acc: record.usernameLogAcc,
            password_log_acc: record.passwordLogAcc,
            status: record.status,
            extra_info: JSON.stringify(record.extraInfo),
        });
        setIsEditModalOpen(true);
    };

    const handleEditOk = () => {
        editForm.validateFields().then((values) => {
            updateMutation.mutate({
                ...values,
                extra_info: values.extra_info ? JSON.parse(values.extra_info) : {},
            });
        });
    };

    const categoryOptions = categories.map((cat) => ({
        label: cat.name,
        value: cat.id,
    }));

    const antdColumns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 70,
        },
        {
            title: "Code",
            dataIndex: "code",
            key: "code",
            width: 100,
        },
        {
            title: "Tên sản phẩm",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Giá",
            dataIndex: "price",
            key: "price",
            width: 100,
            render: (price: string) => `$${parseFloat(price).toFixed(2)}`,
        },
        {
            title: "Danh mục",
            dataIndex: "categoryId",
            key: "categoryId",
            width: 80,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 100,
            render: (status: string) => (
                <Tag color={status === "active" ? "green" : "red"}>
                    {status === "active" ? "Hoạt động" : "Không hoạt động"}
                </Tag>
            ),
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 150,
            render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
        },
        {
            title: "Hành động",
            key: "action",
            width: 120,
            render: (text: any, record: Product) => (
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

    const antdDataSource = products.map((product) => ({
        ...product,
        key: product.id,
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
                <h1 className="text-2xl font-bold text-gray-800">Sản phẩm</h1>
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
                placeholder="Tìm kiếm sản phẩm..."
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
                    scroll={{ x: 1200 }}
                />
            </Spin>

            {/* Create Modal */}
            <Modal
                title="Tạo sản phẩm"
                open={isCreateModalOpen}
                onOk={handleCreateOk}
                onCancel={() => {
                    setIsCreateModalOpen(false);
                    createForm.resetFields();
                }}
                confirmLoading={createMutation.isPending}
                width={600}
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
                        label="Slug"
                        name="slug"
                        rules={[{ required: true, message: "Vui lòng nhập slug" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Tên sản phẩm"
                        name="name"
                        rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Giá"
                        name="price"
                        rules={[{ required: true, message: "Vui lòng nhập giá" }]}
                    >
                        <Input type="number" step="0.01" />
                    </Form.Item>

                    <Form.Item
                        label="Danh mục"
                        name="category_id"
                        rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
                    >
                        <Select
                            placeholder="Chọn danh mục"
                            options={categoryOptions}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Username"
                        name="username_log_acc"
                        rules={[{ required: true, message: "Vui lòng nhập username" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password_log_acc"
                        rules={[{ required: true, message: "Vui lòng nhập password" }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item
                        label="Trạng thái"
                        name="status"
                        initialValue="active"
                        rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
                    >
                        <Select
                            options={[
                                { label: "Hoạt động", value: "active" },
                                { label: "Không hoạt động", value: "inactive" },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Extra Info (JSON)"
                        name="extra_info"
                        tooltip='Nhập JSON object, ví dụ: {"size": "XL", "color": "red"}'
                    >
                        <Input.TextArea rows={3} placeholder='{"size": "S", "color": "green"}' />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit Modal */}
            <Modal
                title="Sửa sản phẩm"
                open={isEditModalOpen}
                onOk={handleEditOk}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    editForm.resetFields();
                    setSelectedProduct(null);
                }}
                confirmLoading={updateMutation.isPending}
                width={600}
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
                        label="Slug"
                        name="slug"
                        rules={[{ required: true, message: "Vui lòng nhập slug" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Tên sản phẩm"
                        name="name"
                        rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Giá"
                        name="price"
                        rules={[{ required: true, message: "Vui lòng nhập giá" }]}
                    >
                        <Input type="number" step="0.01" />
                    </Form.Item>

                    <Form.Item
                        label="Danh mục"
                        name="category_id"
                        rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
                    >
                        <Select
                            placeholder="Chọn danh mục"
                            options={categoryOptions}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Username"
                        name="username_log_acc"
                        rules={[{ required: true, message: "Vui lòng nhập username" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password_log_acc"
                        rules={[{ required: true, message: "Vui lòng nhập password" }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item
                        label="Trạng thái"
                        name="status"
                        rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
                    >
                        <Select
                            options={[
                                { label: "Hoạt động", value: "active" },
                                { label: "Không hoạt động", value: "inactive" },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Extra Info (JSON)"
                        name="extra_info"
                        tooltip='Nhập JSON object, ví dụ: {"size": "XL", "color": "red"}'
                    >
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}