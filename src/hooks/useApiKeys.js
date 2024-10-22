import { useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export function useApiKeys() {
  const [apiKeys, setApiKeys] = useState([]);

  const fetchApiKeys = useCallback(async () => {
    const { data, error } = await supabase.from('api_keys').select('*');
    if (error) {
      console.error('Error fetching API keys:', error);
      return { error: 'Error fetching API keys. Please try again.' };
    }
    setApiKeys(data || []);
    return { data };
  }, []);

  const createApiKey = useCallback(async (name) => {
    const key = 'dandi-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const { data, error } = await supabase
      .from('api_keys')
      .insert([{ name, key }])
      .select();

    if (error) {
      console.error('Error creating API key:', error);
      return { error: 'Error creating API key. Please try again.' };
    }
    setApiKeys(prev => [...prev, data[0]]);
    return { data: data[0] };
  }, []);

  const updateApiKey = useCallback(async (id, name) => {
    const { data, error } = await supabase
      .from('api_keys')
      .update({ name })
      .eq('id', id);

    if (error) {
      console.error('Error updating API key:', error);
      return { error: 'Failed to update API key' };
    }
    await fetchApiKeys();
    return { data };
  }, [fetchApiKeys]);

  const deleteApiKey = useCallback(async (id) => {
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting API key:', error);
      return { error: 'Failed to delete API key' };
    }
    await fetchApiKeys();
    return { success: true };
  }, [fetchApiKeys]);

  return {
    apiKeys,
    fetchApiKeys,
    createApiKey,
    updateApiKey,
    deleteApiKey,
  };
}
