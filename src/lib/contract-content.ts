import { ZBOUN_OPS_EMAIL } from "@/lib/zboun-contact";

export const CONTRACT_OPERATOR = {
  legalName: "Zboun",
  jurisdiction: "Lebanon",
  address: "Lebanon",
  contactEmail: ZBOUN_OPS_EMAIL,
} as const;

export const ZBOUN_PLATFORM_SERVICES = [
  "Digital menu page with categories, items, prices, and optional modifiers",
  "Restaurant admin dashboard for menu, hours, delivery settings, and orders",
  "Customer ordering flow with delivery address and scheduling during opening hours",
  "QR code and printable menu flyer export",
  "WhatsApp notification helper for order alerts (where configured)",
  "Home directory listing on the Zboun marketplace",
  "Email and platform support on a reasonable-efforts basis",
] as const;

export type ContractSection = {
  number: number;
  title: string;
  clauses: string[];
};

/** Core agreement clauses (professional summary of the full template). */
export const CONTRACT_SECTIONS: ContractSection[] = [
  {
    number: 1,
    title: "Background",
    clauses: [
      "Zboun (“Operator”) provides a software platform and related services that enable restaurants to publish digital menus, receive customer orders, and use tools made available by Operator from time to time (the “Platform”).",
      "The Restaurant wishes to access the Platform and related services in connection with its food and beverage (or related) business, subject to this Agreement.",
    ],
  },
  {
    number: 2,
    title: "Definitions",
    clauses: [
      "“Account” means the credentials and access profile issued by Operator for use of the Platform.",
      "“Customer Data” means information relating to end customers submitted through the Platform.",
      "“Restaurant Content” means menus, images, descriptions, prices, trademarks, logos, and materials the Restaurant provides through the Platform.",
      "“Services” means the Platform, Account, support, and ancillary services described in Exhibit A or on Operator’s website.",
      "“Subscription Term” means the initial subscription period and any renewal period agreed between the Parties.",
    ],
  },
  {
    number: 3,
    title: "Grant of Access; Account",
    clauses: [
      "Subject to this Agreement and timely payment of Fees, Operator grants the Restaurant a non-exclusive, non-transferable, revocable right to access and use the Services during the Subscription Term solely for the Restaurant’s internal business purposes.",
      "Operator will provide an Account after execution of this Agreement and completion of reasonable onboarding steps.",
      "The Restaurant is fully responsible for all activity under its Account, including actions by designated administrators.",
    ],
  },
  {
    number: 4,
    title: "Restaurant Obligations",
    clauses: [
      "Provide accurate, complete, and current registration, contact, and payment information and update it promptly.",
      "Use the Services only in compliance with applicable law, including consumer protection, advertising, pricing, food safety (where applicable), and electronic communications rules.",
      "Where messaging integrations (e.g. WhatsApp) are used: obtain required consents, ensure lawful content, and refrain from deceptive or unsolicited bulk communications.",
      "Represent that Restaurant Content does not infringe third-party rights or violate law.",
      "Safeguard Account credentials and notify Operator promptly of any suspected compromise.",
    ],
  },
  {
    number: 5,
    title: "Operator Obligations",
    clauses: [
      "Operator will use commercially reasonable efforts to make the Services available in accordance with published service descriptions.",
      "Support is provided on a reasonable-efforts basis via channels Operator designates.",
      "Operator may modify features for security, legal, or technical reasons, with reasonable notice where practicable.",
    ],
  },
  {
    number: 6,
    title: "Fees; Taxes; Payment",
    clauses: [
      "The Restaurant shall pay the monthly subscription fee stated on the cover page of this Agreement (“Fees”).",
      "Fees are exclusive of applicable taxes unless stated otherwise. The Restaurant is responsible for taxes other than Operator’s income taxes.",
      "Overdue amounts may accrue interest at the maximum rate permitted by law. Operator may suspend Services for material payment default after thirty (30) days’ written notice.",
      "All amounts are payable without set-off or withholding unless required by law.",
    ],
  },
  {
    number: 7,
    title: "Intellectual Property",
    clauses: [
      "Operator retains all right, title, and interest in the Services, Platform, software, and Operator branding. No rights are granted except the limited access in Section 3.",
      "The Restaurant grants Operator a non-exclusive license to use the Restaurant’s name, marks, and Restaurant Content solely to provide the Services and display public menu pages.",
      "Feedback provided by the Restaurant may be used by Operator without obligation.",
    ],
  },
  {
    number: 8,
    title: "Data Protection",
    clauses: [
      "Each Party shall process personal data in accordance with applicable law and Operator’s published Privacy Policy (Exhibit B).",
      "Operator shall implement appropriate technical and organizational measures proportionate to the Services.",
    ],
  },
  {
    number: 9,
    title: "Confidentiality",
    clauses: [
      "Each Party shall protect the other’s non-public confidential information using at least reasonable care.",
      "Confidentiality obligations do not apply to information that is public without breach, independently developed, or rightfully received from a third party.",
    ],
  },
  {
    number: 10,
    title: "Warranties; Disclaimer",
    clauses: [
      "Each Party represents it has authority to enter this Agreement.",
      "EXCEPT AS EXPRESSLY STATED HEREIN, THE SERVICES ARE PROVIDED “AS IS” AND “AS AVAILABLE.” TO THE MAXIMUM EXTENT PERMITTED BY LAW, OPERATOR DISCLAIMS ALL IMPLIED WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.",
    ],
  },
  {
    number: 11,
    title: "Limitation of Liability",
    clauses: [
      "TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEITHER PARTY SHALL BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR LOSS OF PROFITS, REVENUE, GOODWILL, OR DATA.",
      "OPERATOR’S AGGREGATE LIABILITY SHALL NOT EXCEED THE GREATER OF THE MONTHLY FEE OR THE FEES PAID BY THE RESTAURANT IN THE THREE (3) MONTHS PRECEDING THE CLAIM.",
      "These limitations do not apply to fraud, willful misconduct, the Restaurant’s payment obligations, or liability that cannot be limited by law.",
    ],
  },
  {
    number: 12,
    title: "Indemnity",
    clauses: [
      "The Restaurant shall defend and indemnify Operator from third-party claims arising from Restaurant Content, unlawful use of the Services, customer communications, or the Restaurant’s products sold to end customers.",
    ],
  },
  {
    number: 13,
    title: "Term; Suspension; Termination",
    clauses: [
      "This Agreement begins on the Effective Date and continues for the Subscription Term unless terminated earlier.",
      "Operator may suspend access immediately if reasonably necessary to prevent harm, comply with law, or address security risk.",
      "Either Party may terminate on written notice if the other materially breaches and fails to cure within thirty (30) days.",
      "Upon termination, access ceases. Provisions intended to survive (fees owed, IP, confidentiality, liability limits, indemnity) survive.",
    ],
  },
  {
    number: 14,
    title: "General",
    clauses: [
      "The Restaurant may not assign this Agreement without Operator’s prior written consent.",
      "This Agreement (with exhibits) is the entire agreement between the Parties.",
      "Amendments require written agreement unless non-material changes are communicated with reasonable notice.",
      `Notices to Operator: ${ZBOUN_OPS_EMAIL}. Notices to the Restaurant: the email on file.`,
      `This Agreement is governed by the laws of ${CONTRACT_OPERATOR.jurisdiction}, without regard to conflict-of-law rules.`,
      "The Parties are independent contractors. If any provision is invalid, the remainder remains in effect.",
    ],
  },
];
