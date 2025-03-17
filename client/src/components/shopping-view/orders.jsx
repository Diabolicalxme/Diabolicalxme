import { useEffect, useState } from "react";
import { Dialog } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import ShoppingOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersByUserId,
  getOrderDetails,
  resetOrderDetails,
} from "@/store/shop/order-slice";
import { Eye, ShoppingBag, Search, X, Calendar, Tag } from "lucide-react";
import { Input } from "../ui/input";

function ShoppingOrders() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orderList, orderDetails } = useSelector((state) => state.shopOrder);

  function handleFetchOrderDetails(getId) {
    dispatch(getOrderDetails(getId));
  }

  useEffect(() => {
    dispatch(getAllOrdersByUserId(user?.id));
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);

  const sortedOrderList = orderList
    ? [...orderList].sort(
        (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
      )
    : [];

  // Format date in a more readable way
  const formatDate = (dateString) => {
    const options = {
      day: "numeric",
      month: "long",
      year: "numeric"
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Get status color class
  const getStatusClass = (status) => {
    switch(status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "delivered":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Filter orders based on search term
  const filteredOrders = sortedOrderList.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    const orderId = order._id.toLowerCase();
    const orderDate = formatDate(order.orderDate).toLowerCase();

    return orderId.includes(searchLower) || orderDate.includes(searchLower);
  });

  // Toggle order ID expansion
  const toggleOrderIdExpansion = (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  return (
    <div>
      {sortedOrderList && sortedOrderList.length > 0 ? (
        <>
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search by order ID or date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 py-2 border-gray-300 focus:border-black focus:ring-black w-full"
              />
              {searchTerm && (
                <button
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            <div className="flex gap-2 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                <span>Search by Order ID</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Search by Date</span>
              </span>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <Table className="w-full border-collapse">
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="py-4 px-4 text-left text-xs uppercase tracking-wider font-medium text-gray-500">Order ID</TableHead>
                  <TableHead className="py-4 px-4 text-left text-xs uppercase tracking-wider font-medium text-gray-500">Date</TableHead>
                  <TableHead className="py-4 px-4 text-left text-xs uppercase tracking-wider font-medium text-gray-500">Status</TableHead>
                  <TableHead className="py-4 px-4 text-left text-xs uppercase tracking-wider font-medium text-gray-500">Total</TableHead>
                  <TableHead className="py-4 px-4 text-left text-xs uppercase tracking-wider font-medium text-gray-500">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((orderItem) => (
                    <TableRow
                      key={orderItem?._id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="py-4 px-4 text-sm">
                        <button
                          onClick={() => toggleOrderIdExpansion(orderItem._id)}
                          className="font-medium text-gray-900 hover:text-black focus:outline-none"
                        >
                          {expandedOrderId === orderItem._id
                            ? orderItem._id
                            : `${orderItem._id.substring(0, 8)}...`
                          }
                        </button>
                      </TableCell>
                      <TableCell className="py-4 px-4 text-sm text-gray-600">
                        {formatDate(orderItem?.orderDate)}
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(orderItem?.orderStatus)}`}
                        >
                          {orderItem?.orderStatus.charAt(0).toUpperCase() + orderItem?.orderStatus.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 px-4 text-sm font-medium">
                        ₹{orderItem?.totalAmount.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell className="py-4 px-4 text-right">
                        <Dialog
                          open={openDetailsDialog}
                          onOpenChange={() => {
                            setOpenDetailsDialog(false);
                            dispatch(resetOrderDetails());
                          }}
                        >
                          <button
                            onClick={() => handleFetchOrderDetails(orderItem?._id)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-4 font-medium rounded-sm text-gray-700 bg-white hover:bg-gray-50 hover:border-black transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Details
                          </button>
                          <ShoppingOrderDetailsView orderDetails={orderDetails} />
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                      No orders match your search. Try a different search term.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-md">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100">
            <ShoppingBag className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
          <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
          <a
            href="/shop"
            className="inline-block px-6 py-3 border-2 border-black hover:bg-black hover:text-white transition-colors duration-300 uppercase tracking-wider text-sm font-medium"
          >
            Start Shopping
          </a>
        </div>
      )}
    </div>
  );
}

export default ShoppingOrders;
