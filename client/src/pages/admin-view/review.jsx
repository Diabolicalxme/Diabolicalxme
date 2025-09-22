import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchAllReviews, deleteReview } from "../../store/admin/reviews-slice";
import { fetchAllProducts } from "../../store/admin/products-slice";
import { fetchAllCategories } from "../../store/admin/categories-slice";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { ArrowLeft, Eye, Trash2 } from "lucide-react";
import DeleteConfirmationModal from "@/components/common/delete-confirmation-modal";

const AdminProductReview = () => {
  const dispatch = useDispatch();

  // Fetch data from Redux slices
  const { isLoading, reviews, error } = useSelector((state) => state.adminProductReview);
  const { productList } = useSelector((state) => state.adminProducts);
  const { categoryList } = useSelector((state) => state.adminCategories);

  // Local state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [productReviews, setProductReviews] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchAllReviews());
    dispatch(fetchAllProducts());
    dispatch(fetchAllCategories());
  }, [dispatch]);

  // Map product reviews with associated product details
  useEffect(() => {
    if (productList.length > 0) {
      const updatedReviews = productList.map((product) => ({
        productId: product._id,
        productName: product.title,
        productImage: product.image[0], // Ensure this is an array before accessing index 0
        categoryName: getCategoryName(product.category), // Get category name correctly
        averageReview: product.averageReview, // Use averageReview from productList directly
        reviews: reviews.filter((review) => review.productId === product._id), // Get reviews for product
      }));
      setProductReviews(updatedReviews);
    }
  }, [productList, reviews]);

  // Synchronize the detailed selectedProduct when productReviews changes
  useEffect(() => {
    if (selectedProduct) {
      const updatedProduct = productReviews.find(
        (product) => product.productId === selectedProduct.productId
      );
      if (updatedProduct) {
        setSelectedProduct(updatedProduct);
      }
    }
  }, [productReviews, selectedProduct]);

  // Helper function to get category name by matching category ID
  const getCategoryName = (categoryId) => {
    const category = categoryList.find((cat) => cat._id === categoryId);
    return category ? category.name : "N/A"; // Fallback to "N/A" if category not found
  };

  // Helper function to format date in dd/mm/yyyy
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Handle clicking the view (Eye icon) to show detailed reviews for a product
  const handleViewClick = (product) => {
    setSelectedProduct(product);
  };

  // Handle back to aggregated product view
  const handleBackClick = () => {
    dispatch(fetchAllReviews());
    dispatch(fetchAllProducts());
    setSelectedProduct(null);
    // Clear the search when returning back to aggregated view
    setSearchQuery("");
  };

  // Open delete confirmation modal for an individual review
  const handleDeleteClick = (id) => {
    setSelectedReviewId(id);
    setModalOpen(true);
  };

  // Confirm deletion of an individual review and refresh the reviews data in the UI
  const confirmDelete = async () => {
    try {
      // Dispatch the deletion action
      await dispatch(deleteReview(selectedReviewId));
      // Refresh the reviews from the server, ensuring that Redux state is updated
      dispatch(fetchAllReviews());
      setModalOpen(false);
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  // Handler for search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Render aggregated product review table with search functionality
  const renderAggregatedTable = () => {
    // Filter the productReviews based on the search query
    const filteredProducts = searchQuery
      ? productReviews.filter((product) =>
          product.productName.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : productReviews;

    return (
      <Card className="-m-4">
        <CardHeader>
          <CardTitle>All Products</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search bar to filter products by name */}
          <div className="mb-4 w-1/3">
            <input
              type="text"
              placeholder="Search by product name..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full border rounded-md p-2"
            />
          </div>
          {isLoading ? (
            <p>Loading product reviews...</p>
          ) : error ? (
            <p className="text-red-500">Error: {error}</p>
          ) : filteredProducts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Average Review</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.productId}>
                    <TableCell className="flex items-center gap-4">
                      <img
                        src={product.productImage}
                        alt={product.productName}
                        className="w-12 h-12 rounded-md object-cover"
                      />
                      <span>{product.productName}</span>
                    </TableCell>
                    <TableCell>{product.categoryName}</TableCell>
                    <TableCell>{product.averageReview}</TableCell>
                    <TableCell>
                      <Button
                        variant="secondary"
                        onClick={() => handleViewClick(product)}
                        title="View Reviews"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-4">No products found.</p>
          )}
        </CardContent>
      </Card>
    );
  };

  // Render detailed review table for the selected product
  const renderDetailTable = () => (
    <Card>
      <CardHeader>
        <CardTitle>
          Reviews for: <span className="font-semibold">{selectedProduct.productName}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="flex items-center gap-2 mb-4 bg-background p-2 w-24 rounded-md hover:cursor-pointer hover:bg-muted"
          onClick={handleBackClick}
        >
          <ArrowLeft size={24} className="cursor-pointer text-gray-700 hover:text-gray-900" />
          Back
        </div>
        {selectedProduct.reviews.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedProduct.reviews.map((review) => (
                <TableRow key={review._id}>
                  <TableCell>{review.userName || "N/A"}</TableCell>
                  <TableCell>{review.reviewMessage || "N/A"}</TableCell>
                  <TableCell>{review.reviewValue || "N/A"}</TableCell>
                  <TableCell>{formatDate(review.createdAt)}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteClick(review._id)}
                      title="Delete Review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center py-4">No reviews for this product.</p>
        )}
      </CardContent>

      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this review?"
      />
    </Card>
  );

  return (
    <div className="p-4">
      {selectedProduct ? renderDetailTable() : renderAggregatedTable()}
    </div>
  );
};

export default AdminProductReview;