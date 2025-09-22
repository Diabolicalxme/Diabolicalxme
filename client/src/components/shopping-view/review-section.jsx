import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import StarRatingComponent from "@/components/common/star-rating";
import { ChevronDown, ChevronUp, Star } from "lucide-react";
import { getThemeColors } from "@/utils/theme-utils";

const ReviewSection = ({
  reviews,
  averageReview,
  rating,
  reviewMsg,
  handleRatingChange,
  setReviewMsg,
  handleAddReview
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState(false);
  const { currentTheme } = useSelector((state) => state.theme);
  const themeColors = getThemeColors(currentTheme);

  // Calculate the number of reviews to show initially
  const initialReviewsToShow = 3;
  const hasMoreReviews = reviews && reviews.length > initialReviewsToShow;

  // Get the reviews to display based on expanded state
  const displayedReviews = expandedReviews || !hasMoreReviews
    ? reviews
    : reviews?.slice(0, initialReviewsToShow);

  return (
    <div className={`${themeColors.cardBg} ${themeColors.cardText} rounded-md shadow-sm border ${themeColors.borderColor} overflow-hidden transition-colors duration-300`}>
      {/* Header with summary stats */}
      <div className={`flex flex-col md:flex-row md:items-center md:justify-between p-6 border-b ${themeColors.borderColor}`}>
        <div className="flex flex-col items-center md:items-start gap-2 mb-4 md:mb-0">
          <div className="flex items-center gap-2">
            <StarRatingComponent disableHover={true} rating={averageReview} size="large" />
            <span className={`text-xl font-medium ${themeColors.cardText}`}>{averageReview.toFixed(1)}/5</span>
          </div>
          <p className={`text-sm ${themeColors.mutedText}`}>
            Based on {reviews?.length || 0} {reviews?.length === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowReviewForm(!showReviewForm)}
          className={`px-6 py-2 text-sm transition-all duration-300 ${themeColors.buttonOutline}`}
        >
          {showReviewForm ? 'Cancel' : 'Write a Review'}
        </Button>
      </div>

      {/* Collapsible Review Form */}
      {showReviewForm && (
        <div className={`p-6 ${themeColors.formBg} border-b ${themeColors.borderColor}`}>
          <div className="max-w-xl mx-auto space-y-5">
            <div>
              <Label className={`text-sm font-medium mb-2 block ${themeColors.cardText}`}>Your Rating</Label>
              <div className="flex items-center">
                <StarRatingComponent
                  rating={rating}
                  handleRatingChange={handleRatingChange}
                  size="default"
                />
                <span className={`text-sm ${themeColors.mutedText} ml-3`}>
                  {rating > 0 ? `${rating}/5` : 'Select rating'}
                </span>
              </div>
            </div>

            <div>
              <Label className={`text-sm font-medium mb-2 block ${themeColors.cardText}`}>Your Review</Label>
              <Textarea
                name="reviewMsg"
                value={reviewMsg}
                onChange={(event) => setReviewMsg(event.target.value)}
                placeholder="Share your experience with this product..."
                className={`resize-none h-32 w-full ${themeColors.inputBorder} ${themeColors.cardBg} ${themeColors.cardText} placeholder:${themeColors.mutedText}`}
              />
            </div>

            <div className="flex justify-end">
              <Button
                size="sm"
                className={`${themeColors.buttonBg} ${themeColors.buttonText} px-6 py-2 transition-all duration-300`}
                onClick={() => {
                  handleAddReview();
                  setShowReviewForm(false);
                }}
                disabled={reviewMsg.trim() === "" || rating === 0}
              >
                Submit Review
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Review List */}
      {reviews && reviews.length > 0 ? (
        <div className={`divide-y ${themeColors.borderColor}`}>
          {displayedReviews.map((reviewItem) => (
            <div className={`p-6 hover:${themeColors.formBg} transition-colors`} key={reviewItem._id}>
              <div className="flex gap-4">
                <Avatar className={`w-10 h-10 border ${themeColors.borderColor}`}>
                  <AvatarFallback className={`${themeColors.formBg} ${themeColors.mutedText} text-sm font-medium`}>
                    {reviewItem?.userName?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                    <h3 className={`font-medium ${themeColors.cardText}`}>
                      {reviewItem?.userName}
                    </h3>
                    <div className={`text-xs ${themeColors.mutedText} mt-1 sm:mt-0`}>
                      {reviewItem.createdAt ? new Date(reviewItem.createdAt).toLocaleDateString() : 'Recent'}
                    </div>
                  </div>

                  <div className="flex items-center mb-3">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= reviewItem?.reviewValue ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs ${themeColors.mutedText} ml-2`}>
                      {reviewItem?.reviewValue}/5
                    </span>
                  </div>

                  <p className={`text-sm ${themeColors.cardText} leading-relaxed`}>
                    {reviewItem.reviewMessage}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Show more/less button */}
          {hasMoreReviews && (
            <div className="p-6 text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpandedReviews(!expandedReviews)}
                className={`px-6 py-2 flex items-center gap-2 mx-auto transition-all duration-300 ${themeColors.buttonOutline}`}
              >
                {expandedReviews ? (
                  <>Show Less <ChevronUp className="h-4 w-4" /></>
                ) : (
                  <>Show All Reviews ({reviews.length}) <ChevronDown className="h-4 w-4" /></>
                )}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="py-16 px-6 text-center">
          <h3 className={`text-xl font-medium mb-3 ${themeColors.cardText}`}>No Reviews Yet</h3>
          <p className={`text-sm ${themeColors.mutedText} mb-6 max-w-md mx-auto`}>Be the first to share your thoughts about this product</p>
          <Button
            onClick={() => setShowReviewForm(true)}
            className={`${themeColors.buttonBg} ${themeColors.buttonText} px-6 py-2 transition-all duration-300`}
            size="sm"
          >
            Write a Review
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
