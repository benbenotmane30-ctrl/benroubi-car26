/**
 * Service Réservations — Soumet le formulaire au backend.
 * Le backend accepte multipart/form-data (champs texte + permis recto/verso).
 */

import { api } from './api';
import type { BookingFormData, ContactFormData, ApiResponse } from '../types/car';

export async function submitBooking(form: BookingFormData): Promise<ApiResponse> {
  const fd = new FormData();
  Object.entries(form).forEach(([key, val]) => {
    if (val == null) return;
    if (val instanceof File) fd.append(key, val);
    else fd.append(key, String(val));
  });

  const { data } = await api.post<ApiResponse>('/api/bookings', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function submitContact(form: ContactFormData): Promise<ApiResponse> {
  const { data } = await api.post<ApiResponse>('/api/contact', form);
  return data;
}
