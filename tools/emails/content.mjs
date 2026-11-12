// Textes des e-mails des séquences Brevo (repris tels quels des automatisations existantes, 12/11/2026).
// title : [partie normale, partie en italique dorée]. b() met en gras.
const SITE = 'https://yachtresearchgroup.com';
const U = id => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&h=560&q=70&fm=jpg`;

export const AUTOMATIONS = [
  { list: 'Contact Enquiry (#3)', name: 'Automation 3 - Contact Enquiry', emails: ['contact-1', 'contact-2', 'contact-3'], waits: ['', '2 days', '3 days'] },
  { list: 'Partnership Inquiry (#4)', name: 'Automation 2 - Partnership Inquiry', emails: ['partner-1', 'partner-2', 'partner-3'], waits: ['', '2 days', '3 days'] },
  { list: 'Yacht Enquiry (#5)', name: 'Automation 1 - Yacht Enquiry', emails: ['yacht-1', 'yacht-2', 'yacht-3', 'yacht-4', 'yacht-5'], waits: ['', '2 days', '2 days', '2 days', '2 days'] },
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
