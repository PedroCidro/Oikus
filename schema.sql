-- ============================================
-- Oikus — Schema do Banco de Dados
-- App de gestão de repúblicas estudantis
-- Supabase project: faifrcousblvebjpijyu
-- ============================================

-- =====================
-- TABELAS
-- =====================

-- 1. Casas (repúblicas)
CREATE TABLE casas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  invite_code      TEXT UNIQUE NOT NULL,
  require_approval BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- 2. Perfis de usuário (vinculados ao Supabase Auth)
CREATE TABLE perfis (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  avatar_url  TEXT,
  house_id    UUID REFERENCES casas(id),
  role        TEXT NOT NULL DEFAULT 'membro' CHECK (role IN ('admin', 'membro')),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 3. Tarefas domésticas
CREATE TABLE tarefas (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id      UUID REFERENCES casas(id) NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  assigned_to   UUID REFERENCES perfis(id),
  due_date      DATE,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'pending_approval', 'completed', 'missed')),
  created_by    UUID REFERENCES perfis(id) NOT NULL,
  is_recurring  BOOLEAN NOT NULL DEFAULT false,
  recurrence_group_id UUID,
  cycle_members BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now(),
  completed_at  TIMESTAMPTZ
);

-- 8. Exclusões do ciclo de revezamento
CREATE TABLE ciclo_exclusoes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id            UUID REFERENCES casas(id) NOT NULL,
  recurrence_group_id UUID NOT NULL,
  user_id             UUID REFERENCES perfis(id) NOT NULL,
  created_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE(recurrence_group_id, user_id)
);

-- 4. Marcas (penalidades por tarefas não cumpridas)
CREATE TABLE marcas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id    UUID REFERENCES casas(id) NOT NULL,
  user_id     UUID REFERENCES perfis(id) NOT NULL,
  todo_id     UUID REFERENCES tarefas(id),
  reason      TEXT NOT NULL,
  given_by    UUID REFERENCES perfis(id),
  month       INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year        INT NOT NULL CHECK (year >= 2024),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 5. Períodos mensais (controle de fechamento)
CREATE TABLE periodos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id      UUID REFERENCES casas(id) NOT NULL,
  month         INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year          INT NOT NULL CHECK (year >= 2024),
  threshold     INT NOT NULL DEFAULT 3,
  finalized     BOOLEAN DEFAULT false,
  finalized_at  TIMESTAMPTZ,
  UNIQUE(house_id, month, year)
);

-- 6. Tribunais (julgamentos de moradores)
CREATE TABLE tribunais (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id    UUID REFERENCES casas(id) NOT NULL,
  accused_id  UUID REFERENCES perfis(id) NOT NULL,
  accuser_id  UUID REFERENCES perfis(id) NOT NULL,
  reason      TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  result      TEXT CHECK (result IN ('guilty', 'innocent')),
  created_at  TIMESTAMPTZ DEFAULT now(),
  closed_at   TIMESTAMPTZ
);

-- 7. Votos dos tribunais
CREATE TABLE votos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_id    UUID REFERENCES tribunais(id) ON DELETE CASCADE NOT NULL,
  voter_id    UUID REFERENCES perfis(id) NOT NULL,
  vote        BOOLEAN NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(trial_id, voter_id)
);

-- =====================
-- ÍNDICES
-- =====================

CREATE INDEX idx_perfis_house ON perfis(house_id);
CREATE INDEX idx_tarefas_house ON tarefas(house_id);
CREATE INDEX idx_tarefas_assigned ON tarefas(assigned_to);
CREATE INDEX idx_tarefas_house_status ON tarefas(house_id, status);
CREATE INDEX idx_tarefas_created_by ON tarefas(created_by);
CREATE INDEX idx_marcas_house_period ON marcas(house_id, year, month);
CREATE INDEX idx_marcas_user_period ON marcas(user_id, year, month);
CREATE INDEX idx_marcas_given_by ON marcas(given_by);
CREATE INDEX idx_marcas_todo ON marcas(todo_id);
CREATE INDEX idx_tribunais_house ON tribunais(house_id);
CREATE INDEX idx_tribunais_accused ON tribunais(accused_id);
CREATE INDEX idx_tribunais_accuser ON tribunais(accuser_id);
CREATE INDEX idx_tribunais_house_status ON tribunais(house_id, status);
CREATE INDEX idx_votos_trial ON votos(trial_id);
CREATE INDEX idx_votos_voter ON votos(voter_id);

