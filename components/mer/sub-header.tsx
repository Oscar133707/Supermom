import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function SubHeader({ title, lead, back = "/mer" }: { title: string; lead?: string; back?: string }) {
  return (
    <header className="px-1">
      <Link href={back} className="-ml-2 mb-2 flex h-11 w-fit items-center gap-1 pr-3 text-sm font-medium text-ink-2">
        <ChevronLeft size={20} /> Tillbaka
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      {lead && <p className="mt-2 text-ink-2">{lead}</p>}
    </header>
  );
}
