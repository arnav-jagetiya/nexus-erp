import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Building2, Phone, Mail, FileText, 
  MapPin, Clock, Calendar, CheckCircle2, Building, Send
} from 'lucide-react';
import { useCustomer, useCustomerFollowUps, useCreateCustomerFollowUp } from '../../hooks/useCustomers';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Skeleton } from '../../components/ui/Skeleton';
import { DataPanel } from '../../components/ui/DataPanel';
import { extractErrorMessage } from '../../utils/errorHandling';

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: customer, isLoading, isError } = useCustomer(id!);
  const { data: followUps = [] } = useCustomerFollowUps(id!);
  const { mutateAsync: createFollowUp, isPending: isAddingNote } = useCreateCustomerFollowUp();

  const [newNote, setNewNote] = useState('');
  const [newFollowUpDate, setNewFollowUpDate] = useState('');
  const [noteError, setNoteError] = useState<string | null>(null);

  const canEdit = user?.role === 'ADMIN' || user?.role === 'SALES';

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
        <Skeleton className="h-8 w-24 mb-4" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full md:col-span-2" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <div className="p-8 text-center text-status-error flex flex-col items-center">
        Failed to load customer details.
        <Button variant="outline" className="mt-4" onClick={() => navigate('/app/customers')}>Return to List</Button>
      </div>
    );
  }

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNoteError(null);

    try {
      await createFollowUp({
        id: id!,
        note: newNote,
        followUpDate: newFollowUpDate ? new Date(newFollowUpDate).toISOString() : null,
      });
      setNewNote('');
      setNewFollowUpDate('');
    } catch (err: any) {
      setNoteError(extractErrorMessage(err, 'Failed to add note'));
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => navigate('/app/customers')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back
        </Button>
        {canEdit && (
          <Button variant="primary" size="sm" onClick={() => navigate(`/app/customers/${id}/edit`)} leftIcon={<Edit className="w-4 h-4" />}>
            Edit Customer
          </Button>
        )}
      </div>

      {/* Header Profile */}
      <DataPanel className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-l-4 border-l-brand">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-content-primary">{customer.name}</h1>
            <StatusBadge 
              status={customer.status} 
              variant={customer.status === 'ACTIVE' ? 'success' : customer.status === 'INACTIVE' ? 'error' : 'info'} 
            />
          </div>
          <div className="flex items-center gap-2 text-content-secondary text-sm">
            <Building2 className="w-4 h-4" />
            <span className="font-semibold">{customer.businessName}</span>
            <span className="text-content-tertiary px-2">•</span>
            <span className="uppercase tracking-widest text-xs font-mono">{customer.customerType}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-surface-secondary px-4 py-3 rounded-lg border border-line-secondary">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-mono tracking-widest text-content-tertiary">Customer Since</span>
            <span className="text-sm font-semibold text-content-primary">{new Date(customer.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </DataPanel>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <DataPanel className="p-6">
            <h3 className="text-sm font-semibold text-content-primary mb-4 flex items-center gap-2">
              <Building className="w-4 h-4 text-content-secondary" /> Business & Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-content-tertiary font-mono uppercase">Email Address</span>
                <span className="text-sm font-medium text-content-primary flex items-center gap-2">
                  <Mail className="w-4 h-4 text-content-secondary" /> {customer.email}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-content-tertiary font-mono uppercase">Mobile Number</span>
                <span className="text-sm font-medium text-content-primary flex items-center gap-2">
                  <Phone className="w-4 h-4 text-content-secondary" /> {customer.mobile}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-content-tertiary font-mono uppercase">GST Number</span>
                <span className="text-sm font-medium text-content-primary flex items-center gap-2">
                  <FileText className="w-4 h-4 text-content-secondary" /> {customer.gstNumber || 'Not provided'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-content-tertiary font-mono uppercase">Address</span>
                <span className="text-sm font-medium text-content-primary flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-content-secondary mt-0.5 shrink-0" /> 
                  <span className="leading-relaxed">{customer.address}</span>
                </span>
              </div>
            </div>
            
            {customer.notes && (
              <div className="mt-6 pt-6 border-t border-line-secondary">
                <span className="text-xs text-content-tertiary font-mono uppercase block mb-2">Customer Notes</span>
                <p className="text-sm text-content-primary leading-relaxed bg-surface-secondary p-4 rounded-md border border-line-secondary">
                  {customer.notes}
                </p>
              </div>
            )}
          </DataPanel>

          {/* Placeholders for Related Records */}
          <DataPanel className="flex items-center justify-center p-12 border-dashed border-line-secondary bg-surface-primary/30">
            <div className="flex flex-col items-center opacity-60 text-center max-w-sm">
              <FileText className="w-8 h-8 mb-4 text-content-tertiary" />
              <span className="font-mono text-xs font-semibold tracking-widest uppercase text-content-primary mb-2">No Challans Yet</span>
              <span className="text-xs text-content-tertiary leading-relaxed">Sales challans linked to this customer will appear here once generated.</span>
            </div>
          </DataPanel>
        </div>

        {/* Right Column: CRM / Follow-ups */}
        <div className="flex flex-col gap-6">
          <DataPanel className="p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-line-primary">
              <h3 className="text-sm font-semibold text-content-primary flex items-center gap-2">
                <Clock className="w-4 h-4 text-content-secondary" /> Activity & Follow-ups
              </h3>
              {customer.followUpDate && (
                <div className="flex items-center gap-1.5 text-[11px] font-mono bg-brand/10 text-brand px-2 py-1 rounded">
                  <Calendar className="w-3 h-3" />
                  Due: {new Date(customer.followUpDate).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar max-h-[400px]">
              {followUps.length === 0 ? (
                <div className="py-8 text-center text-content-tertiary text-sm">
                  No activity recorded yet.
                </div>
              ) : (
                followUps.map(f => (
                  <div key={f.id} className="relative flex flex-col gap-2 p-4 pl-5 rounded-md bg-surface-secondary border border-line-secondary">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand rounded-l-md opacity-70" />
                    <p className="text-sm text-content-primary leading-relaxed">{f.note}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-line-primary/30">
                      <span className="text-[10px] text-content-tertiary font-mono tracking-wider">BY {f.createdBy}</span>
                      <span className="text-[10px] text-content-tertiary font-mono tracking-wider">{new Date(f.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {canEdit && (
              <form onSubmit={handleAddNote} className="mt-4 pt-4 border-t border-line-primary flex flex-col gap-3">
                {noteError && (
                  <p className="text-xs text-status-error font-medium">{noteError}</p>
                )}
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a new activity note..."
                  className="w-full rounded-md border border-line-primary bg-surface-secondary px-3 py-2 text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-brand/50 resize-none"
                  rows={2}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="datetime-local"
                    value={newFollowUpDate}
                    onChange={(e) => setNewFollowUpDate(e.target.value)}
                    className="flex-1 rounded-md border border-line-primary bg-surface-secondary px-2 py-1.5 text-xs text-content-primary focus:outline-none focus:ring-1 focus:ring-brand/50"
                  />
                  <Button type="submit" variant="primary" size="sm" disabled={!newNote.trim() || isAddingNote}>
                    <Send className="w-3 h-3" />
                  </Button>
                </div>
              </form>
            )}
          </DataPanel>
        </div>
      </div>
    </div>
  );
}
