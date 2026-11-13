// Textes des e-mails des séquences Brevo (repris tels quels des automatisations existantes, 12/11/2026).
// title : [partie normale, partie en italique dorée]. b() met en gras.
const SITE = 'https://yachtresearchgroup.com';
const U = id => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&h=560&q=70&fm=jpg`;

export const AUTOMATIONS = [
  { list: 'Contact Enquiry (#3)', name: 'Automation 3 - Contact Enquiry', emails: ['contact-1', 'contact-2', 'contact-3'], waits: ['', '2 days', '3 days'] },
  { list: 'Partnership Inquiry (#4)', name: 'Automation 2 - Partnership Inquiry', emails: ['partner-1', 'partner-2', 'partner-3'], waits: ['', '2 days', '3 days'] },
  { list: 'Yacht Enquiry (#5)', name: 'Automation 1 - Yacht Enquiry', emails: ['yacht-1', 'yacht-2', 'yacht-3', 'yacht-4', 'yacht-5'], waits: ['', '2 days', '2 days', '2 days', '2 days'] },
  { list: 'Shared Experience Enquiry (nouvelle)', name: 'Automation 4 - Shared Experience Enquiry', emails: ['xp-1', 'xp-2', 'xp-3'], waits: ['', '2 days', '3 days'] },
];

// Bloc « Discover Yacht Research » en bas de chaque e-mail (textes repris des cartes de l'accueil du site)
const T = id => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=560&h=360&q=70&fm=jpg`;
export const EXPLORE = [
  { eyebrow: 'Dubai · By the seat', title: 'Shared experiences', url: '/shared-experiences', img: '/images/email/experiences.jpg',
    text: 'Superyacht days, yacht tours with BBQ, sunset dinner cruises and boat parties. Book your seats, no need to charter a whole yacht.', link: 'See the experiences' },
  { eyebrow: 'Charter', title: 'Charter', url: '/charter', img: T('photo-1672939113905-b02ef5db7203'),
    text: 'Day, weekly and hourly charters with hand-picked crews, at B2B rates.', link: 'Plan a charter' },
  { eyebrow: 'Worldwide · Private aviation', title: 'Private Jet', url: '/private-jet', img: T('photo-1474302770737-173ee21bab63'),
    text: 'Private jets, empty legs and private flights anywhere in the world, booked through our global network.', link: 'Fly private' },
  { eyebrow: 'Buy · Sell', title: 'Yachts for sale', url: '/listings', img: T('photo-1567899378494-47b22a2ae96a'),
    text: 'Off-market search, survey, sea trial and negotiation. We find the right yacht, not simply the first one available.', link: 'See the yachts' },
];
export const YCA = { url: '/yacht-club-academy', kicker: 'Also founded by Mathis &amp; Antoine', link: 'Discover the academy',
  text: 'Our academy for those who want to become Yacht Brokers: the off-market world, the method professionals use, a dedicated platform and much more.' };

// Campagnes ponctuelles (envoyées une fois depuis Brevo > Campagnes, pas dans une automatisation)
export const CAMPAIGNS = {
  'new-website': {
    subject: '✨ Our New Website Is Live',
    preheader: 'Shared yacht experiences, charters, yachts for sale and private jets, with many more yachts arriving in the coming days.',
    eyebrow: 'Yacht Research', title: ['Our new website', 'is live'], hero: U('photo-1567899378494-47b22a2ae96a'),
    greet: 'Hello {{ contact.PRENOM | default : "there" }}',
    paras: ['We have just launched the new Yacht Research website, redesigned from the ground up to make it easier to find the right yacht, the right charter or the right experience on the water.',
      'Here is what you will find today, <b>and this is only the beginning</b>.'],
    sections: [], noTiles: true, tilesInBody: true,
    stats: [['38', 'Yachts for charter'], ['11', 'Shared experiences'], ['69', 'AED per guest, from'], ['12', 'Yachts for sale']],
    statsNote: ['And much more', 'to come in the next few days'],
    soon: { kicker: 'Coming in the next few days', title: ['Many more', 'yachts to come'],
      text: 'We are adding a large number of new yachts for sale and for charter, along with new shared experiences, in the coming days. Keep an eye on the site and on your inbox: <b>the best is yet to come</b>.' },
    cta: ['Visit the new website', SITE + '/?utm_source=brevo&utm_medium=email&utm_campaign=new-website'], whatsapp: true,
  },
};

