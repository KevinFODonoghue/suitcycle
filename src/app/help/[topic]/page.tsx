import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ChevronRight, HelpCircle } from "lucide-react";
import { getTopicById, HELP_TOPICS } from "@/lib/help/articles";

interface PageProps {
  params: Promise<{ topic: string }>;
}

export async function generateStaticParams() {
  return HELP_TOPICS.map((t) => ({ topic: t.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { topic: topicId } = await params;
  const topic = getTopicById(topicId);
  if (!topic) return {};
  return {
    title: `${topic.name}, SuitCycle Help`,
    description: topic.description,
  };
}

export default async function HelpTopicPage({ params }: PageProps) {
  const { topic: topicId } = await params;
  const topic = getTopicById(topicId);
  if (!topic) notFound();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-[#0A0F1A] relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 100%, #003A6E 0%, #001A3A 50%, #0A0F1A 100%)",
          }}
        />
        <div className="relative z-10 container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Link
            href="/help"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={14} /> Help Center
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00B4FF]/30 bg-[#00B4FF]/10 px-4 py-1.5 text-sm text-[#66D4FF] font-medium mb-4">
            <HelpCircle size={14} />
            {topic.name}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-3">
            {topic.name}
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">{topic.heroSubtitle}</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 50" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-10 block">
            <path d="M0,25 C360,50 720,0 1080,25 C1260,37 1380,15 1440,25 L1440,50 L0,50 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Content */}
      <section className="py-14">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-8">
          {topic.sections.map((section) => (
            <div key={section.title} className="rounded-3xl border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 bg-[#F8FAFC] border-b border-slate-100">
                <h2 className="font-bold text-[#1A1A2E]">{section.title}</h2>
                {section.description && (
                  <p className="text-sm text-[#64748B] mt-1">{section.description}</p>
                )}
              </div>
              <div className="divide-y divide-slate-50 bg-white">
                {section.links.map((link) => (
                  <Link
                    key={link.slug}
                    href={`/help/${topic.id}/${link.slug}`}
                    className="flex items-start gap-3 px-6 py-4 hover:bg-[#F8FAFC] transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1A1A2E] group-hover:text-[#00B4FF] transition-colors">
                        {link.title}
                      </p>
                      {link.summary && (
                        <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{link.summary}</p>
                      )}
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-[#00B4FF] transition-colors shrink-0 mt-0.5" />
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div className="text-center pt-4">
            <Link
              href="/help"
              className="inline-flex items-center gap-2 text-sm text-[#00B4FF] hover:underline font-medium"
            >
              <ArrowLeft size={14} />
              Back to Help Center
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
