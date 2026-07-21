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
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to submit review');
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-foreground mb-2">Leave a Review</h2>
        <p className="text-sm text-muted-foreground mb-6">Rate your experience and leave a comment.</p>

        <div className="flex gap-2 justify-center mb-6">
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
              <Star className="w-8 h-8 fill-current" />
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Comment (optional)</label>
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full h-24 bg-background border border-input rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              placeholder="How was the experience?"
            />
          </div>

          <button
            onClick={() => submitReviewMutation.mutate()}
            disabled={rating === 0 || submitReviewMutation.isPending}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
}
