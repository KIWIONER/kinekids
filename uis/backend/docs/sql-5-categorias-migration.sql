-- KineKids: Migración para 5 Categorías Dinámicas y app_config
-- Ejecutar en el SQL Editor de Supabase (https://supabase.com/dashboard/project/ybqzcxabblyzqhezanaf/sql):

-- 1. Actualizar Check Constraint en la tabla products para admitir las 5 categorías oficiales
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE public.products ADD CONSTRAINT products_category_check 
  CHECK (category IN ('set', 'module', 'furniture', 'nursery', 'accessory'));

-- 2. Crear tabla app_config para persistencia de orden de categorías y configuraciones globales
CREATE TABLE IF NOT EXISTS public.app_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS y permitir lectura/escritura pública
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read app_config" ON public.app_config;
CREATE POLICY "Allow public read app_config" ON public.app_config
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert/update app_config" ON public.app_config;
CREATE POLICY "Allow public insert/update app_config" ON public.app_config
  FOR ALL USING (true);

-- 3. Insertar orden inicial de categorías
INSERT INTO public.app_config (key, value)
VALUES ('category_order', '["set", "module", "furniture", "nursery", "accessory"]'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
