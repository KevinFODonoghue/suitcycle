import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { MessageComposer } from "./MessageComposer";

interface PageProps {
  params: Promise<{ userId: string }>;
  searchParams: Promise<Record<string, string>>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { userId } = await params;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { fullName: true },
  });
  return { title: user ? `Messages with ${user.fullName ?? "User"}` : "Messages" };
}

export default async function ConversationPage({ params, searchParams }: PageProps) {
  const { userId: counterpartyId } = await params;
  const { listing: listingId } = await searchParams;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect(`/login?next=/messages/${counterpartyId}`);
  const myId = session.user.id as string;

  if (myId === counterpartyId) redirect("/messages");

  const [counterparty, messages, listingContext] = await Promise.all([
    prisma.user.findUnique({
      where: { id: counterpartyId },
      select: { id: true, fullName: true, avatarUrl: true, image: true, handle: true },
    }),
    prisma.message.findMany({
      where: {
        OR: [
          { fromUserId: myId, toUserId: counterpartyId },
          { fromUserId: counterpartyId, toUserId: myId },
        ],
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        body: true,
        createdAt: true,
        fromUserId: true,
      },
    }),
    listingId
      ? prisma.listing.findUnique({
          where: { id: listingId },
          select: { id: true, brand: true, model: true, price: true, photos: true, status: true },
        })
      : null,
  ]);

  if (!counterparty) notFound();

  const avatar = counterparty.avatarUrl ?? counterparty.image ?? null;
  const name = counterparty.fullName ?? `@${counterparty.handle}`;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-16 z-10">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
          <Link
            href="/messages"
            className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1A1A2E] transition-colors shrink-0"
          >
            <ArrowLeft size={15} />
            Inbox
          </Link>
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-[#F0F7FF] shrink-0">
              {avatar ? (
                <Image src={avatar} alt={name} width={32} height={32} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#00B4FF] font-bold text-sm">
                  {name[0].toUpperCase()}
                </div>
              )}
            </div>
            <span className="font-semibold text-[#1A1A2E] text-sm truncate">{name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col gap-4">

        {/* Listing context card */}
        {listingContext && (
          <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
              {listingContext.photos[0] ? (
                <Image
                  src={listingContext.photos[0]}
                  alt={`${listingContext.brand} ${listingContext.model}`}
                  width={56}
                  height={56}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-slate-100" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#64748B]">Asking about</p>
              <p className="text-sm font-semibold text-[#1A1A2E] truncate">
                {listingContext.brand} {listingContext.model}
              </p>
              <p className="text-xs text-[#64748B]">
                ${(listingContext.price / 100).toFixed(0)}
              </p>
            </div>
            <Link
              href={`/listings/${listingContext.id}`}
              className="shrink-0 flex items-center gap-1 text-xs text-[#00B4FF] hover:underline"
            >
              View <ExternalLink size={11} />
            </Link>
          </div>
        )}

        {/* Message thread */}
        <div className="flex-1 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-10 text-sm text-[#64748B]">
              No messages yet, say hello!
            </div>
          )}
          {messages.map((msg) => {
            const isMine = msg.fromUserId === myId;
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isMine
                      ? "bg-[#00B4FF] text-white rounded-br-sm"
                      : "bg-white border border-slate-100 text-[#1A1A2E] rounded-bl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                  <p className={`text-[10px] mt-1 ${isMine ? "text-white/60" : "text-slate-400"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Composer */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 sticky bottom-4">
          <MessageComposer
            toUserId={counterpartyId}
            listingId={listingId ?? null}
          />
        </div>
      </div>
    </div>
  );
}
