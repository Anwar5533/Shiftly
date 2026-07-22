/* eslint-disable @typescript-eslint/no-explicit-any -- TODO(RC3): */
import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { reviewsApi } from '../api/reviews.api';

interface ReviewModalProps {
  jobId: string;
  revieweeId: string;
  targetType: 'WORKER' | 'EMPLOYER';
  isOpen: boolean;
  onClose: () => void;
}

export function ReviewModal({ jobId, revieweeId, targetType, isOpen, onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const submitReviewMutation = useMutation({
    mutationFn: () => reviewsApi.createReview({ jobId, revieweeId, targetType, rating, comment }),
    onSuccess: () => {
      alert('Review submitted successfully!');
      onClose();
    },
    onError: (err: import('axios').AxiosError<{message?: string}>) => {
      alert(err.response?.data?.message || 'Failed to submit review');
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl duration-200 animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-2 text-xl font-bold text-foreground">Leave a Review</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Rate your experience and leave a comment.
        </p>

        <div className="mb-6 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`p-1 transition-colors ${
                star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-muted-foreground/30'
              }`}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            >
              <Star className="h-8 w-8 fill-current" />
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Comment (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="h-24 w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="How was the experience?"
            />
          </div>

          <button
            onClick={() => submitReviewMutation.mutate()}
            disabled={rating === 0 || submitReviewMutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
}
