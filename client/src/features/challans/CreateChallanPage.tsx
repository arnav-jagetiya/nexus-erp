import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FilePlus } from 'lucide-react';
import { useCreateChallan } from '../../hooks/useChallans';
import { useNotification } from '../../hooks/useNotification';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { ChallanForm, ChallanFormValues } from './ChallanForm';

export function CreateChallanPage() {
  const navigate = useNavigate();
  const createMutation = useCreateChallan();
  const notify = useNotification();

  const handleSubmit = (data: ChallanFormValues) => {
    createMutation.mutate(data, {
      onSuccess: (response) => {
        notify.success('Draft challan created');
        navigate(`/app/challans/${response.id}`);
      },
      onError: (error: any) => {
        // Form-level error is handled inside ChallanForm, but we can notify if it's generic
        const msg = error.response?.data?.error?.message || 'Failed to create challan';
        if (!error.response?.data?.error?.details) {
          notify.error(msg);
        }
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/challans')} className="text-content-secondary">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to List
        </Button>
      </div>

      <PageHeader 
        title="Create Sales Challan" 
        description="Create a new draft sales challan. Stock will only be deducted upon confirmation."
        icon={<FilePlus className="w-6 h-6" />}
      />

      <ChallanForm 
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        onCancel={() => navigate('/app/challans')}
      />
    </div>
  );
}
