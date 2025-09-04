import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { CredentialCard } from './CredentialCard';
import { CredentialForm } from './CredentialForm';
import { useCredentials } from '@/hooks/useCredentials';
import { useAuth } from '@/hooks/useAuth';
import { Credential, CreateCredential, UpdateCredential } from '@/types/credential';
import { Plus, Search, LogOut, User } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function CredentialsList() {
  const { user, signOut } = useAuth();
  const { credentials, loading, addCredential, updateCredential, deleteCredential } = useCredentials();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredCredentials = credentials.filter(credential =>
    credential.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
    credential.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (credential.email && credential.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddCredential = async (data: CreateCredential) => {
    return await addCredential(data);
  };

  const handleUpdateCredential = async (data: UpdateCredential) => {
    if (!editingCredential) return;
    const result = await updateCredential(editingCredential.id, data);
    if (result?.error === null) {
      setEditingCredential(null);
    }
    return result;
  };

  const handleEdit = (credential: Credential) => {
    setEditingCredential(credential);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      await deleteCredential(deleteId);
      setDeleteId(null);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCredential(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Credentials Manager</h1>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by platform, username, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add Credential
          </Button>
        </div>

        {/* Credentials Grid */}
        {filteredCredentials.length === 0 ? (
          <Card className="p-8">
            <CardContent className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {credentials.length === 0 ? 'No credentials yet' : 'No matching credentials'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {credentials.length === 0 
                  ? 'Start by adding your first credential to keep all your accounts organized.' 
                  : 'Try adjusting your search terms to find what you\'re looking for.'
                }
              </p>
              {credentials.length === 0 && (
                <Button onClick={() => setIsFormOpen(true)} className="mt-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Credential
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCredentials.map((credential) => (
              <CredentialCard
                key={credential.id}
                credential={credential}
                onEdit={handleEdit}
                onDelete={setDeleteId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <CredentialForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingCredential ? handleUpdateCredential : handleAddCredential}
        credential={editingCredential || undefined}
        mode={editingCredential ? 'edit' : 'create'}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the credential
              from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}