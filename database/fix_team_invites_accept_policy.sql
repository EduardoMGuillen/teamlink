-- ============================================
-- Fix: Permitir que el invitado pueda añadirse
--      al equipo al aceptar una invitación
--
-- Contexto:
-- - Actualmente solo managers/leads pueden insertar en team_members
--   (ver fix_team_members_insert_policy.sql).
-- - Cuando un usuario acepta una invitación por email desde la vista
--   de Teams, el cliente hace:
--     1) UPDATE team_invites SET status = 'accepted'
--     2) INSERT en team_members (teamsService.addMember)
-- - Ese INSERT falla por RLS porque el invitado todavía no es miembro
--   y no cumple la condición de manager/lead.
--
-- Este script amplía la política para que:
--   - Managers / leads sigan pudiendo agregar miembros (Approve join requests)
--   - El usuario invitado pueda agregarse a sí mismo cuando existe una
--     invitación ACCEPTED para ese team.
--
-- Ejecutar en Supabase SQL Editor UNA sola vez.
-- ============================================

-- Borrar la política previa (si existe)
DROP POLICY IF EXISTS "Managers and leads can add team members" ON team_members;

-- Crear política combinada:
-- 1) managers/leads pueden insertar miembros en sus equipos
-- 2) el usuario invitado puede insertarse a sí mismo si hay una invitación accepted
CREATE POLICY "Managers, leads or accepted invitees can add team members"
ON team_members
FOR INSERT
WITH CHECK (
  -- Caso 1: manager/lead del equipo
  team_id IN (
    SELECT tm.team_id
    FROM team_members tm
    WHERE tm.user_id = auth.uid()
      AND tm.role IN ('manager', 'lead')
  )
  OR
  -- Caso 2: usuario con invitación accepted a este equipo
  EXISTS (
    SELECT 1
    FROM team_invites ti
    WHERE ti.team_id = team_members.team_id
      AND ti.invitee_user_id = auth.uid()
      AND ti.status = 'accepted'
  )
);

