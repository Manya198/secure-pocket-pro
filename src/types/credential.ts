export interface Credential {
  id: string;
  user_id: string;
  platform: string;
  username: string;
  password: string;
  email?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type CreateCredential = {
  platform: string;
  username: string;
  password: string;
  email?: string;
  notes?: string;
};

export type UpdateCredential = Partial<CreateCredential>;