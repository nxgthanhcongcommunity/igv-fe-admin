"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Table, Input, Spin, Tag, Button, Modal, Descriptions, List } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { orderService, Order, QrSession, OrderDetail } from "@/services/order-service";

export default function OrdersPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const { data: response, isLoading, error } = useQuery({
        queryKey: ["orders", { search: searchQuery, page: pageIndex, pageSize }],
        queryFn: () =>
            orderService.GetAll({
                page: pageIndex,
                pageSize,
                search: searchQuery,
            }),
        keepPreviousData: true,
    });

    const orders = response?.items || [];
    const totalItems = response?.totalItems || 0;

    // detail modal state
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailOrder, setDetailOrder] = useState<Order | null>(null);
    const [detailQrSessions, setDetailQrSessions] = useState<QrSession[]>([]);
    const [detailItems, setDetailItems] = useState<OrderDetail[]>([]);

    const openDetail = async (orderId: number) => {
        setIsDetailOpen(true);
        setDetailLoading(true);
        setDetailOrder(null);
        setDetailQrSessions([]);
        setDetailItems([]);

        try {
            const [order, qrSessions, items] = await Promise.all([
                orderService.GetById(orderId),
                orderService.GetQrSessions(orderId),
                orderService.GetDetails(orderId),
            ]);
            setDetailOrder(order);
            setDetailQrSessions(qrSessions || []);
            setDetailItems(items || []);
        } catch (err) {
            // simple inline handling
            const message = err instanceof Error ? err.message : "Lỗi khi tải chi tiết";
            alert(message);
            setIsDetailOpen(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const columns = [
        { title: "ID", dataIndex: "id", key: "id", width: 80 },
        {
            title: "Tổng tiền",
            dataIndex: "totalAmount",
            key: "totalAmount",
            render: (val: string) =>
                new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                    Number(val)
                ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (s: string) => (
                <Tag color={s === "paid" ? "green" : s === "pending" ? "orange" : "default"}>
                    {s}
                </Tag>
            ),
        },
        { title: "Tên khách", dataIndex: "userName", key: "userName" },
        { title: "Email", dataIndex: "userEmail", key: "userEmail" },
        {
            title: "Hành động",
            key: "action",
            width: 120,
            render: (_: any, record: Order) => (
                <Button onClick={() => openDetail(record.id)} type="link">
                    Xem
                </Button>
            ),
        },
    ];

    const dataSource = orders.map((o) => ({ ...o, key: o.id }));

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
                <h1 className="text-2xl font-bold text-gray-800">Đơn hàng</h1>
            </div>

            <Input
                placeholder="Tìm kiếm (user name, email, id...)"
                prefix={<SearchOutlined />}
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPageIndex(1);
                }}
                size="large"
            />

            <Spin spinning={isLoading}>
                <Table
                    columns={columns}
                    dataSource={dataSource}
                    pagination={{
                        current: pageIndex,
                        pageSize,
                        total: totalItems,
                        onChange: (page, size) => {
                            setPageIndex(page);
                            setPageSize(size);
                        },
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "20", "50", "100"],
                    }}
                    locale={{ emptyText: "Không tìm thấy kết quả" }}
                />
            </Spin>

            <Modal
                title={`Chi tiết đơn hàng ${detailOrder?.id ?? ""}`}
                open={isDetailOpen}
                onCancel={() => setIsDetailOpen(false)}
                footer={null}
                width={900}
            >
                <Spin spinning={detailLoading}>
                    {detailOrder && (
                        <>
                            <Descriptions bordered column={2} size="small">
                                <Descriptions.Item label="ID">{detailOrder.id}</Descriptions.Item>
                                <Descriptions.Item label="Mã">{detailOrder.code ?? "-"}</Descriptions.Item>
                                <Descriptions.Item label="Khách hàng">{detailOrder.userName}</Descriptions.Item>
                                <Descriptions.Item label="Email">{detailOrder.userEmail}</Descriptions.Item>
                                <Descriptions.Item label="Tổng tiền">
                                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                                        Number(detailOrder.totalAmount)
                                    )}
                                </Descriptions.Item>
                                <Descriptions.Item label="Trạng thái">{detailOrder.status}</Descriptions.Item>
                            </Descriptions>

                            <div className="mt-4">
                                <h3 className="text-lg font-medium">QR Sessions</h3>
                                <List
                                    dataSource={detailQrSessions}
                                    renderItem={(qr: QrSession) => (
                                        <List.Item key={qr.id}>
                                            <div className="w-full">
                                                <div><strong>QR Token:</strong> {qr.qrToken}</div>
                                                <div><strong>Ngân hàng:</strong> {qr.bankCode} — <strong>TK:</strong> {qr.accountNumber}</div>
                                                <div><strong>Số tiền:</strong> {qr.amount}</div>
                                                <div><strong>Hết hạn:</strong> {new Date(qr.expiredAt).toLocaleString()}</div>
                                                <div><strong>Trạng thái:</strong> {qr.status}</div>
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            </div>

                            <div className="mt-4">
                                <h3 className="text-lg font-medium">Order Items</h3>
                                <Table
                                    size="small"
                                    dataSource={detailItems.map((it) => ({ ...it, key: it.id }))}
                                    pagination={false}
                                    columns={[
                                        { title: "ID", dataIndex: "id", key: "id", width: 80 },
                                        { title: "Product", dataIndex: "productName", key: "productName" },
                                        { title: "Code", dataIndex: "productCode", key: "productCode", width: 120 },
                                        {
                                            title: "Price",
                                            dataIndex: "price",
                                            key: "price",
                                            render: (p: string) =>
                                                new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(p)),
                                        },
                                        { title: "Quantity", dataIndex: "quantity", key: "quantity", width: 100 },
                                        { title: "Created At", dataIndex: "createdAt", key: "createdAt", width: 150, render: (d: string) => new Date(d).toLocaleString() },
                                    ]}
                                />
                            </div>
                        </>
                    )}
                </Spin>
            </Modal>
        </div>
    );
}