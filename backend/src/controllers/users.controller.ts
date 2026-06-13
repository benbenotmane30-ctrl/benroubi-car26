/**
 * Users Controller — Endpoints CRUD pour les admin users + /me.
 *
 * Sécurité :
 *   - /api/admin/me/*       : require auth (n'importe quel user connecté)
 *   - /api/admin/users/*    : require Super Admin (sauf GET liste, déjà filtré par middleware)
 */

import type { Request, Response } from 'express';
import * as usersRepo from '../services/users.repository.js';
import { hashPassword, verifyPassword } from '../utils/password.utils.js';
import { asTrimmedString } from '../utils/validation.utils.js';
import { logAction } from '../services/audit.service.js';
import { sendWhatsApp } from '../services/whatsapp.service.js';

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** GET /api/admin/users — Super Admin only — Liste tous les comptes. */
export const list = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await usersRepo.findAll();
    res.json({ success: true, users, count: users.length });
  } catch (err) {
    console.error('❌ /api/admin/users GET :', (err as Error).message);
    res.status(500).json({ success: false, message: 'Erreur de lecture.' });
  }
};

/** POST /api/admin/users — Super Admin only — Crée un nouveau compte. */
export const create = async (req: Request, res: Response): Promise<void> => {
  const username  = asTrimmedString(req.body?.username).toLowerCase();
  const email     = asTrimmedString(req.body?.email).toLowerCase();
  const password  = asTrimmedString(req.body?.password);
  const firstName = asTrimmedString(req.body?.firstName);
  const lastName  = asTrimmedString(req.body?.lastName);
  const role      = req.body?.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN';

  // Validation
  if (!username || !email || !password || !firstName || !lastName) {
    res.status(400).json({
      success: false,
      message: 'Champs requis : username, email, password, firstName, lastName.',
    });
    return;
  }
  if (!EMAIL_RX.test(email)) {
    res.status(400).json({ success: false, message: 'Email invalide.' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ success: false, message: 'Mot de passe trop court (min 6 caractères).' });
    return;
  }
  if (username.length < 3) {
    res.status(400).json({ success: false, message: 'Username trop court (min 3 caractères).' });
    return;
  }

  // Vérifier unicité username / email
  if (await usersRepo.findByUsername(username)) {
    res.status(409).json({ success: false, message: 'Ce nom d\'utilisateur est déjà pris.' });
    return;
  }
  if (await usersRepo.findByEmail(email)) {
    res.status(409).json({ success: false, message: 'Cet email est déjà utilisé.' });
    return;
  }

  try {
    const passwordHash = await hashPassword(password);
    const user = await usersRepo.create({
      username, email, passwordHash, firstName, lastName, role, active: true,
    });
    console.log(`👤 User créé : ${user.username} (${user.role}) par ${req.admin?.u}`);
    void logAction({
      userId:   req.admin?.id,
      username: req.admin?.u,
      action:   'user.create',
      entity:   'AdminUser',
      entityId: user.id,
      details:  { username: user.username, email: user.email, role: user.role },
      req,
    });
    res.status(201).json({ success: true, user });
  } catch (err) {
    console.error('❌ /api/admin/users POST :', (err as Error).message);
    res.status(500).json({ success: false, message: 'Erreur de création.' });
  }
};

