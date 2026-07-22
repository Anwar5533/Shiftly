import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kycApi } from '../api/kyc.api';
import type { DocumentTypeEnum } from '../api/kyc.api';
import { CheckCircle, Clock, AlertTriangle, UploadCloud } from 'lucide-react';
import { motion } from 'framer-motion';

export const VerificationPage = () => {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<DocumentTypeEnum>('NATIONAL_ID');

  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['kyc-status'],
    queryFn: kycApi.getKycStatus,
  });

  const uploadMutation = useMutation({
    mutationFn: async (fileToUpload: File) => {
      const uploadRes = await kycApi.uploadDocument(fileToUpload);
      return kycApi.submitKyc({
        documents: [
          {
            type: docType,
            url: uploadRes.url,
            fileName: fileToUpload.name,
            fileSize: fileToUpload.size,
          },
        ],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-status'] });
      setFile(null);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  if (statusLoading)
    return <div className="p-8 text-center text-slate-500">Loading verification status...</div>;

  const status = statusData?.status || 'NOT_STARTED';

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold text-foreground">Identity Verification</h1>
        <p className="text-muted-foreground">
          Verify your identity to unlock all features on Shiftly. This process usually takes 2-3
          minutes.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        {/* Status Banner */}
        <div
          className={`mb-8 flex items-center gap-3 rounded-lg p-4 ${
            status === 'APPROVED'
              ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-500'
              : status === 'PENDING' || status === 'UNDER_REVIEW'
                ? 'border border-amber-500/20 bg-amber-500/10 text-amber-500'
                : status === 'REJECTED'
                  ? 'border border-red-500/20 bg-red-500/10 text-red-500'
                  : 'border border-border bg-muted text-foreground'
          }`}
        >
          {status === 'APPROVED' && <CheckCircle className="h-5 w-5 text-emerald-500" />}
          {(status === 'PENDING' || status === 'UNDER_REVIEW') && (
            <Clock className="h-5 w-5 text-amber-500" />
          )}
          {status === 'REJECTED' && <AlertTriangle className="h-5 w-5 text-red-500" />}
          {status === 'NOT_STARTED' && <UploadCloud className="h-5 w-5 text-muted-foreground" />}

          <div>
            <h3 className="font-semibold">
              {status === 'APPROVED'
                ? 'Verified'
                : status === 'PENDING' || status === 'UNDER_REVIEW'
                  ? 'Verification Pending'
                  : status === 'REJECTED'
                    ? 'Verification Rejected'
                    : 'Not Verified'}
            </h3>
            <p className="text-sm opacity-90">
              {status === 'APPROVED'
                ? 'Your identity has been verified. You can now access all features.'
                : status === 'PENDING' || status === 'UNDER_REVIEW'
                  ? 'We are reviewing your documents. You will be notified once approved.'
                  : status === 'REJECTED'
                    ? 'Your documents were rejected. Please upload clear, valid documents.'
                    : 'Please upload your ID to get started.'}
            </p>
          </div>
        </div>

        {/* Upload Form */}
        {(status === 'NOT_STARTED' || status === 'REJECTED') && (
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Document Type
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentTypeEnum)}
                className="w-full rounded-lg border border-border bg-background p-2.5 text-foreground focus:border-primary focus:ring-2 focus:ring-primary"
              >
                <option value="NATIONAL_ID">National ID Card</option>
                <option value="PASSPORT">Passport</option>
                <option value="DRIVERS_LICENSE">Driver's License</option>
                <option value="BUSINESS_REGISTRATION">Business Registration (Employers)</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Upload Document
              </label>
              <div className="mt-1 flex justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 px-6 pb-6 pt-5 transition-colors hover:border-primary">
                <div className="space-y-1 text-center">
                  <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div className="flex justify-center text-sm text-muted-foreground">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-muted-foreground">PNG, JPG, PDF up to 10MB</p>
                </div>
              </div>
              {file && (
                <div className="mt-3 flex items-center justify-between rounded border border-primary/20 bg-primary/10 p-3 text-sm text-primary">
                  <span className="max-w-[200px] truncate">{file.name}</span>
                  <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={!file || uploadMutation.isPending}
                className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploadMutation.isPending ? 'Uploading...' : 'Submit for Verification'}
              </button>
            </div>
          </motion.form>
        )}
      </div>
    </div>
  );
};

export default VerificationPage;
