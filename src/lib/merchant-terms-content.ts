import { ZBOUN_OPS_EMAIL } from "@/lib/zboun-contact";

/** Merchant / Store Operator Terms — attached when a store account is created. */
export const MERCHANT_TERMS = {
  documentTitle: "Zboun Merchant Terms of Service",
  shortTitle: "Merchant Terms of Service",
  version: "1.0",
  effectiveDateLabel: "20 August 2026",
  operator: {
    legalName: "Zboun",
    tradeName: "Zboun",
    jurisdiction: "Lebanon",
    website: "https://zboun.net",
    contactEmail: ZBOUN_OPS_EMAIL,
  },
} as const;

export type MerchantTermsSection = {
  number: number;
  title: string;
  clauses: string[];
};

/**
 * Professional merchant terms protecting the Platform Operator.
 * Not a substitute for advice from a licensed attorney in Lebanon.
 */
export const MERCHANT_TERMS_SECTIONS: MerchantTermsSection[] = [
  {
    number: 1,
    title: "Parties and Scope",
    clauses: [
      "These Merchant Terms of Service (the “Terms”) form a binding agreement between Zboun, operated by [Wissam Walid Baaklini] (“Zboun”, “we”, “us”, or “our”) and the business, restaurant, shop, brand, or other commercial entity that is granted a store account on the Zboun platform (the “Merchant”, “you”, or “your”).",
      "These Terms govern your access to and use of the Zboun website, software, dashboard, storefront pages, ordering tools, QR and flyer features, messaging helpers, marketplace listing (where applicable), and related services (collectively, the “Platform”).",
      "Zboun provides technology tools that enable Merchants to publish digital storefronts and receive customer orders. Except where expressly stated otherwise, Zboun is a technology intermediary and is not the seller of your products, not a party to transactions between you and your customers, and not responsible for product quality, fulfilment, delivery, payments collected outside the Platform, or customer service for your goods or services.",
    ],
  },
  {
    number: 2,
    title: "Acceptance; Electronic Agreement by Login",
    clauses: [
      "By creating an account, setting a password, signing in, accessing the Merchant dashboard, publishing content, or otherwise using the Platform, you acknowledge that you have received, read, understood, and agree to be bound by these Terms (including any documents incorporated by reference, such as our public Terms of Service and Privacy Policy as published on zboun.net).",
      "IMPORTANT — ACCEPTANCE BY LOGIN: Your first successful login to your store account, and each subsequent login or continued use of the Platform, constitutes your irrevocable electronic acceptance of these Terms. No wet-ink signature is required for these Terms to become binding.",
      "If you do not agree to these Terms, you must not log in, must not use the Platform, and must notify Operator immediately at the contact email below so that the account may be closed.",
      "If you accept these Terms on behalf of a company or other legal entity, you represent and warrant that you have full legal authority to bind that entity. The entity shall be the “Merchant” under these Terms.",
    ],
  },
  {
    number: 3,
    title: "Account Security, Accurate Information, and Identity",
    clauses: [
      "You are solely responsible for maintaining the confidentiality of login credentials and for all activities conducted under your account, whether by you, your employees, contractors, or any person to whom you grant access.",
      "You must provide accurate, complete, and current registration, business, and contact information (including your legal or trade name, address where requested, email, and telephone / WhatsApp numbers) and update it promptly if it changes.",
      "You represent and warrant that all information you provide to Operator — during onboarding, in the dashboard, by email, WhatsApp, or any other channel — is true, accurate, and not misleading.",
      "You must not provide false, stolen, or another person’s identity, business details, government ID, email address, or telephone / WhatsApp number without that person’s prior written authorisation. Using a phone number, email, brand name, or identity that you do not own or control is a material breach of these Terms.",
      "If Operator reasonably believes you have provided incorrect, incomplete, or unauthorised information (including someone else’s phone number), Operator may immediately suspend or permanently deactivate your account, remove your storefront, refuse reactivation, and report the matter to competent authorities where required or appropriate.",
      "You must notify Operator without undue delay of any unauthorised access, credential compromise, or security incident relating to your account.",
      "Operator may suspend or restrict access where we reasonably suspect unauthorised use, identity misuse, abuse, legal risk, non-payment, or breach of these Terms.",
      "You represent and warrant that you are duly established and authorized to conduct your business and that you have obtained, and will maintain throughout your use of the Platform, all licenses, permits, registrations, approvals, and authorizations required under applicable law for your business and for the advertising, offering, sale, delivery, and fulfilment of your products and services.",
    ],
  },
  {
    number: 4,
    title: "Merchant Content and Representations",
    clauses: [
      "“Merchant Content” means all materials you (or anyone acting for you) upload, publish, transmit, link to, or display through the Platform, including without limitation: store name and slug; description; logo, banner, and product images or videos; prices, sizes, brands, stock, and catalogue data; promotions and coupon text; opening hours and delivery settings; telephone / WhatsApp numbers; social media profile URLs (including Instagram, TikTok, Facebook, YouTube, X/Twitter, Pinterest, and similar); QR and flyer materials; customer-facing messages; and any other store profile or storefront information.",
      "You retain ownership of your Merchant Content. You grant Operator a worldwide, non-exclusive, royalty-free licence to host, store, reproduce, display, distribute, and otherwise use Merchant Content solely as needed to operate, secure, promote (where you opt in), and improve the Platform and to comply with law.",
      "You represent and warrant that: (a) you own or have all rights necessary to publish Merchant Content; (b) Merchant Content is accurate and not misleading; (c) Merchant Content does not infringe any intellectual property, privacy, publicity, or other right of any third party; and (d) Merchant Content complies with all applicable laws and these Terms.",
    ],
  },
  {
    number: 5,
    title: "Store Profile, Branding, Social Links, and Contact Details",
    clauses: [
      "Your public storefront and dashboard settings form part of Merchant Content. You are solely responsible for everything displayed under your store, including branding, catalogue, contact details, and outbound links.",
      "Social media links (Instagram, TikTok, Facebook, YouTube, X/Twitter, Pinterest, or any other profile, page, channel, or website URL you add) must belong to you or to your business, or you must have clear authorisation from the account owner to publish that link on your Zboun store. You must not publish fake, misleading, or unauthorised links — including links to another store’s, competitor’s, or third party’s social profiles, websites, WhatsApp numbers, or contact pages — whether to impersonate them, divert customers, damage their reputation, or for any other purpose. Linking to another person’s or brand’s social account or website without authorisation is prohibited.",
      "Your store name, logo, banner, product photos, and other branding must not impersonate another business or misuse third-party trademarks, logos, or trade dress. You must have rights to every image and video you upload.",
      "Telephone and WhatsApp numbers shown to customers for ordering or contact must be numbers you own or are authorised to use for your business. You must not publish someone else’s number to receive orders or inquiries without their consent.",
      "Prices, discounts, coupons, delivery fees, stock availability, and product descriptions must be accurate and not deceptive. Misleading promotions, bait-and-switch pricing, or false “in stock” claims are prohibited.",
      "You must not manipulate ratings or reviews (including fake reviews, paid deceptive reviews, or coercing customers to leave false feedback).",
      "Operator may remove unauthorised social links, branding, contact details, or other store information, and may suspend or deactivate the account for breach of this Section.",
    ],
  },
  {
    number: 6,
    title: "Prohibited Content and Conduct",
    clauses: [
      "You shall not upload, publish, link to, promote, or otherwise make available through the Platform any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, invasive of privacy, hateful, discriminatory, or otherwise objectionable.",
      "Without limiting the foregoing, the following are strictly prohibited: (a) pornography, sexually explicit material, sexual services, or content exploiting sexual themes involving minors in any form; (b) child sexual abuse material or any content sexualising minors (strictly forbidden; will be reported to authorities where required); (c) graphic violence, glorification of violence, terrorism, or instructions for violent crime; (d) hate speech or content that incites violence or discrimination based on race, religion, nationality, gender, sexual orientation, disability, or similar characteristics; (e) illegal drugs, unlicensed controlled substances, or facilitation of illegal activity; (f) weapons, explosives, or instructions for manufacturing harmful devices where unlawful; (g) fraudulent, deceptive, or scam-related offers; (h) malware, phishing, or attempts to compromise systems or users; (i) unauthorised use of another party’s brand, identity, likeness, email, telephone / WhatsApp number, or social media account; (j) impersonation of any person or business; (k) scraping, harvesting, or copying Platform data or another merchant’s catalogue without authorisation; and (l) any content or conduct that violates Lebanese law or other applicable law.",
      "You shall not use the Platform to harass customers or third parties, spam messaging channels, reverse engineer the Platform except as permitted by mandatory law, or interfere with Platform security or availability.",
      "Operator has no obligation to pre-screen Merchant Content, but reserves the right to review, refuse, remove, disable, or restrict any Merchant Content at any time, with or without notice, where we reasonably believe it violates these Terms, creates legal risk, harms users, or harms Operator’s reputation.",
    ],
  },
  {
    number: 7,
    title: "Moderation, Suspension, and Termination",
    clauses: [
      "Operator may, at its sole reasonable discretion: remove or hide Merchant Content (including social links and contact details); suspend marketplace listing; suspend ordering features; suspend or terminate your account; and/or report content or conduct to competent authorities.",
      "Where practicable, Operator will provide notice of material suspension or termination, except where immediate action is required for legal compliance, safety, security, or fraud prevention.",
      "Upon termination, your right to access the Platform ceases. Operator may retain records as required for legal, accounting, dispute, and security purposes.",
      "Sections that by their nature should survive (including warranties, indemnities, liability limits, and intellectual property) shall survive termination.",
    ],
  },
  {
    number: 8,
    title: "Orders, Customers, and Merchant Responsibilities",
    clauses: [
      "You are solely responsible for fulfilling orders, setting accurate prices and stock, communicating with customers, handling complaints and refunds according to your own policies and applicable law, and complying with consumer-protection and advertising rules.",
      "Where WhatsApp or other third-party messaging tools are used, you are responsible for obtaining any required consents and for lawful messaging practices.",
      "Operator does not guarantee uninterrupted service, specific order volumes, rankings, or sales outcomes.",
      "Operator is not responsible for the content of third-party websites or social networks linked from your storefront. Links you publish are at your sole risk and responsibility.",
      "Any contract for the purchase or supply of products or services through a Merchant storefront is solely between the Merchant and the relevant customer. Operator is not the seller, supplier, distributor, agent, or representative of the Merchant and assumes no responsibility for the Merchant’s products or services, their quality, safety, legality, description, delivery, fulfilment, refunds, warranties, or after-sales service.",
    ],
  },
  {
    number: 9,
    title: "Fees, Non-Payment, and Deactivation",
    clauses: [
      "Subscription fees and commercial terms are as agreed separately (including any service agreement, invoice, or plan shown at onboarding).",
      "Your right to access and use the Platform depends on a paid and active subscription (unless Operator has expressly granted a complimentary or lifetime plan in writing).",
      "If you stop paying, fail to renew, or your subscription period ends without timely renewal and payment in full, Operator may immediately deactivate your store account and related Platform access — including your public storefront, dashboard login, ordering features, and marketplace listing — with or without prior notice.",
      "Deactivation for non-payment or expiry may occur automatically upon the end of the paid period. Operator is not liable for lost orders, lost visibility, or business interruption resulting from such deactivation.",
      "Reactivation after deactivation may require payment of outstanding fees and any applicable reactivation or setup charges, and is subject to Operator’s approval.",
      "You are responsible for taxes applicable to your sales and business. Platform subscription fees are exclusive of taxes unless stated otherwise.",
      "Unless otherwise expressly agreed in writing, all subscription fees are payable in advance and are non-refundable once the applicable subscription period has commenced, except where a refund is required by applicable law.",
      "Operator may revise its subscription fees or introduce new fees from time to time upon reasonable prior notice to the Merchant. Any revised fees shall apply from the Merchant’s next renewal period unless otherwise stated in the notice.",
    ],
  },
  {
    number: 10,
    title: "Intellectual Property of the Platform",
    clauses: [
      "The Platform, including software, design, trademarks, logos (other than yours), documentation, and related intellectual property, is owned by Operator or its licensors. No rights are granted except the limited licence to use the Platform during an active authorised subscription in accordance with these Terms.",
      "You shall not copy, modify, distribute, sell, lease, or create derivative works of the Platform except as expressly permitted in writing by Operator.",
    ],
  },
  {
    number: 11,
    title: "Indemnification",
    clauses: [
      "You shall defend, indemnify, and hold harmless Operator and its owners, officers, employees, contractors, and agents from and against any claims, damages, losses, liabilities, costs, and expenses (including reasonable legal fees) arising out of or related to: (a) Merchant Content; (b) your products, services, pricing, advertising, or fulfilment; (c) your breach of these Terms or applicable law; (d) disputes with your customers or third parties; (e) any allegation that Merchant Content is unlawful, infringing, defamatory, violent, sexually explicit, or otherwise prohibited under Section 6; (f) any claim arising from false, incomplete, or unauthorised information you provided (including use of another person’s phone number, email, identity, business details, or social media account); and (g) any claim arising from links you publish to third-party sites or social profiles.",
    ],
  },
  {
    number: 12,
    title: "Disclaimer of Warranties",
    clauses: [
      "THE PLATFORM IS PROVIDED “AS IS” AND “AS AVAILABLE”. TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, OPERATOR DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.",
      "Operator does not warrant that the Platform will be uninterrupted, error-free, or free of harmful components, or that content hosted on the Platform will be secure against all threats.",
    ],
  },
  {
    number: 13,
    title: "Limitation of Liability",
    clauses: [
      "TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, OPERATOR SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, OR FOR LOST PROFITS, LOST REVENUE, LOST DATA, BUSINESS INTERRUPTION, OR REPUTATIONAL HARM, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.",
      "OPERATOR’S TOTAL AGGREGATE LIABILITY ARISING OUT OF OR RELATING TO THESE TERMS OR THE PLATFORM SHALL NOT EXCEED THE AMOUNTS PAID BY YOU TO OPERATOR FOR THE PLATFORM IN THE THREE (3) MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM (OR, IF NO FEES WERE PAID, ONE HUNDRED US DOLLARS (USD 100)).",
      "Nothing in these Terms excludes liability that cannot be excluded under mandatory applicable law.",
    ],
  },
  {
    number: 14,
    title: "Privacy and Data",
    clauses: [
      "Each party shall handle personal data in accordance with applicable privacy and data-protection laws and Operator’s Privacy Policy as published on zboun.net.",
      "You are responsible for informing your customers, as required by law, about how you use their data in connection with orders placed through your storefront.",
      "The Merchant acknowledges and agrees that Operator may collect, access, store, process, use, and otherwise handle Merchant, account, transaction, order, customer, and Platform usage data as reasonably necessary to provide, operate, maintain, secure, support, troubleshoot, analyze, develop, and improve the Platform; prevent fraud and misuse; comply with applicable law; and exercise or defend legal rights, in each case subject to applicable data-protection laws and Operator’s Privacy Policy.",
    ],
  },
  {
    number: 15,
    title: "Changes to These Terms",
    clauses: [
      "Operator may update these Terms from time to time. Material changes will be communicated by email to the registered admin address and/or by notice in the dashboard or on zboun.net, where practicable.",
      "Continued login or use of the Platform after the effective date of updated Terms constitutes acceptance of the updated Terms. If you do not agree, you must stop using the Platform and request account closure.",
    ],
  },
  {
    number: 16,
    title: "Governing Law and Disputes",
    clauses: [
      "These Terms are governed by the laws of Lebanon, without regard to conflict-of-law principles.",
      "The courts of Beirut shall have exclusive jurisdiction over disputes arising out of or relating to these Terms, subject to any mandatory consumer or other protections that cannot be waived.",
      "Before filing a claim, the parties shall attempt in good faith to resolve the dispute by written notice to the contact email below.",
    ],
  },
  {
    number: 17,
    title: "General",
    clauses: [
      "If any provision of these Terms is held unenforceable, the remaining provisions remain in full force. Failure to enforce a provision is not a waiver. You may not assign these Terms without Operator’s prior written consent; Operator may assign to an affiliate or successor. These Terms, together with any applicable service agreement and policies published on zboun.net, constitute the entire agreement regarding the subject matter herein and supersede conflicting prior understandings on the same subject, except that a signed written service agreement expressly stating it controls shall prevail to the extent of conflict.",
      "For notices relating to these Terms: " + ZBOUN_OPS_EMAIL + " · Website: https://zboun.net",
      "Nothing in these Terms creates or shall be construed as creating any partnership, joint venture, agency, franchise, employment, fiduciary, or other similar relationship between Operator and the Merchant. The Merchant has no authority to bind Operator or incur any obligation on Operator’s behalf.",
      "Operator shall not be liable for any delay, interruption, suspension, or failure in the performance or availability of the Platform resulting from circumstances beyond its reasonable control, including internet or telecommunications failures, hosting or cloud service failures, power outages, cyberattacks, acts of government or public authorities, changes in law, natural disasters, war, civil unrest, strikes, epidemics, or other force majeure events.",
    ],
  },
];

export const MERCHANT_TERMS_ACCEPTANCE_NOTICE =
  "By logging into your Zboun store account, you confirm that you have read and agree to the attached Merchant Terms of Service. Continued use of the Platform constitutes ongoing acceptance.";
