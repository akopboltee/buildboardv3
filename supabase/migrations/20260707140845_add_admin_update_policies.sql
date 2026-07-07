-- Add RLS policy for admin to update reports (resolve/dismiss)
CREATE POLICY "admin updates reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND role = 'superadmin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND role = 'superadmin'
    )
  );

-- Add RLS policy for admin to update warnings
DROP POLICY IF EXISTS "Superadmins can manage all warnings" ON warnings;

CREATE POLICY "admin_select_warnings"
  ON warnings FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND role = 'superadmin'
    )
  );

CREATE POLICY "admin_insert_warnings"
  ON warnings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND role = 'superadmin'
    )
  );

CREATE POLICY "admin_delete_warnings"
  ON warnings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND role = 'superadmin'
    )
  );