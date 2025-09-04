import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/auth/AuthForm';
import { CredentialsList } from '@/components/credentials/CredentialsList';
import { MasterPasswordDialog } from '@/components/auth/MasterPasswordDialog';
import { getMasterKey } from '@/lib/encryption';

const Index = () => {
  const { user, loading } = useAuth();
  const [masterPasswordUnlocked, setMasterPasswordUnlocked] = useState(false);

  useEffect(() => {
    if (user) {
      // Check if master key is already set
      const masterKey = getMasterKey();
      setMasterPasswordUnlocked(!!masterKey);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <>
      <CredentialsList />
      <MasterPasswordDialog
        isOpen={!masterPasswordUnlocked}
        onUnlock={() => setMasterPasswordUnlocked(true)}
      />
    </>
  );
};

export default Index;