/** PUT /api/admin/users/:id — Super Admin only — Modifie un compte. */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id ?? ''), 10);
  if (Number.isNaN(id)) {
    res.status(400).json({ success: false, message: 'ID invalide.' });
    return;
  }

  const target = await usersRepo.findById(id);
  if (!target) {
    res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
    return;
  }

  const input: Parameters<typeof usersRepo.update>[1] = {};
  if (req.body.email     !== undefined) {
    const email = asTrimmedString(req.body.email).toLowerCase();
    if (!EMAIL_RX.test(email)) {
      res.status(400).json({ success: false, message: 'Email invalide.' });
      return;
    }
    const existing = await usersRepo.findByEmail(email);
    if (existing && existing.id !== id) {
      res.status(409).json({ success: false, message: 'Email déjà utilisé.' });
      return;
    }
    input.email = email;
  }
  if (req.body.firstName      !== undefined) input.firstName      = asTrimmedString(req.body.firstName);
  if (req.body.lastName       !== undefined) input.lastName       = asTrimmedString(req.body.lastName);
  if (req.body.role           !== undefined) input.role           = req.body.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN';
  if (req.body.active         !== undefined) input.active         = Boolean(req.body.active);
  if (req.body.phone          !== undefined) input.phone          = req.body.phone === null ? null : asTrimmedString(req.body.phone) || null;
  if (req.body.whatsappApiKey !== undefined) input.whatsappApiKey = req.body.whatsappApiKey === null ? null : asTrimmedString(req.body.whatsappApiKey) || null;
  if (req.body.password       !== undefined) {
    const password = asTrimmedString(req.body.password);
    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Mot de passe trop court (min 6 caractères).' });
      return;
    }
    input.passwordHash = await hashPassword(password);
  }

  // Safety : un Super Admin ne peut pas se désactiver/déclasser lui-même
  if (req.admin?.id === id && (input.active === false || input.role === 'ADMIN')) {
    res.status(409).json({
      success: false,
      message: 'Vous ne pouvez pas vous désactiver ou rétrograder vous-même.',
    });
    return;
  }

  const updated = await usersRepo.update(id, input);
  if (!updated) {
    res.status(500).json({ success: false, message: 'Erreur de mise à jour.' });
    return;
  }
  console.log(`👤 User mis à jour : ${updated.username} par ${req.admin?.u}`);

  // Détection du type d'action pour un audit plus parlant
  let action = 'user.update';
  if (input.active !== undefined && Object.keys(input).length === 1) action = 'user.toggle_active';
  if (input.role   !== undefined && target.role !== input.role)      action = 'user.change_role';

  void logAction({
    userId:   req.admin?.id,
    username: req.admin?.u,
    action,
    entity:   'AdminUser',
    entityId: id,
    details:  {
      target:        updated.username,
      changedFields: Object.keys(input).filter(k => k !== 'passwordHash'),
      ...(input.passwordHash ? { passwordChanged: true } : {}),
      ...(action === 'user.toggle_active' ? { newState: input.active } : {}),
      ...(action === 'user.change_role'   ? { oldRole: target.role, newRole: input.role } : {}),
    },
    req,
  });
  res.json({ success: true, user: updated });
};

/** DELETE /api/admin/users/:id — Super Admin only — Supprime un compte. */
export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id ?? ''), 10);
  if (Number.isNaN(id)) {
    res.status(400).json({ success: false, message: 'ID invalide.' });
    return;
  }
  if (req.admin?.id === id) {
    res.status(409).json({ success: false, message: 'Vous ne pouvez pas supprimer votre propre compte.' });
    return;
  }
  // Récup du target AVANT suppression pour le log
  const target = await usersRepo.findById(id);
  const ok = await usersRepo.remove(id);
  if (!ok) {
    res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
    return;
  }
  console.log(`🗑️  User supprimé : id=${id} par ${req.admin?.u}`);
  void logAction({
    userId:   req.admin?.id,
    username: req.admin?.u,
    action:   'user.delete',
    entity:   'AdminUser',
    entityId: id,
    details:  { target: target?.username ?? `id=${id}`, role: target?.role },
    req,
  });
  res.json({ success: true });
};

// ─── /me — Profil de l'utilisateur connecté ──────────

/** GET /api/admin/me — Renvoie le profil du user connecté. */
export const me = async (req: Request, res: Response): Promise<void> => {
  if (!req.admin) { res.status(401).json({ success: false }); return; }
  const user = await usersRepo.findById(req.admin.id);
  if (!user) { res.status(404).json({ success: false, message: 'Compte introuvable.' }); return; }
  res.json({ success: true, user });
};

