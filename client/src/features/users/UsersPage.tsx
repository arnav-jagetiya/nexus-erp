import React, { useEffect, useState } from 'react';
import { Shield, ShieldAlert, CheckCircle, XCircle, Ban, Power, Settings2, Search, Filter, Users } from 'lucide-react';
import { usersApi, UserListDTO } from '../../api/users';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { MetricPanel } from '../../components/ui/MetricPanel';
import { DataPanel } from '../../components/ui/DataPanel';
import { CommandBar } from '../../components/ui/CommandBar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { extractErrorMessage } from '../../utils/errorHandling';

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const notify = useNotification();
  const [users, setUsers] = useState<UserListDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog State
  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean;
    type: 'suspend' | 'reactivate' | 'revoke' | 'revokeAdmin' | null;
    userId: string | null;
    title: string;
    description: string;
  }>({
    isOpen: false,
    type: null,
    userId: null,
    title: '',
    description: ''
  });

  const [dialogInput, setDialogInput] = useState('');
  const [dialogRoleSelect, setDialogRoleSelect] = useState('SALES');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await usersApi.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Failed to fetch users'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const closeDialog = () => {
    setDialogConfig({ ...dialogConfig, isOpen: false, type: null, userId: null });
    setDialogInput('');
    setIsSubmitting(false);
  };

  const openDialog = (type: typeof dialogConfig.type, user: UserListDTO) => {
    let title = '';
    let description = '';
    
    if (type === 'suspend') {
      title = `Suspend ${user.name}`;
      description = `Temporarily disable access for this user. They will be immediately logged out. Please provide a reason.`;
    } else if (type === 'reactivate') {
      title = `Restore Access for ${user.name}`;
      description = `Restore access for this user. Their suspension or revocation will be lifted.`;
    } else if (type === 'revoke') {
      title = `Revoke Access for ${user.name}`;
      description = `Permanently disable access for this user. This is a severe action. Please provide a reason.`;
    } else if (type === 'revokeAdmin') {
      title = `Revoke Administrator Privileges for ${user.name}`;
      description = `Remove administrator access. You must assign them a new operational role.`;
    }

    setDialogConfig({ isOpen: true, type, userId: user.id, title, description });
    setDialogInput('');
    setDialogRoleSelect('SALES');
  };

  const handleDialogConfirm = async () => {
    if (!dialogConfig.userId || !dialogConfig.type) return;
    setIsSubmitting(true);
    
    try {
      if (dialogConfig.type === 'suspend') {
        if (!dialogInput.trim()) throw new Error('Suspension reason is required');
        await usersApi.suspendUser(dialogConfig.userId, { reason: dialogInput });
        notify.success('User suspended', 'User access has been temporarily disabled.');
      } else if (dialogConfig.type === 'reactivate') {
        await usersApi.reactivateUser(dialogConfig.userId);
        notify.success('Access restored', 'User access has been restored.');
      } else if (dialogConfig.type === 'revoke') {
        if (!dialogInput.trim()) throw new Error('Revocation reason is required');
        await usersApi.revokeUser(dialogConfig.userId, { reason: dialogInput });
        notify.success('Access revoked', 'User access has been permanently disabled.');
      } else if (dialogConfig.type === 'revokeAdmin') {
        await usersApi.revokeAdmin(dialogConfig.userId, { newRole: dialogRoleSelect, reason: dialogInput });
        notify.success('Admin revoked', 'Administrator privileges removed.');
      }
      await fetchUsers();
      closeDialog();
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Action failed'));
      closeDialog();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await usersApi.approveUser(id);
      notify.success('User approved', 'User has been granted access.');
      fetchUsers();
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Failed to approve user'));
    }
  };

  const handleReject = async (id: string) => {
    try {
      await usersApi.rejectUser(id);
      notify.success('User rejected', 'The request has been rejected.');
      fetchUsers();
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Failed to reject user'));
    }
  };

  const pendingCount = users.filter((u) => u.approvalStatus === 'PENDING').length;
  const activeCount = users.filter((u) => u.status === 'ACTIVE').length;
  const suspendedCount = users.filter((u) => u.status === 'SUSPENDED').length;
  const revokedCount = users.filter((u) => u.status === 'REVOKED').length;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full">
      <PageHeader 
        title="Access Command Center" 
        description="Manage workspace access, operational roles, and administrator approvals."
        icon={<Shield className="w-6 h-6" />}
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricPanel label="Total Users" value={users.length} icon={<Users className="w-5 h-5" />} />
        <MetricPanel label="Active Accounts" value={activeCount} icon={<CheckCircle className="w-5 h-5" />} trend="up" />
        <MetricPanel label="Pending Approvals" value={pendingCount} icon={<ShieldAlert className="w-5 h-5" />} trend={pendingCount > 0 ? 'down' : 'neutral'} />
        <MetricPanel label="Suspended/Revoked" value={suspendedCount + revokedCount} icon={<Ban className="w-5 h-5" />} trend="neutral" />
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-status-error/10 border border-status-error/20 text-status-error text-sm">
          {error}
        </div>
      )}

      {/* Main Data Panel */}
      <DataPanel>
        <CommandBar>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" />
              <input 
                type="text" 
                placeholder="Search users..." 
                className="w-full pl-9 pr-4 py-2 bg-surface-secondary border border-line-secondary rounded-md text-sm text-content-primary focus:outline-none focus:border-brand/50 transition-colors"
              />
            </div>
            <Button variant="outline" leftIcon={<Filter className="w-4 h-4" />}>
              Filter
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-content-secondary font-mono">
            <span>{users.length} Records</span>
          </div>
        </CommandBar>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User / Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Account Status</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-content-tertiary py-8">Loading records...</TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-content-tertiary py-8">No users found.</TableCell>
                </TableRow>
              ) : (
                users.map((row) => {
                  const isSelf = row.id === currentUser?.id;
                  
                  return (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-content-primary flex items-center gap-2">
                            {row.name}
                            {isSelf && <span className="text-[10px] bg-brand-subtle text-brand px-1.5 rounded uppercase font-bold tracking-wider">You</span>}
                          </span>
                          <span className="text-xs text-content-tertiary font-mono">{row.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold tracking-wider ${row.role === 'ADMIN' ? 'text-brand' : 'text-content-secondary'}`}>
                            {row.role}
                          </span>
                          {row.isPrimaryAdmin && (
                            <StatusBadge status="PRIMARY ADMIN" variant="info" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge 
                          status={row.status} 
                          variant={row.status === 'ACTIVE' ? 'success' : row.status === 'SUSPENDED' ? 'warning' : 'error'} 
                        />
                        {row.status === 'SUSPENDED' && row.suspensionReason && (
                          <div className="text-[10px] text-content-tertiary mt-1 max-w-[200px] truncate">
                            {row.suspensionReason}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {row.approvalStatus === 'PENDING' ? (
                          <StatusBadge status="PENDING" variant="warning" />
                        ) : row.approvalStatus === 'REJECTED' ? (
                          <StatusBadge status="REJECTED" variant="error" />
                        ) : (
                          <span className="text-content-tertiary text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {row.approvalStatus === 'PENDING' ? (
                            <>
                              <Button size="sm" variant="outline" className="text-status-success hover:bg-status-success/10 border-status-success/20" leftIcon={<CheckCircle className="w-3.5 h-3.5" />} onClick={() => handleApprove(row.id)}>
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" className="text-status-error hover:bg-status-error/10 border-status-error/20" leftIcon={<XCircle className="w-3.5 h-3.5" />} onClick={() => handleReject(row.id)}>
                                Reject
                              </Button>
                            </>
                          ) : row.isPrimaryAdmin ? (
                            <span className="text-[10px] font-bold text-brand uppercase tracking-widest bg-brand/10 px-2 py-1 rounded">Protected</span>
                          ) : isSelf ? (
                            <span className="text-[10px] font-bold text-content-tertiary uppercase tracking-widest bg-surface-secondary px-2 py-1 rounded">Current Session</span>
                          ) : (
                            <>
                              {row.status === 'ACTIVE' && (
                                <Button size="sm" variant="outline" className="text-status-warning hover:bg-status-warning/10 border-status-warning/20" leftIcon={<Ban className="w-3.5 h-3.5" />} onClick={() => openDialog('suspend', row)}>
                                  Suspend
                                </Button>
                              )}
                              {(row.status === 'SUSPENDED' || row.status === 'REVOKED') && (
                                <Button size="sm" variant="outline" className="text-status-success hover:bg-status-success/10 border-status-success/20" leftIcon={<Power className="w-3.5 h-3.5" />} onClick={() => openDialog('reactivate', row)}>
                                  Restore Access
                                </Button>
                              )}
                              {row.role === 'ADMIN' && row.status === 'ACTIVE' && (
                                <Button size="sm" variant="outline" className="text-status-error hover:bg-status-error/10 border-status-error/20" leftIcon={<Settings2 className="w-3.5 h-3.5" />} onClick={() => openDialog('revokeAdmin', row)}>
                                  Revoke Admin
                                </Button>
                              )}
                              {row.status !== 'REVOKED' && (
                                <Button size="sm" variant="danger" leftIcon={<XCircle className="w-3.5 h-3.5" />} onClick={() => openDialog('revoke', row)}>
                                  Revoke Access
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </DataPanel>

      <ConfirmationDialog
        isOpen={dialogConfig.isOpen}
        title={dialogConfig.title}
        description={dialogConfig.description}
        onConfirm={handleDialogConfirm}
        onCancel={closeDialog}
        isDangerous={dialogConfig.type === 'revoke' || dialogConfig.type === 'revokeAdmin' || dialogConfig.type === 'suspend'}
        isLoading={isSubmitting}
        confirmLabel={dialogConfig.type === 'reactivate' ? 'Restore Access' : 'Confirm'}
      >
        {(dialogConfig.type === 'suspend' || dialogConfig.type === 'revoke') && (
          <div className="mt-4">
            <label className="block text-xs font-semibold text-content-secondary uppercase tracking-wider mb-2">Reason</label>
            <input 
              type="text" 
              value={dialogInput}
              onChange={(e) => setDialogInput(e.target.value)}
              placeholder={`Enter reason for ${dialogConfig.type}...`}
              className="w-full bg-surface-secondary border border-line-secondary rounded px-3 py-2 text-sm text-content-primary focus:outline-none focus:border-brand/50 transition-colors"
              autoFocus
            />
          </div>
        )}

        {dialogConfig.type === 'revokeAdmin' && (
          <div className="mt-4 flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-content-secondary uppercase tracking-wider mb-2">New Operational Role</label>
              <select 
                value={dialogRoleSelect}
                onChange={(e) => setDialogRoleSelect(e.target.value)}
                className="w-full bg-surface-secondary border border-line-secondary rounded px-3 py-2 text-sm text-content-primary focus:outline-none focus:border-brand/50"
              >
                <option value="SALES">SALES</option>
                <option value="WAREHOUSE">WAREHOUSE</option>
                <option value="ACCOUNTS">ACCOUNTS</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-content-secondary uppercase tracking-wider mb-2">Reason (Optional)</label>
              <input 
                type="text" 
                value={dialogInput}
                onChange={(e) => setDialogInput(e.target.value)}
                placeholder="Internal note for demotion..."
                className="w-full bg-surface-secondary border border-line-secondary rounded px-3 py-2 text-sm text-content-primary focus:outline-none focus:border-brand/50 transition-colors"
              />
            </div>
          </div>
        )}
      </ConfirmationDialog>
    </div>
  );
}
