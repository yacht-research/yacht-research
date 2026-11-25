// /fr/booking-confirmed : même page de confirmation, en français
import { render } from '../booking-confirmed.js';

export async function onRequestGet(ctx) { return render(ctx, 'fr'); }
