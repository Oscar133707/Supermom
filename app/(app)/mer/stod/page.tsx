import { Phone, MessageCircle, Globe } from "lucide-react";
import { requireMom } from "@/lib/data";
import { SubHeader } from "@/components/mer/sub-header";

const RESOURCES = [
  { title: "112", sub: "Akut fara för liv eller hälsa", href: "tel:112", icon: Phone, strong: true },
  { title: "1177", sub: "Sjukvårdsrådgivning dygnet runt", href: "tel:1177", icon: Phone },
  { title: "Självmordslinjen 90101", sub: "Mind – samtal med någon som lyssnar", href: "tel:90101", icon: Phone },
  { title: "Chatta med Självmordslinjen", sub: "mind.se", href: "https://mind.se/hitta-hjalp/sjalvmordslinjen/", icon: MessageCircle },
  { title: "1177.se", sub: "Information och e-tjänster", href: "https://www.1177.se", icon: Globe },
];

export default async function SupportPage() {
  await requireMom();
  return (
    <main className="flex flex-col gap-6 px-4 pt-4">
      <SubHeader title="Behöver du stöd nu?" lead="Du behöver inte klara allt själv. Det är styrka att be om hjälp." />
      <ul className="flex flex-col gap-2">
        {RESOURCES.map(({ title, sub, href, icon: Icon, strong }) => (
          <li key={title}>
            <a
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              className={
                "flex min-h-[4.5rem] items-center gap-4 rounded-[1.5rem] px-5 py-3 shadow-card active:scale-[0.99] " +
                (strong ? "bg-danger text-white" : "bg-surface")
              }
            >
              <Icon size={22} className={strong ? "" : "text-ink-2"} />
              <span>
                <span className="block font-semibold">{title}</span>
                <span className={"text-sm " + (strong ? "text-white/85" : "text-ink-2")}>{sub}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="px-1 text-sm text-ink-2">
        Har du en krisplan eller en kontakt i psykiatrin – ring dem gärna först. Du kan också höra av dig till Oscar.
      </p>
    </main>
  );
}
