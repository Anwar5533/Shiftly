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
          }
        ]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-status'] });
      setFile(null);
    }
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

  if (statusLoading) return <div className="p-8 text-center text-slate-500">Loading verification status...</div>;

  const status = statusData?.status || 'NOT_STARTED';

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Identity Verification</h1>
        <p className="text-muted-foreground">
          Verify your identity to unlock all features on Shiftly. This process usually takes 2-3 minutes.
        </p>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        {/* Status Banner */}
        <div className={`mb-8 p-4 rounded-lg flex items-center gap-3 ${
          status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
          (status === 'PENDING' || status === 'UNDER_REVIEW') ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
          status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
          'bg-muted text-foreground border border-border'
        }`}>
          {status === 'APPROVED' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
          {(status === 'PENDING' || status === 'UNDER_REVIEW') && <Clock className="w-5 h-5 text-amber-500" />}
          {status === 'REJECTED' && <AlertTriangle className="w-5 h-5 text-red-500" />}
          {status === 'NOT_STARTED' && <UploadCloud className="w-5 h-5 text-muted-foreground" />}
          
          <div>
            <h3 className="font-semibold">
              {status === 'APPROVED' ? 'Verified' :
               (status === 'PENDING' || status === 'UNDER_REVIEW') ? 'Verification Pending' :
               status === 'REJECTED' ? 'Verification Rejected' : 'Not Verified'}
            </h3>
            <p className="text-sm opacity-90">
              {status === 'APPROVED' ? 'Your identity has been verified. You can now access all features.' :
               (status === 'PENDING' || status === 'UNDER_REVIEW') ? 'We are reviewing your documents. You will be notified once approved.' :
               status === 'REJECTED' ? 'Your documents were rejected. Please upload clear, valid documents.' : 'Please upload your ID to get started.'}
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
              <label className="block text-sm font-medium text-foreground mb-2">Document Type</label>
              <select 
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentTypeEnum)}
                className="w-full rounded-lg bg-background border-border border p-2.5 text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="NATIONAL_ID">National ID Card</option>
                <option value="PASSPORT">Passport</option>
                <option value="DRIVERS_LICENSE">Driver's License</option>
                <option value="BUSINESS_REGISTRATION">Business Registration (Employers)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Upload Document</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-lg hover:border-primary transition-colors bg-muted/30">
                <div className="space-y-1 text-center">
                  <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div className="flex text-sm text-muted-foreground justify-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-muted-foreground">PNG, JPG, PDF up to 10MB</p>
                </div>
              </div>
              {file && (
                <div className="mt-3 p-3 bg-primary/10 text-primary rounded flex justify-between items-center text-sm border border-primary/20">
                  <span className="truncate max-w-[200px]">{file.name}</span>
                  <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              )}
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={!file || uploadMutation.isPending} 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
