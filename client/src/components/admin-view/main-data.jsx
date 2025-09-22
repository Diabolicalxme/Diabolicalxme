import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    Chart as ChartJS,
    ArcElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Doughnut, Line, Pie, Bar } from "react-chartjs-2";
import {
    fetchDashboardSummary,
    fetchSalesChart,
    fetchOrderStatus,
    fetchStockStatus,
    fetchCategoryProducts,
} from "@/store/admin/dashboard-slice";

// Register Chart.js components
ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const MainData = () => {
    const dispatch = useDispatch();

    const {
        summary,
        salesChart,
        orderStatus,
        stockStatus,
        categoryProducts,
        isLoading
    } = useSelector((state) => state.adminDashboard);


    // Chart data states with default fallbacks
    const lineState = {
        labels: (salesChart || []).map((data) => data.month),
        datasets: [
            {
                label: `Sales in ${new Date().getFullYear() - 1}`,
                borderColor: "orange",
                backgroundColor: "orange",
                data: (salesChart || []).map((data) => data.lastYearSales),
            },
            {
                label: `Sales in ${new Date().getFullYear()}`,
                borderColor: "#4ade80",
                backgroundColor: "#4ade80",
                data: (salesChart || []).map((data) => data.currentYearSales),
            },
        ],
    };

    const pieState = {
        labels: (orderStatus || []).map((status) => status.label),
        datasets: [
            {
                backgroundColor: [
                    "#9333ea",
                    "#facc15",
                    "#4ade80",
                    "#22d3ee",
                    "#ef4444",
                ],
                hoverBackgroundColor: [
                    "#a855f7",
                    "#fde047",
                    "#86efac",
                    "#67e8f9",
                    "#f87171",
                ],
                data: (orderStatus || []).map((status) => status.count),
            },
        ],
    };

    const doughnutState = {
        labels: ["In Stock", "Out of Stock"],
        datasets: [
            {
                backgroundColor: ["#22c55e", "#ef4444"],
                hoverBackgroundColor: ["#16a34a", "#dc2626"],
                data: [
                    stockStatus?.inStock || 0,
                    stockStatus?.outOfStock || 0
                ],
            },
        ],
    };

    const barState = {
        labels: (categoryProducts || []).map((category) => category.name),
        datasets: [
            {
                label: "Products",
                borderColor: "#9333ea",
                backgroundColor: "#9333ea",
                hoverBackgroundColor: "#6b21a8",
                data: (categoryProducts || []).map((category) => category.count),
            },
        ],
    };

    useEffect(() => {
        dispatch(fetchDashboardSummary());
        dispatch(fetchSalesChart());
        dispatch(fetchOrderStatus());
        dispatch(fetchStockStatus());
        dispatch(fetchCategoryProducts());
    }, [dispatch]);

    if (isLoading || !summary) {
        return <p className="text-center">Loading...</p>;
    }

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-xl shadow-md p-6 flex flex-col items-center">
                    <h4 className="text-lg font-medium">Total Sales Amount</h4>
                    <h2 className="text-3xl font-bold">
                    ₹{summary.totalSales?.toLocaleString("en-IN") || 0}
                    </h2>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-red-700 text-white rounded-xl shadow-md p-6 flex flex-col items-center">
                    <h4 className="text-lg font-medium">Total Orders</h4>
                    <h2 className="text-3xl font-bold">{summary.totalOrders || 0}</h2>
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-white rounded-xl shadow-md p-6 flex flex-col items-center">
                    <h4 className="text-lg font-medium">Total Products</h4>
                    <h2 className="text-3xl font-bold">{summary.totalProducts || 0}</h2>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl shadow-md p-6 flex flex-col items-center">
                    <h4 className="text-lg font-medium">Total Users</h4>
                    <h2 className="text-3xl font-bold">{summary.totalUsers || 0}</h2>
                </div>
            </div>

            {/* First row of charts: Line & Pie */}
           {/* First row of charts: Line & Pie */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-8 min-w-full mt-6">
    <div className="col-span-2 bg-white rounded-xl h-auto shadow-lg p-2">
      <Line data={lineState} />
    </div>
    <div className="bg-white rounded-xl shadow-lg p-4 text-center">
      <span className="font-medium uppercase text-gray-800">
        Order Status
      </span>
      <Pie data={pieState} />
    </div>
  </div>

  {/* Second row of charts: Bar & Doughnut */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-8 min-w-full my-6">
    <div className="col-span-2 bg-white rounded-xl h-auto shadow-lg p-2">
      <Bar data={barState} />
    </div>
    <div className="bg-white rounded-xl shadow-lg p-4 text-center">
      <span className="font-medium uppercase text-gray-800">
        Stock Status
      </span>
      <Doughnut data={doughnutState} />
    </div>
  </div>
        </>
    );
};

export default MainData;