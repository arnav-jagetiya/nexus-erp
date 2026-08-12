import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, FileText, CheckCircle2, XCircle, Clock, 
  User, Building2, Calendar, Phone, Mail, AlertTriangle, Printer
} from 'lucide-react';

import { useChallan, useConfirmChallan, useCancelChallan, challanKeys } from '../../hooks/useChallans';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataPanel } from '../../components/ui/DataPanel';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { ChallanPrintView } from './ChallanPrintView';
import { extractErrorMessage } from '../../utils/errorHandling';

export function ChallanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: challan, isLoading, isError, refetch } = useChallan(id!);
  const confirmMutation = useConfirmChallan();
  const cancelMutation = useCancelChallan();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-12">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !challan) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="w-12 h-12 text-status-error mb-4" />
        <h3 className="text-lg font-semibold text-content-primary">Challan Not Found</h3>
        <p className="text-content-secondary mt-2 mb-6">The sales challan you are looking for does not exist or you do not have permission to view it.</p>
        <Button variant="primary" onClick={() => navigate('/app/challans')}>Return to Challans</Button>
      </div>
    );
  }

  const canManage = (user?.role === 'ADMIN' || user?.role === 'SALES') && challan.status === 'DRAFT';

  const handleConfirm = () => {
    setGlobalError(null);
    confirmMutation.mutate(challan.id, {
      onSuccess: () => {
        setIsConfirmModalOpen(false);
      },
      onError: (error: any) => {
        setGlobalError(extractErrorMessage(error, 'Failed to confirm challan'));
        setIsConfirmModalOpen(false);
        refetch();
      }
    });
  };

  const handleCancel = () => {
    setGlobalError(null);
    cancelMutation.mutate(challan.id, {
      onSuccess: () => {
        setIsCancelModalOpen(false);
      },
      onError: (error: any) => {
        setGlobalError(extractErrorMessage(error, 'Failed to cancel challan'));
        setIsCancelModalOpen(false);
      }
    });
  };

  return (
    <>
      <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full pb-12 print:hidden">
        <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/challans')} className="text-content-secondary">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to List
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <PageHeader 
          title={challan.challanNumber}
          description="Sales Challan Document"
          icon={<FileText className="w-6 h-6" />}
        />
        
        <div className="flex items-center gap-3">
          <Button variant="outline" leftIcon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>
            Print
          </Button>
          
          {canManage && (
            <>
              <Button 
                variant="outline" 
                className="text-status-error hover:bg-status-error/10 border-status-error/20 hover:border-status-error/30"
                onClick={() => setIsCancelModalOpen(true)}
              >
                Cancel Draft
              </Button>
              <Button 
                variant="primary" 
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
                onClick={() => setIsConfirmModalOpen(true)}
              >
                Confirm & Deduct Stock
              </Button>
            </>
          )}
        </div>
      </div>

      {globalError && (
        <div className="p-4 rounded-md bg-status-error/10 border border-status-error/20 flex items-start gap-3 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-status-error flex-shrink-0 mt-0.5" />
          <span className="text-sm font-medium text-status-error">{globalError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Information */}
        <DataPanel className="p-6 border-t-4 border-t-brand">
          <h3 className="text-sm font-semibold text-content-primary mb-6 flex items-center gap-2">
            <User className="w-4 h-4 text-brand" />
            Customer Information
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="text-[10px] font-mono tracking-widest text-content-tertiary uppercase mb-1">Business Name</div>
              <div className="font-semibold text-content-primary text-lg flex items-center gap-2">
                <Building2 className="w-4 h-4 text-content-secondary" />
                {challan.customer.businessName}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] font-mono tracking-widest text-content-tertiary uppercase mb-1">Contact Person</div>
                <div className="text-sm text-content-primary font-medium">{challan.customer.name}</div>
              </div>
              <div>
                <div className="text-[10px] font-mono tracking-widest text-content-tertiary uppercase mb-1">Phone</div>
                <div className="text-sm text-content-primary flex items-center gap-1">
                  <Phone className="w-3 h-3 text-content-secondary" /> {challan.customer.mobile}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-[10px] font-mono tracking-widest text-content-tertiary uppercase mb-1">Email</div>
                <div className="text-sm text-content-primary flex items-center gap-1">
                  <Mail className="w-3 h-3 text-content-secondary" /> {challan.customer.email}
                </div>
              </div>
            </div>
          </div>
        </DataPanel>

        {/* Challan Metadata */}
        <DataPanel className="p-6">
          <h3 className="text-sm font-semibold text-content-primary mb-6 flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand" />
            Document Metadata
          </h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-[10px] font-mono tracking-widest text-content-tertiary uppercase mb-1">Challan Number</div>
              <div className="font-mono text-content-primary font-bold">{challan.challanNumber}</div>
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest text-content-tertiary uppercase mb-1">Status</div>
              <div>
                <StatusBadge 
                  status={challan.status} 
                  variant={challan.status === 'CONFIRMED' ? 'success' : challan.status === 'DRAFT' ? 'warning' : 'error'} 
                />
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest text-content-tertiary uppercase mb-1">Created Date</div>
              <div className="text-sm text-content-primary flex items-center gap-1">
                <Calendar className="w-3 h-3 text-content-secondary" />
                {new Date(challan.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest text-content-tertiary uppercase mb-1">Created By</div>
              <div className="text-sm text-content-primary font-medium">{challan.createdBy.name}</div>
            </div>
          </div>
        </DataPanel>
      </div>

      {/* Line Items */}
      <DataPanel className="overflow-visible">
        <div className="p-6 border-b border-line-primary">
          <h3 className="text-sm font-semibold text-content-primary">
            Line Items ({challan.items.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-secondary text-[10px] uppercase tracking-widest font-mono text-content-secondary border-b border-line-secondary">
                <th className="p-4 font-semibold">Product</th>
                <th className="p-4 font-semibold text-center w-24">Qty</th>
                <th className="p-4 font-semibold text-right">Unit Price</th>
                <th className="p-4 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {challan.items.map((item: any) => (
                <tr key={item.id} className="border-b border-line-secondary last:border-0 hover:bg-surface-secondary/50 transition-colors">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-content-primary">{item.productName}</span>
                      <span className="text-[10px] font-mono tracking-widest text-content-tertiary uppercase">{item.sku}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-mono text-sm font-bold text-content-primary bg-surface-secondary px-3 py-1 rounded">
                      {item.quantity}
                    </span>
                  </td>
                  <td className="p-4 text-right font-mono text-sm text-content-secondary">
                    ₹{Number(item.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-right font-mono text-sm font-bold text-content-primary">
                    ₹{Number(item.lineTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="bg-surface-secondary/50 p-6 flex justify-end border-t border-line-primary">
          <div className="flex flex-col items-end gap-1">
            <span className="text-[11px] font-mono tracking-widest uppercase text-content-secondary">Grand Total</span>
            <span className="text-3xl font-mono font-bold text-brand">
              ₹{Number(challan.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </DataPanel>

      {/* Confirmation Modal */}
      <Modal 
        isOpen={isConfirmModalOpen} 
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Sales Challan"
      >
        <div className="flex flex-col gap-4">
          <div className="bg-status-warning/10 border border-status-warning/20 p-4 rounded-lg flex items-start gap-3 text-status-warning">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <strong className="block mb-1">Inventory impact warning!</strong>
              Confirming this challan will permanently deduct <strong>{challan.items.reduce((acc: number, i: any) => acc + i.quantity, 0)}</strong> total items from inventory stock. This action cannot be undone.
            </div>
          </div>
          
          <p className="text-sm text-content-primary font-medium">Are you sure you want to proceed?</p>
          
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)} disabled={confirmMutation.isPending}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirm} isLoading={confirmMutation.isPending}>
              Confirm & Deduct Stock
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal 
        isOpen={isCancelModalOpen} 
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Draft Challan"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-content-secondary">
            Are you sure you want to cancel this draft? It has not affected inventory yet. Cancelled challans cannot be restored.
          </p>
          
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsCancelModalOpen(false)} disabled={cancelMutation.isPending}>
              Keep Draft
            </Button>
            <Button 
              variant="outline" 
              className="text-status-error hover:bg-status-error/10 border-status-error/20"
              onClick={handleCancel} 
              isLoading={cancelMutation.isPending}
            >
              Yes, Cancel It
            </Button>
          </div>
        </div>
      </Modal>

      </div>
      
      {/* Print View */}
      <ChallanPrintView challan={challan} />
    </>
  );
}