/** PUT /api/admin/me — Modifie son propre profil (email, firstName, lastName, phone, whatsappApiKey). */
export const updateMe = async (req: Request, res: Response): Promise<void> => {
  if (!req.admin) { res.status(401).json({ success: false }); return; }
  const id = req.admin.id;

  const input: Parameters<typeof usersRepo.update>[1] = {};
  if (req.body.email !== undefined) {
    const email = asTrimmedString(req.body.email).toLowerCase();
    if (!EMAIL_RX.test(email)) {
      res.status(400).json({ success: false, message: 'Email invalide.' });
      return;
    }
    const existing = await usersRepo.findByEmail(email);
    if (existing && existing.id !== id) {
      res.status(409).json({ success: false, message: 'Email déjà utilisé.' });
      return;
    }
    input.email = email;
  }
  if (req.body.firstName      !== undefined) input.firstName      = asTrimmedString(req.body.firstName);
  if (req.body.lastName       !== undefined) input.lastName       = asTrimmedString(req.body.lastName);
  if (req.body.phone          !== undefined) input.phone          = req.body.phone === null ? null : asTrimmedString(req.body.phone) || null;
  if (req.body.whatsappApiKey !== undefined) input.whatsappApiKey = req.body.whatsappApiKey === null ? null : asTrimmedString(req.body.whatsappApiKey) || null;

  const updated = await usersRepo.update(id, input);
  if (!updated) {
    res.status(500).json({ success: false, message: 'Erreur de mise à jour.' });
    return;
  }
  res.json({ success: true, user: updated });
};

/** POST /api/admin/me/whatsapp-test — Envoie un message WhatsApp de test au profil actuel. */
export const testWhatsApp = async (req: Request, res: Response): Promise<void> => {
  if (!req.admin) { res.status(401).json({ success: false }); return; }
  const user = await usersRepo.findById(req.admin.id);
  if (!user) { res.status(404).json({ success: false }); return; }

  if (!user.phone || !user.whatsappApiKey) {
    res.status(400).json({
      success: false,
      message: 'Numéro WhatsApp et clé API CallMeBot requis dans votre profil.',
    });
    return;
  }

  const text =
    `*🚗 Benroubi Car — Test WhatsApp*\n\n` +
    `Bonjour ${user.firstName} ${user.lastName},\n\n` +
    `Votre configuration WhatsApp fonctionne ✅\n\n` +
    `Vous recevrez désormais les alertes d'échéances (assurance + visite technique) directement sur ce numéro, en plus de l'email.\n\n` +
    `_Message envoyé le ${new Date().toLocaleString('fr-FR')}_`;

  try {
    await sendWhatsApp(user.phone, user.whatsappApiKey, text);
    res.json({ success: true, message: 'Message envoyé sur WhatsApp.' });
  } catch (err) {
    res.status(500).json({ success: false, message: `Échec : ${(err as Error).message}` });
  }
};

/** PUT /api/admin/me/password — Change son propre mot de passe (avec ancien requis). */
export const updateMyPassword = async (req: Request, res: Response): Promise<void> => {
  if (!req.admin) { res.status(401).json({ success: false }); return; }
  const oldPassword = asTrimmedString(req.body?.oldPassword);
  const newPassword = asTrimmedString(req.body?.newPassword);
  if (!oldPassword || !newPassword) {
    res.status(400).json({ success: false, message: 'Ancien et nouveau mot de passe requis.' });
    return;
  }
  if (newPassword.length < 6) {
    res.status(400).json({ success: false, message: 'Nouveau mot de passe trop court (min 6).' });
    return;
  }

  // Récupère le hash actuel pour vérifier l'ancien
  const userRow = await usersRepo.findByUsername(req.admin.u);
  if (!userRow) { res.status(404).json({ success: false }); return; }
  const ok = await verifyPassword(oldPassword, userRow.passwordHash);
  if (!ok) {
    res.status(401).json({ success: false, message: 'Ancien mot de passe incorrect.' });
    return;
  }

  const newHash = await hashPassword(newPassword);
  await usersRepo.update(req.admin.id, { passwordHash: newHash });
  res.json({ success: true });
};
