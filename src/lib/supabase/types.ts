export type Casa = {
  id: string;
  name: string;
  invite_code: string;
  require_approval: boolean;
  created_at: string;
};

export type Perfil = {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  house_id: string | null;
  role: "admin" | "membro";
  created_at: string;
};

export type Tarefa = {
  id: string;
  house_id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  due_date: string | null;
  status: "pending" | "pending_approval" | "completed" | "missed";
  created_by: string;
  assigned_pool: string[];
  is_recurring: boolean;
  recurrence_group_id: string | null;
  cycle_members: boolean;
  created_at: string;
  completed_at: string | null;
};

export type Marca = {
  id: string;
  house_id: string;
  user_id: string;
  todo_id: string | null;
  reason: string;
  given_by: string | null;
  month: number;
  year: number;
  created_at: string;
};

export type Periodo = {
  id: string;
  house_id: string;
  month: number;
  year: number;
  threshold: number;
  finalized: boolean;
  finalized_at: string | null;
};

export type Tribunal = {
  id: string;
  house_id: string;
  accused_id: string;
  accuser_id: string;
  reason: string;
  status: "open" | "closed";
  result: "guilty" | "innocent" | null;
  created_at: string;
  closed_at: string | null;
};

export type Voto = {
  id: string;
  trial_id: string;
  voter_id: string;
  vote: boolean;
  created_at: string;
};

export type CicloExclusao = {
  id: string;
  house_id: string;
  recurrence_group_id: string;
  user_id: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      casas: {
        Row: Casa;
        Insert: Partial<Casa> & Pick<Casa, "name" | "invite_code">;
        Update: Partial<Casa>;
        Relationships: [];
      };
      perfis: {
        Row: Perfil;
        Insert: Partial<Perfil> & Pick<Perfil, "id" | "name" | "email">;
        Update: Partial<Perfil>;
        Relationships: [];
      };
      tarefas: {
        Row: Tarefa;
        Insert: Partial<Tarefa> & Pick<Tarefa, "house_id" | "title" | "created_by">;
        Update: Partial<Tarefa>;
        Relationships: [];
      };
      marcas: {
        Row: Marca;
        Insert: Partial<Marca> & Pick<Marca, "house_id" | "user_id" | "reason" | "month" | "year">;
        Update: Partial<Marca>;
        Relationships: [];
      };
      periodos: {
        Row: Periodo;
        Insert: Partial<Periodo> & Pick<Periodo, "house_id" | "month" | "year">;
        Update: Partial<Periodo>;
        Relationships: [];
      };
      tribunais: {
        Row: Tribunal;
        Insert: Partial<Tribunal> & Pick<Tribunal, "house_id" | "accused_id" | "accuser_id" | "reason">;
        Update: Partial<Tribunal>;
        Relationships: [];
      };
      votos: {
        Row: Voto;
        Insert: Partial<Voto> & Pick<Voto, "trial_id" | "voter_id" | "vote">;
        Update: Partial<Voto>;
        Relationships: [];
      };
      ciclo_exclusoes: {
        Row: CicloExclusao;
        Insert: Partial<CicloExclusao> & Pick<CicloExclusao, "house_id" | "recurrence_group_id" | "user_id">;
        Update: Partial<CicloExclusao>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
