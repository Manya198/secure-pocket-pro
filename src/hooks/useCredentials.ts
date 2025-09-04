import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Credential, CreateCredential, UpdateCredential } from '@/types/credential';
import { toast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';
import { encryptData, decryptData, getMasterKey } from '@/lib/encryption';

export const useCredentials = () => {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCredentials = async () => {
    if (!user) return;

    const masterKey = getMasterKey();
    if (!masterKey) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('credentials')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Decrypt passwords before setting state
      const decryptedCredentials = (data || []).map(cred => ({
        ...cred,
        password: decryptData(cred.password, masterKey),
      }));
      
      setCredentials(decryptedCredentials);
    } catch (error: any) {
      toast({
        title: "Error fetching credentials",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCredentials();
    } else {
      setCredentials([]);
    }
  }, [user]);

  const addCredential = async (credential: CreateCredential) => {
    if (!user) return;

    const masterKey = getMasterKey();
    if (!masterKey) {
      toast({
        title: "Master password required",
        description: "Please unlock your credentials first.",
        variant: "destructive",
      });
      return { data: null, error: new Error('Master password required') };
    }

    try {
      // Encrypt password before storing
      const encryptedCredential = {
        ...credential,
        password: encryptData(credential.password, masterKey),
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('credentials')
        .insert(encryptedCredential)
        .select()
        .single();

      if (error) throw error;

      // Add decrypted version to local state
      const decryptedData = {
        ...data,
        password: credential.password, // Use original unencrypted password for local state
      };

      setCredentials(prev => [decryptedData, ...prev]);
      toast({
        title: "Credential added",
        description: `${credential.platform} credentials saved successfully.`,
      });

      return { data: decryptedData, error: null };
    } catch (error: any) {
      toast({
        title: "Error adding credential",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateCredential = async (id: string, updates: UpdateCredential) => {
    const masterKey = getMasterKey();
    if (!masterKey) {
      toast({
        title: "Master password required",
        description: "Please unlock your credentials first.",
        variant: "destructive",
      });
      return { data: null, error: new Error('Master password required') };
    }

    try {
      // Encrypt password if it's being updated
      const encryptedUpdates = {
        ...updates,
        ...(updates.password && { password: encryptData(updates.password, masterKey) }),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('credentials')
        .update(encryptedUpdates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;

      // Decrypt for local state
      const decryptedData = {
        ...data,
        password: decryptData(data.password, masterKey),
      };

      setCredentials(prev =>
        prev.map(cred => (cred.id === id ? decryptedData : cred))
      );

      toast({
        title: "Credential updated",
        description: "Changes saved successfully.",
      });

      return { data: decryptedData, error: null };
    } catch (error: any) {
      toast({
        title: "Error updating credential",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deleteCredential = async (id: string) => {
    try {
      const { error } = await supabase
        .from('credentials')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setCredentials(prev => prev.filter(cred => cred.id !== id));
      toast({
        title: "Credential deleted",
        description: "Credential removed successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting credential",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    credentials,
    loading,
    addCredential,
    updateCredential,
    deleteCredential,
    refetch: fetchCredentials,
  };
};