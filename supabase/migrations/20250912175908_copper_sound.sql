/*
  # Schema del Sistema Punto Frío Beto

  1. New Tables
    - `productos`
      - `id` (uuid, primary key)
      - `nombre` (text)
      - `descripcion` (text)
      - `precio` (decimal)
      - `stock` (integer)
      - `categoria` (text)
      - `codigo_barras` (text)
      - `activo` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `ventas`
      - `id` (uuid, primary key)
      - `usuario_id` (uuid, foreign key)
      - `total` (decimal)
      - `fecha_venta` (timestamp)
      - `metodo_pago` (text)
      - `created_at` (timestamp)
    
    - `detalles_venta`
      - `id` (uuid, primary key)
      - `venta_id` (uuid, foreign key)
      - `producto_id` (uuid, foreign key)
      - `cantidad` (integer)
      - `precio_unitario` (decimal)
      - `subtotal` (decimal)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Crear tabla productos
CREATE TABLE IF NOT EXISTS productos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text DEFAULT '',
  precio decimal(10,2) NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  categoria text DEFAULT 'General',
  codigo_barras text UNIQUE,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla ventas
CREATE TABLE IF NOT EXISTS ventas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES auth.users(id),
  total decimal(10,2) NOT NULL DEFAULT 0,
  fecha_venta timestamptz DEFAULT now(),
  metodo_pago text DEFAULT 'efectivo',
  created_at timestamptz DEFAULT now()
);

-- Crear tabla detalles_venta
CREATE TABLE IF NOT EXISTS detalles_venta (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venta_id uuid REFERENCES ventas(id) ON DELETE CASCADE,
  producto_id uuid REFERENCES productos(id),
  cantidad integer NOT NULL DEFAULT 1,
  precio_unitario decimal(10,2) NOT NULL DEFAULT 0,
  subtotal decimal(10,2) NOT NULL DEFAULT 0
);

-- Habilitar RLS
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalles_venta ENABLE ROW LEVEL SECURITY;

-- Políticas para productos
CREATE POLICY "Usuarios autenticados pueden ver productos"
  ON productos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear productos"
  ON productos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar productos"
  ON productos FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar productos"
  ON productos FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para ventas
CREATE POLICY "Usuarios pueden ver sus ventas"
  ON ventas FOR SELECT
  TO authenticated
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden crear ventas"
  ON ventas FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = usuario_id);

-- Políticas para detalles_venta
CREATE POLICY "Usuarios pueden ver detalles de sus ventas"
  ON detalles_venta FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ventas 
      WHERE ventas.id = detalles_venta.venta_id 
      AND ventas.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden crear detalles de venta"
  ON detalles_venta FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ventas 
      WHERE ventas.id = detalles_venta.venta_id 
      AND ventas.usuario_id = auth.uid()
    )
  );

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en productos
CREATE TRIGGER update_productos_updated_at
    BEFORE UPDATE ON productos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();