// Versions de la campagne « nouveau site » à comparer (images seulement, rien n'est envoyé)
const NW = CAMPAIGNS['new-website'];
const NOVELTIES = [
  { label: 'Dubai · By the seat', title: 'Shared experiences', url: '/shared-experiences', img: '/images/email/experiences-hero.jpg', link: 'See the experiences',
    text: 'Book your seats on a shared yacht, with no need to charter a whole yacht: superyacht days, yacht tours with BBQ, sunset dinner cruises and boat parties, from AED 69 per guest. Live times and prices on the site.' },
  { label: 'Charter', title: 'Every yacht, with photos and rates', url: '/charter', img: U('photo-1672939113905-b02ef5db7203'), link: 'Plan a charter',
    text: 'Day, weekly and hourly charters with hand-picked crews, at B2B rates, now with photos, rates and details for every yacht.' },
  { label: 'Buy · Sell', title: 'Yachts for sale', url: '/listings', img: U('photo-1592285081254-0440a6601fea'), link: 'See the yachts',
    text: 'Our current listings with full galleries, specifications and brochures, plus off-market opportunities on request.' },
  { label: 'Worldwide · Private aviation', title: 'Private jet', url: '/private-jet', img: U('photo-1474302770737-173ee21bab63'), link: 'Fly private',
    text: 'Private jets, empty legs and private flights anywhere in the world, booked through our global network.' },
];
export const DRAFTS = {
  'v3-chiffres-final': NW, // version retenue (13/11/2026)
  'v2-photos': { ...NW, stats: null, tilesInBody: false, photoSections: NOVELTIES,
    paras: ['We have just launched the new Yacht Research website, redesigned from the ground up to make it easier to find the right yacht, the right charter or the right experience on the water. Here is what is new.'] },
};

