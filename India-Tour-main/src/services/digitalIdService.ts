import { supabase } from '../lib/supabase';
import {
  DigitalIDData,
  CreateDigitalIDData,
  UpdateDigitalIDData,
} from '../types/digitalId';

const TABLE_NAME = 'digital_ids';

export const createDigitalID = async (data: CreateDigitalIDData): Promise<{ data: DigitalIDData | null; error: Error | null }> => {
  try {
    const { data: result, error } = await supabase
      .from(TABLE_NAME)
      .insert([data])
      .select()
      .single();

    return { data: result, error: error ? new Error(error.message) : null };
  } catch (error) {
    console.error('Error creating Digital ID:', error);
    return { data: null, error: error as Error };
  }
};

export const getDigitalID = async (id: string): Promise<{ data: DigitalIDData | null; error: Error | null }> => {
  try {
    const { data: result, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data: result, error: null };
  } catch (error) {
    console.error('Error fetching Digital ID:', error);
    return { data: null, error: error as Error };
  }
};

export const getUserDigitalIDs = async (userId: string): Promise<{ data: DigitalIDData[] | null; error: Error | null }> => {
  try {
    const { data: result, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: result, error: null };
  } catch (error) {
    console.error('Error fetching user Digital IDs:', error);
    return { data: null, error: error as Error };
  }
};

export const updateDigitalID = async (
  id: string,
  updates: UpdateDigitalIDData
): Promise<{ data: DigitalIDData | null; error: Error | null }> => {
  try {
    const { data: result, error } = await supabase
      .from(TABLE_NAME)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data: result, error: null };
  } catch (error) {
    console.error('Error updating Digital ID:', error);
    return { data: null, error: error as Error };
  }
};

export const deleteDigitalID = async (id: string): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting Digital ID:', error);
    return { error: error as Error };
  }
};

// Upsert a Digital ID row keyed by user_id without requiring a database
// ON CONFLICT constraint. We first try to update any existing rows for this
// user_id and, if nothing was updated, we insert a fresh record.
export const upsertDigitalIDByUserId = async (
  payload: Omit<DigitalIDData, 'id' | 'created_at' | 'updated_at'>,
): Promise<{ data: DigitalIDData | null; error: Error | null }> => {
  try {
    const { user_id } = payload;

    // Attempt to update an existing record for this user_id
    const { data: updated, error: updateError } = await supabase
      .from(TABLE_NAME)
      .update(payload)
      .eq('user_id', user_id)
      .select();

    if (updateError) throw updateError;

    console.log('[DigitalID service] update result for user_id', user_id, updated);

    if (updated && updated.length > 0) {
      return { data: updated[0] as DigitalIDData, error: null };
    }

    // No existing record updated, so insert a new one
    const { data: inserted, error: insertError } = await supabase
      .from(TABLE_NAME)
      .insert([payload])
      .select()
      .single();

    if (insertError) throw insertError;
    console.log('[DigitalID service] insert result for user_id', user_id, inserted);
    return { data: inserted as DigitalIDData, error: null };
  } catch (error) {
    console.error('Error upserting Digital ID by user_id:', error);
    return { data: null, error: error as Error };
  }
};

// Upsert a Digital ID row keyed by user_id. This will insert a new record for
// the user if none exists yet, or update the existing one when the user edits
// their Safety Digital ID form again. This is more robust than doing a
// separate check-then-insert/update from the client.
export const upsertDigitalIDForUser = async (
  payload: Omit<DigitalIDData, 'id' | 'created_at' | 'updated_at'>,
): Promise<{ data: DigitalIDData | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error upserting Digital ID for user:', error);
    return { data: null, error: error as Error };
  }
};

export const checkIfDigitalIDExists = async (userId: string): Promise<{ exists: boolean; data: DigitalIDData | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is the code for no rows returned
      throw error;
    }

    return { 
      exists: !!data, 
      data: data || null, 
      error: null 
    };
  } catch (error) {
    console.error('Error checking if Digital ID exists:', error);
    return { 
      exists: false, 
      data: null, 
      error: error as Error 
    };
  }
};
