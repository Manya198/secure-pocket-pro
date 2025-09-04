import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Credential, CreateCredential, UpdateCredential } from '@/types/credential';
import { toast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';

export const useCredentials = () => {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCredentials = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('credentials')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCredentials(data || []);
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

    try {
      const { data, error } = await supabase
        .from('credentials')
        .insert({
          ...credential,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setCredentials(prev => [data, ...prev]);
      toast({
        title: "Credential added",
        description: `${credential.platform} credentials saved successfully.`,
      });

      return { data, error: null };
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
    try {
      const { data, error } = await supabase
        .from('credentials')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;

      setCredentials(prev =>
        prev.map(cred => (cred.id === id ? data : cred))
      );

      toast({
        title: "Credential updated",
        description: "Changes saved successfully.",
      });

      return { data, error: null };
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