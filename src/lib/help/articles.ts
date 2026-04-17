export type HelpTopicId = "policies" | "user-agreements" | "how-to-guides";

export type HelpTopicLink = {
  slug: string;
  title: string;
  summary?: string;
};

export type HelpTopicSection = {
  title: string;
  description?: string;
  links: HelpTopicLink[];
};

export type HelpTopic = {
  id: HelpTopicId;
  name: string;
  description: string;
  heroSubtitle: string;
  sections: HelpTopicSection[];
};

export type HelpArticle = {
  topicId: HelpTopicId;
  topicName: string;
  sectionTitle: string;
  slug: string;
  title: string;
  summary?: string;
};

export const HELP_TOPICS = [
  {
    id: "policies",
    name: "SuitCycle Policies",
    description: "Returns, shipping timelines, and listing rules that protect every order.",
    heroSubtitle: "Learn how SuitCycle keeps buyers and sellers protected with clear policies and proactive enforcement.",
    sections: [
      {
        title: "Policies",
        links: [
          {
            slug: "returns-refund-policy",
            title: "Returns & Refund Policy",
            summary: "How refunds are handled when something is wrong with a suit.",
          },
          {
            slug: "shipping-policy",
            title: "Shipping Policy",
            summary: "Carrier expectations, timelines, and tracking requirements.",
          },
          {
            slug: "buyer-protection-policy",
            title: "Buyer Protection Policy",
            summary: "When orders qualify for SuitCycle Buyer Protection.",
          },
          {
            slug: "seller-guidelines",
            title: "Seller Guidelines",
            summary: "Listing standards every seller agrees to follow.",
          },
          {
            slug: "prohibited-items-and-content",
            title: "Prohibited Items & Content",
            summary: "What can't be listed or promoted on SuitCycle.",
          },
        ],
      },
      {
        title: "Policy FAQs",
        links: [
          {
            slug: "order-never-arrives",
            title: "What should I do if my order never arrives?",
          },
          {
            slug: "return-doesnt-fit",
            title: "Can I return an item if it doesn't fit?",
          },
          {
            slug: "seller-ship-deadline",
            title: "How long does a seller have to ship my order?",
          },
          {
            slug: "fake-or-altered-suit",
            title: "What happens if a seller lists a fake or altered suit?",
          },
          {
            slug: "buyer-protection-refund",
            title: "How do I qualify for a refund under Buyer Protection?",
          },
          {
            slug: "sell-damaged-suit",
            title: "Can I sell a suit that's damaged or heavily worn?",
          },
        ],
      },
    ],
  },
  {
    id: "user-agreements",
    name: "User Agreements",
    description: "Understand the terms, privacy practices, and account expectations on SuitCycle.",
    heroSubtitle: "Review the agreements you accept when creating an account or browsing SuitCycle.",
    sections: [
      {
        title: "User Agreements",
        links: [
          {
            slug: "terms-of-service",
            title: "Terms of Service",
          },
          {
            slug: "privacy-policy",
            title: "Privacy Policy",
          },
        ],
      },
      {
        title: "User Agreement FAQs",
        links: [
          {
            slug: "create-account-agreement",
            title: "What am I agreeing to when I create a SuitCycle account?",
          },
          {
            slug: "protect-personal-information",
            title: "How does SuitCycle protect my personal information?",
          },
          {
            slug: "share-information-anyone-else",
            title: "Does SuitCycle share my information with anyone else?",
          },
          {
            slug: "delete-account-and-data",
            title: "Can I delete my SuitCycle account and personal data?",
          },
          {
            slug: "violates-terms-of-service",
            title: "What happens if someone violates the Terms of Service?",
          },
        ],
      },
    ],
  },
  {
    id: "how-to-guides",
    name: "How-To Guides",
    description: "Step-by-step walkthroughs for buying, selling, and using SuitScore.",
    heroSubtitle: "Get tips from SuitCycle experts on listing, SuitScore grading, and confident purchasing.",
    sections: [
      {
        title: "How-To Guides",
        links: [
          {
            slug: "how-to-buy-on-suitcycle",
            title: "How to Buy on SuitCycle",
          },
          {
            slug: "how-to-sell-on-suitcycle",
            title: "How to Sell on SuitCycle",
          },
          {
            slug: "suitscore-grading-guide",
            title: "SuitScore™ Grading Guide",
          },
        ],
      },
      {
        title: "How-To Guide FAQs",
        links: [
          {
            slug: "suitscore-accuracy",
            title: "How do I know if a SuitScore is accurate?",
          },
          {
            slug: "contact-seller-before-buying",
            title: "Can I contact a seller before buying?",
          },
          {
            slug: "after-selling-guide",
            title: "What should I do after I've sold a suit?",
          },
          {
            slug: "payout-after-selling",
            title: "When will I get paid after selling?",
          },
          {
            slug: "improve-chances-of-selling",
            title: "How can I improve my chances of selling?",
          },
          {
            slug: "suitscore-levels-meaning",
            title: "What do the different SuitScore™ levels mean?",
          },
        ],
      },
    ],
  },
] as const satisfies HelpTopic[];

export const HELP_TOPIC_MAP: Record<HelpTopicId, HelpTopic> = HELP_TOPICS.reduce(
  (acc, topic) => {
    acc[topic.id] = topic;
    return acc;
  },
  {} as Record<HelpTopicId, HelpTopic>,
);

export const HELP_ARTICLES: HelpArticle[] = HELP_TOPICS.flatMap((topic) =>
  topic.sections.flatMap((section) =>
    section.links.map((link) => ({
      topicId: topic.id,
      topicName: topic.name,
      sectionTitle: section.title,
      slug: link.slug,
      title: link.title,
      summary: (link as HelpTopicLink).summary,
    })),
  ),
);

export function getTopicById(topicId: string): HelpTopic | undefined {
  return HELP_TOPICS.find((topic) => topic.id === topicId);
}

export function getArticle(topicId: string, slug: string): HelpArticle | undefined {
  return HELP_ARTICLES.find((article) => article.topicId === topicId && article.slug === slug);
}