export const EMAILS = {
  'contact-1': {
    subject: '📬 We Have Received Your Enquiry | Yacht Research',
    preheader: 'A member of our team will be in touch with you personally within 24 hours.',
    eyebrow: 'Your enquiry', title: ['We have received', 'your enquiry'], hero: U('photo-1562281302-809108fd533c'),
    paras: ['Thank you for contacting Yacht Research. Your message has been received and a member of our team will be in touch with you personally within <b>24 hours</b>.',
      'In the meantime, feel free to explore our current yacht listings and services at <a href="' + SITE + '">yachtresearchgroup.com</a>.'],
    sections: [['Prefer a faster response?', 'You can reach us directly via WhatsApp, available in both Dubai and France. Our team operates across time zones and typically responds within the hour.']],
    cta: ['Explore our yachts', SITE + '/listings'], whatsapp: true,
  },
  'contact-2': {
    subject: '📬 What Yacht Research Does for You',
    preheader: 'A brief overview of our services, whatever your project.',
    eyebrow: 'Our services', title: ['What Yacht Research', 'does for you'], hero: U('photo-1567899378494-47b22a2ae96a'),
    paras: ['We wanted to give you a brief overview of our services so you know exactly how we can help, whatever your project.'],
    sections: [
      ['Yacht acquisition', 'Looking to buy a yacht? We search both on-market and off-market opportunities across Dubai, the French Riviera, and the Mediterranean, presenting you with a curated shortlist that matches your exact brief.'],
      ['Yacht sales', 'Selling your yacht? We provide discreet, professional brokerage services with access to qualified buyers across our international network.'],
      ['Charter', 'Whether you are looking to charter a yacht for a private trip, or place your vessel on the charter market, we have the connections and expertise to make it happen.'],
      ['Bespoke services', 'From crew placement and yacht management to refit advice and concierge support, we offer a complete ecosystem of trusted services.']],
    cta: ['Explore our services', SITE + '/bespoke'],
  },
  'contact-3': {
    subject: "📬 We're Still Here When You're Ready",
    preheader: 'Whenever the time is right, Yacht Research is here to help.',
    eyebrow: 'Whenever you are ready', title: ["We're still here", "when you're ready"], hero: U('photo-1592285081254-0440a6601fea'),
    paras: ['We know that yacht projects often evolve over time, and that the right moment to move forward is different for everyone.',
      'Whether your project is immediate or still in early stages, Yacht Research is here to provide guidance, answer questions, and help you make the best decision when the time is right.'],
    sections: [['Ready to take the next step?', 'Fill in our detailed enquiry form to help us understand your project better, and we will come back to you with a tailored proposal.']],
    cta: ['Submit a detailed enquiry', SITE + '/yacht-research-form'], whatsapp: true,
  },
  'partner-1': {
    subject: '🤝 Thank You for Your Interest',
    preheader: 'We have received your partnership enquiry. Expect to hear from us within 48 hours.',
    eyebrow: 'Partnership enquiry', title: ['Thank you for', 'your interest'], hero: U('photo-1752884991178-c767ae83fb6b'),
    paras: ['We have received your partnership enquiry and appreciate you taking the time to reach out to Yacht Research.',
      'Our team will carefully review your profile and the details of your proposal. You can expect to hear from us within <b>48 hours</b>.'],
    sections: [['About Yacht Research', 'We are an independent yacht brokerage with active operations in Dubai, the French Riviera, and the broader Mediterranean. We work with a carefully selected network of partners who share our commitment to quality, discretion, and long-term client relationships.']],
    cta: ['Learn more about us', SITE + '/why-us'],
  },
  'partner-2': {
    subject: '🤝 How We Build Partnerships',
    preheader: 'Genuine, long-term B2B relationships, not one-off transactions.',
    eyebrow: 'Partnerships', title: ['How we build', 'partnerships'], hero: U('photo-1621277224630-81d9af65e40c'),
    paras: ['At Yacht Research, we believe that the strongest results in this industry come from genuine, long-term B2B relationships, not one-off transactions.'],
    sections: [
      ['Broker-to-broker collaboration', 'We actively collaborate with yacht brokers across markets to co-broker transactions. If you have a buyer or seller that fits our active mandates, we work transparently on a split-commission basis.'],
      ['Referral and introduction network', 'If you work with high-net-worth clients in real estate, private banking, concierge, or luxury services, our referral programme offers competitive commission on any introduction that leads to a transaction.'],
      ['Service partners', 'We also work with vetted service providers across yacht management, crew agencies, refit specialists, and charter managers, to offer our clients a complete ecosystem of support.']],
    cta: ['Discuss a partnership', SITE + '/partnerships'],
  },
  'partner-3': {
    subject: "🤝 Let's Move Forward Together",
    preheader: 'Ready to explore a collaboration? Let us schedule a call.',
    eyebrow: 'Next step', title: ["Let's move forward", 'together'], hero: U('photo-1722502831572-2d12e8f30c59'),
    paras: ['We hope the past few days have given you a clearer picture of how Yacht Research operates and the kind of partnerships we are looking to build.',
      'If you are ready to explore a collaboration, we would love to schedule a call or meeting, whether in Dubai, on the French Riviera, or via video.'],
    sections: [['Next step', 'Simply reply to this email, reach out via WhatsApp, or use the link below to get back in touch with our team. We look forward to connecting with you.']],
    cta: ['Get in touch', SITE + '/contact'], whatsapp: true,
  },
  'yacht-1': {
    subject: '⛵ Welcome to Yacht Research',
    preheader: 'A dedicated member of our team will review your requirements within 24 hours.',
    eyebrow: 'Welcome', title: ['Welcome to', 'Yacht Research'], hero: U('photo-1562281302-809108fd533c'),
    paras: ['Thank you for reaching out. Your enquiry has been received and a dedicated member of our team will review your requirements personally within <b>24 hours</b>.',
      'Yacht Research operates discreetly at the highest level of the international yacht market, with an active presence in Dubai, the French Riviera, and the Mediterranean. We work selectively with serious buyers, sellers, and charterers who value expertise and confidentiality.'],
    sections: [['While you wait', 'Feel free to explore our current yacht selection on our website, or contact us directly via WhatsApp for a faster response. Our team is available across time zones.']],
    cta: ['Explore our yachts', SITE + '/listings'], whatsapp: true,
  },
  'yacht-2': {
    subject: '⛵ Our Markets and Expertise',
    preheader: 'Dubai, the French Riviera, the Mediterranean and off-market transactions.',
    eyebrow: 'Our markets', title: ['Our markets', 'and expertise'], hero: U('photo-1722502831572-2d12e8f30c59'),
    paras: ['We wanted to share a brief overview of the markets where Yacht Research is most active, to help you understand how we can best assist you.'],
    sections: [
      ['Dubai and the UAE', 'The UAE has become one of the fastest-growing yacht markets globally. Yacht Research has a strong operational presence in Dubai, with direct access to both on-market and off-market listings across the Gulf.'],
      ['French Riviera and Mediterranean', 'From Cannes to Monaco, the French Riviera remains the epicentre of European yacht brokerage. Our network spans the entire Mediterranean, covering Spain, Italy, Greece, and Croatia for both sales and charter.'],
      ['Off-market transactions', 'A significant portion of high-value yacht transactions never appear publicly. Through our broker network and direct owner relationships, we regularly facilitate discreet off-market deals for discerning clients.']],
    cta: ['Discover our services', SITE + '/bespoke'],
  },
  'yacht-3': {
    subject: '⛵ How We Work With You',
    preheader: 'A seamless, confidential process tailored to your objectives.',
    eyebrow: 'Our process', title: ['How we work', 'with you'], hero: U('photo-1567899378494-47b22a2ae96a'),
    paras: ['Whether you are buying, selling, or chartering, our process is designed to be seamless, confidential, and entirely tailored to your objectives.'],
    sections: [
      ['Step 1: Understanding your brief', 'We start with a detailed conversation to understand your exact requirements: budget, yacht type, intended use, timeline, and market preferences.'],
      ['Step 2: Market search and shortlist', 'We search both on-market and off-market opportunities across our global network, presenting you with a curated shortlist that matches your brief precisely.'],
      ['Step 3: Viewings and due diligence', 'We coordinate all viewings, sea trials, and technical surveys, working alongside your legal and technical advisors to ensure complete due diligence.'],
      ['Step 4: Negotiation and closing', 'Yacht Research represents your interests throughout the negotiation process, ensuring the best terms and a smooth, professional closing.']],
    cta: ['Start your search', SITE + '/yacht-research-form'],
  },
  'yacht-4': {
    subject: '⛵ Why Clients Choose Yacht Research',
    preheader: 'Choosing the right broker is as important as choosing the right yacht.',
    eyebrow: 'Why Yacht Research', title: ['Why clients choose', 'Yacht Research'], hero: U('photo-1592285081254-0440a6601fea'),
    paras: ['In a market defined by trust and relationships, choosing the right broker is as important as choosing the right yacht.'],
    sections: [
      ['Discretion and confidentiality', "Every transaction we handle is managed with the highest level of discretion. Our clients' identities, budgets, and intentions are never disclosed without explicit permission."],
      ['Independent and unbiased', 'As an independent brokerage, we have no obligation to push specific yachts or manufacturers. Our sole objective is to find the best match for your needs.'],
      ['International network', 'Our broker network spans Dubai, the French Riviera, Monaco, and beyond, giving us access to opportunities that are simply not available through single-market brokerages.'],
      ['End-to-end service', 'From the initial brief to post-purchase support, we remain your trusted point of contact throughout the transaction and beyond.']],
    cta: ['Contact our team', SITE + '/contact'],
  },
  // Séquence « expériences partagées » (nouvelle, 12/11/2026) : faits repris des pages du site (prix « à partir de », durées, annulation 48 h)
  'xp-1': {
    subject: '🛥️ We Have Received Your Experience Request',
    preheader: 'We are checking availability and will confirm your seats by WhatsApp or email.',
    eyebrow: 'Shared experience', title: ['Your request', 'is with us'], hero: '/images/email/experiences-hero.jpg',
    paras: ['Thank you for your request for a shared yacht experience in Dubai. A member of our team is checking availability for your date and time, and will confirm your seats with you directly by WhatsApp or email within <b>24 hours</b>.',
      'For a faster answer, you can message us on WhatsApp at any time.'],
    sections: [
      ['Free cancellation', 'Free cancellation up to 48 hours before departure. If the sailing is cancelled for weather or safety reasons, you choose between another date and a full refund.'],
      ['On the day', 'We send you the meeting point and final details before your experience. Please bring a valid ID for each guest.']],
    cta: ['See all experiences', SITE + '/shared-experiences'], whatsapp: true,
  },
  'xp-2': {
    subject: '🛥️ More Ways to Enjoy Dubai From the Water',
    preheader: 'Superyacht days, sunset dinner cruises, yacht tours with BBQ and night parties.',
    eyebrow: 'Shared experiences', title: ['Dubai', 'from the water'], hero: U('photo-1722502831572-2d12e8f30c59'),
    paras: ['Whether you have already sailed with us or are still choosing your date, here are some of the shared experiences you can book by the seat in Dubai, with no need to charter a whole yacht.'],
    sections: [
      ['Superyacht day on Stardom', '3 hours from Dubai Harbour on board a superyacht. From AED 371 per guest.'],
      ['Sunset and dinner cruise', '1 h 30 from Dubai Marina at sunset, with dinner on board. From AED 170 per guest.'],
      ['Dubai Marina yacht tour with BBQ', '2 to 3 hours from Dubai Marina with a BBQ on board. From AED 170 per guest.'],
      ['Night yacht party', '4 hours from Dubai Marina. From AED 290 per guest.']],
    cta: ['Choose your experience', SITE + '/shared-experiences'],
  },
  'xp-3': {
    subject: '🛥️ The Yacht to Yourselves',
    preheader: 'Private charters in Dubai, with hand-picked crews at B2B rates.',
    eyebrow: 'Private charter', title: ['The yacht', 'to yourselves'], hero: U('photo-1567899378494-47b22a2ae96a'),
    paras: ['Shared experiences are the easiest way to get on the water. If you would rather have the yacht to yourselves, we also arrange private charters in Dubai.',
      'Day, weekly and hourly charters with hand-picked crews, at B2B rates. We select the yacht, the crew and the itinerary around you.'],
    sections: [['Tell us your date', 'Send us your date, timing and number of guests by WhatsApp or through our website, and we reply within 24 hours, in English or French, with availability and a tailored quote.']],
    cta: ['See our charters in Dubai', SITE + '/charter?location=Dubai'], whatsapp: true,
  },
  'yacht-5': {
    subject: '⛵ Ready to Move Forward?',
    preheader: 'Our team is ready to start working on your behalf.',
    eyebrow: 'Next step', title: ['Ready to', 'move forward?'], hero: U('photo-1752884991178-c767ae83fb6b'),
    paras: ['We have shared some insights over the past few days and we hope they have been useful. We would love to hear more about your project and discuss how Yacht Research can assist you specifically.',
      'Whether you are looking to buy, sell, or charter, our team is ready to start working on your behalf immediately.'],
    sections: [['Get in touch', 'The fastest way to reach us is via WhatsApp. Our team is available across time zones in Dubai and the French Riviera. You can also reach us through our website or Instagram.']],
    cta: ['Visit our website', SITE], whatsapp: true,
  },
};
