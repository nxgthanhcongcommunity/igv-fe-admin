"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Table,
    Input,
    Spin,
    Tag,
    Image,
    Button,
    Modal,
    Form,
    Checkbox,
    message,
    Popconfirm,
} from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { productImageService, ProductImage } from "@/services/product-image-service";
import { productService } from "@/services/product-service"; // added import

export default function ProductImagesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createForm] = Form.useForm();
    const queryClient = useQueryClient();

    // Fetch product images
    const { data: response, isLoading, error } = useQuery({
        queryKey: ["product-images", { search: searchQuery, page: pageIndex, pageSize }],
        queryFn: () =>
            productImageService.GetAll({
                page: pageIndex,
                pageSize,
                search: searchQuery,
            }),
    });

    const images = response?.items || [];
    const totalItems = response?.totalItems || 0;

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (values: any) => productImageService.Create(values),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["product-images"] });
            setIsCreateModalOpen(false);
            createForm.resetFields();
            message.success("Tạo hình ảnh sản phẩm thành công");
        },
        onError: (error) => {
            message.error(error instanceof Error ? error.message : "Tạo thất bại");
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => productImageService.Delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["product-images"] });
            message.success("Xóa hình ảnh thành công");
        },
        onError: (error) => {
            message.error(error instanceof Error ? error.message : "Xóa thất bại");
        },
    });

    const handleCreateOk = () => {
        createForm.validateFields().then((values) => {
            // ensure correct payload keys match API
            createMutation.mutate({
                product_id: values.product_id,
                image_url: values.image_url,
                is_main: !!values.is_main,
                sort_order: values.sort_order,
            });
        });
    };

    const handleDelete = (id: number) => {
        deleteMutation.mutate(id);
    };

    // New: find product by code and set product_id in form
    const handleFindProductByCode = async (code: string) => {
        if (!code?.trim()) {
            message.warning("Nhập product code để tìm.");
            return;
        }

        try {
            const prod = await productService.Find({ code: code.trim() });
            if (prod) {
                createForm.setFieldsValue({ product_id: prod.id });
                message.success(`Tìm thấy: ${prod.name} (ID: ${prod.id})`);
            } else {
                message.error("Không tìm thấy sản phẩm.");
            }
        } catch (err) {
            message.error(err instanceof Error ? err.message : "Lỗi khi tìm sản phẩm");
        }
    };

    const antdColumns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 70,
        },
        {
            title: "Hình ảnh",
            dataIndex: "imageUrl",
            key: "imageUrl",
            width: 150,
            render: (imageUrl: string) => (
                <Image
                    src={imageUrl}
                    alt="Product"
                    width={100}
                    height={80}
                    style={{ objectFit: "cover" }}
                />
            ),
        },
        {
            title: "URL",
            dataIndex: "imageUrl",
            key: "imageUrlText",
            render: (imageUrl: string) => (
                <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="truncate">
                    {imageUrl}
                </a>
            ),
        },
        {
            title: "Ảnh chính",
            dataIndex: "isMain",
            key: "isMain",
            width: 100,
            render: (isMain: boolean) => (
                <Tag color={isMain ? "green" : "default"}>
                    {isMain ? "Có" : "Không"}
                </Tag>
            ),
        },
        {
            title: "Thứ tự",
            dataIndex: "sortOrder",
            key: "sortOrder",
            width: 80,
        },
        // Add action column with delete
        {
            title: "Hành động",
            key: "action",
            width: 140,
            render: (_: any, record: ProductImage) => (
                <div className="flex gap-2">
                    <Popconfirm
                        title="Xóa hình ảnh này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button danger>Xóa</Button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    const antdDataSource = images.map((image) => ({
        ...image,
        key: image.id,
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
                <h1 className="text-2xl font-bold text-gray-800">Hình ảnh sản phẩm</h1>
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
                placeholder="Tìm kiếm hình ảnh..."
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
                title="Tạo hình ảnh sản phẩm"
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
                    {/* New: product code input with lookup */}
                    <Form.Item label="Product code" name="product_code">
                        <Input.Search
                            placeholder="Nhập code, ví dụ: P0001"
                            enterButton="Tìm"
                            onSearch={(value) => handleFindProductByCode(value)}
                        />
                    </Form.Item>

                    <Form.Item
                        label="ID sản phẩm"
                        name="product_id"
                        rules={[{ required: true, message: "Vui lòng nhập ID sản phẩm" }]}
                    >
                        {/* keep as number input but user normally fills via product_code lookup */}
                        <Input type="number" />
                    </Form.Item>

                    <Form.Item
                        label="URL hình ảnh"
                        name="image_url"
                        rules={[
                            { required: true, message: "Vui lòng nhập URL hình ảnh" },
                            { type: "url", message: "Vui lòng nhập URL hợp lệ" },
                        ]}
                    >
                        <Input placeholder="https://example.com/image.jpg" />
                    </Form.Item>

                    <Form.Item
                        label="Thứ tự"
                        name="sort_order"
                        rules={[{ required: true, message: "Vui lòng nhập thứ tự" }]}
                        initialValue={1}
                    >
                        <Input type="number" min={1} />
                    </Form.Item>

                    <Form.Item
                        label="Ảnh chính"
                        name="is_main"
                        valuePropName="checked"
                        initialValue={false}
                    >
                        <Checkbox>Đặt làm ảnh chính</Checkbox>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}