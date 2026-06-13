/**
 * WhatsApp Service — Envoi de messages via CallMeBot (gratuit, illimité).
 *
 * Onboarding utilisateur (à faire une fois) :
 *   1. Ajouter le contact CallMeBot : +34 644 78 84 90
 *   2. Lui envoyer le message : "I allow callmebot to send me messages"
 *   3. Attendre la réponse contenant l'API key personnelle
 *   4. Sauvegarder le numéro WhatsApp + la clé dans son profil admin
 *
 * Doc API : https://www.callmebot.com/blog/free-api-whatsapp-messages/
 */

const CALLMEBOT_API = 'https://api.callmebot.com/whatsapp.php';

export class WhatsAppError extends Error {
  status:   number;
  bodyText: string;
  constructor(message: string, status: number, body: string) {
    super(message);
    this.name     = 'WhatsAppError';
    this.status   = status;
    this.bodyText = body;
  }
}

/**
 * Envoie un message WhatsApp via CallMeBot.
 * @param phone  Numéro destinataire au format international AVEC le +, ex: "+212662114321"
 * @param apiKey Clé API CallMeBot personnelle du destinataire
 * @param text   Message texte (multilignes OK, supports emojis)
 */
export async function sendWhatsApp(phone: string, apiKey: string, text: string): Promise<void> {
  if (!phone || !apiKey) throw new WhatsAppError('phone ou apiKey manquant', 0, '');

  // Nettoyer le numéro : retirer espaces, tirets, parenthèses, garder le +
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  if (!cleanPhone.startsWith('+')) {
    throw new WhatsAppError('Numéro doit commencer par + (format international)', 0, '');
  }

  const url = `${CALLMEBOT_API}?phone=${encodeURIComponent(cleanPhone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, { method: 'GET' });
  const body = await res.text().catch(() => '');

  // CallMeBot renvoie du texte HTML. Si "Message queued" ou "Message Sent" → succès.
  if (!res.ok || !/queued|sent|success/i.test(body)) {
    throw new WhatsAppError(`CallMeBot a renvoyé ${res.status} : ${body.slice(0, 200)}`, res.status, body);
  }
}
