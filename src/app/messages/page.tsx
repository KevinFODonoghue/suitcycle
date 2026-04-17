import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { MessageCircle, ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?next=/messages");
  const userId = session.user.id as string;

  // Fetch all messages involving this user, most recent first
  const messages = await prisma.message.findMany({
    where: { OR: [{ fromUserId: userId }, { toUserId: userId }] },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      body: true,
      createdAt: true,
      fromUserId: true,
      toUserId: true,
      fromUser: { select: { id: true, fullName: true, avatarUrl: true, image: true } },
      toUser:   { select: { id: true, fullName: true, avatarUrl: true, image: true } },
    },
  });

  // Build conversation map keyed by counterparty id (most-recent-per-pair)
  const seen = new Set<string>();
  const conversations: typeof messages = [];
  for (const msg of messages) {
    const counterpartyId = msg.fromUserId === userId ? msg.toUserId : msg.fromUserId;
    if (!seen.has(counterpartyId)) {
      seen.add(counterpartyId);
      conversations.push(msg);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Messages</h1>
          <p className="text-sm text-[#64748B] mt-1">Your conversations with buyers and sellers</p>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6">
        {conversations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#F0F7FF] flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={22} className="text-[#00B4FF]" />
            </div>
            <p className="font-semibold text-[#1A1A2E] mb-1">No messages yet</p>
            <p className="text-sm text-[#64748B] mb-5">
              When you message a seller or a buyer messages you, conversations appear here.
            </p>
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00B4FF] text-white font-semibold text-sm hover:bg-[#0066AA] transition-colors"
            >
              Browse listings
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50">
            {conversations.map((msg) => {
              const counterparty = msg.fromUserId === userId ? msg.toUser : msg.fromUser;
              const avatar = counterparty.avatarUrl ?? counterparty.image ?? null;
              const name = counterparty.fullName ?? "User";
              const isMine = msg.fromUserId === userId;

              return (
                <Link
                  key={msg.id}
                  href={`/messages/${counterparty.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group"
                >
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full overflow-hidden bg-[#F0F7FF] shrink-0">
                    {avatar ? (
                      <Image
                        src={avatar}
                        alt={name}
                        width={44}
                        height={44}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#00B4FF] font-bold">
                        {name[0].toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A2E] truncate">{name}</p>
                    <p className="text-xs text-[#64748B] truncate mt-0.5">
                      {isMine ? "You: " : ""}
                      {msg.body}
                    </p>
                  </div>

                  {/* Time + arrow */}
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span className="text-[10px] text-slate-400">
                      {new Date(msg.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