-- =====================
-- TRIGGER: criação automática de perfil
-- =====================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.perfis (id, email, name, avatar_url)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================
-- FUNÇÕES AUXILIARES (schema privado)
-- =====================

CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.get_my_house_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT house_id FROM public.perfis WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION private.is_house_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.perfis
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- =====================
-- ROW LEVEL SECURITY
-- =====================

-- Casas
ALTER TABLE casas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "casas_select" ON casas FOR SELECT USING (id = private.get_my_house_id());
CREATE POLICY "casas_select_by_invite" ON casas FOR SELECT USING (invite_code IS NOT NULL AND (select auth.uid()) IS NOT NULL);
CREATE POLICY "casas_insert" ON casas FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL);
CREATE POLICY "casas_update" ON casas FOR UPDATE USING (id = private.get_my_house_id() AND private.is_house_admin());

-- Perfis
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "perfis_select" ON perfis FOR SELECT USING (house_id = private.get_my_house_id() OR id = (select auth.uid()));
CREATE POLICY "perfis_insert" ON perfis FOR INSERT WITH CHECK (id = (select auth.uid()));
CREATE POLICY "perfis_update" ON perfis FOR UPDATE USING (id = (select auth.uid()) OR (house_id = private.get_my_house_id() AND private.is_house_admin()));

-- Tarefas
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tarefas_select" ON tarefas FOR SELECT USING (house_id = private.get_my_house_id());
CREATE POLICY "tarefas_insert" ON tarefas FOR INSERT WITH CHECK (house_id = private.get_my_house_id() AND created_by = (select auth.uid()));
CREATE POLICY "tarefas_update" ON tarefas FOR UPDATE USING (house_id = private.get_my_house_id() AND (assigned_to = (select auth.uid()) OR created_by = (select auth.uid())));
CREATE POLICY "tarefas_delete" ON tarefas FOR DELETE USING (house_id = private.get_my_house_id() AND (created_by = (select auth.uid()) OR private.is_house_admin()));

-- Marcas
ALTER TABLE marcas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "marcas_select" ON marcas FOR SELECT USING (house_id = private.get_my_house_id());
CREATE POLICY "marcas_insert" ON marcas FOR INSERT WITH CHECK (house_id = private.get_my_house_id() AND given_by = (select auth.uid()));
CREATE POLICY "marcas_delete" ON marcas FOR DELETE USING (house_id = private.get_my_house_id() AND private.is_house_admin());

-- Periodos
ALTER TABLE periodos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "periodos_select" ON periodos FOR SELECT USING (house_id = private.get_my_house_id());
CREATE POLICY "periodos_insert" ON periodos FOR INSERT WITH CHECK (house_id = private.get_my_house_id() AND private.is_house_admin());
CREATE POLICY "periodos_update" ON periodos FOR UPDATE USING (house_id = private.get_my_house_id() AND private.is_house_admin());

-- Tribunais
ALTER TABLE tribunais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tribunais_select" ON tribunais FOR SELECT USING (house_id = private.get_my_house_id());
CREATE POLICY "tribunais_insert" ON tribunais FOR INSERT WITH CHECK (house_id = private.get_my_house_id() AND accuser_id = (select auth.uid()));
CREATE POLICY "tribunais_update" ON tribunais FOR UPDATE USING (house_id = private.get_my_house_id() AND private.is_house_admin());

-- Votos
ALTER TABLE votos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "votos_select" ON votos FOR SELECT USING (EXISTS (SELECT 1 FROM tribunais t WHERE t.id = votos.trial_id AND t.house_id = private.get_my_house_id()));
CREATE POLICY "votos_insert" ON votos FOR INSERT WITH CHECK (voter_id = (select auth.uid()) AND EXISTS (SELECT 1 FROM tribunais t WHERE t.id = votos.trial_id AND t.house_id = private.get_my_house_id() AND t.status = 'open'));
