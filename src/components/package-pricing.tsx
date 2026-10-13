import { formatPrice } from "@/data/catalog";
import type { Offer } from "@/data/offers";

type Presentation = Offer["packagePresentation"];

export function PackageItems({ presentation }: { presentation: Presentation }) {
  if (!presentation?.enabled) return null;
  return <ul className="offer-package-items" aria-label="عناصر الباقة">
    {presentation.items.map((item) => <li key={item.id}>
      <strong>{item.title}</strong><span><b dir={item.price.status === "on-demand" ? "rtl" : "ltr"}>{formatPrice(item.price).label}</b>
        {formatPrice(item.price).clarification ? <small>{formatPrice(item.price).clarification}</small> : null}</span>
    </li>)}
  </ul>;
}

export function PackageFooter({ presentation }: { presentation: Presentation }) {
  if (!presentation?.enabled || !presentation.fullPrice) return null;
  const price = formatPrice(presentation.fullPrice);
  return <span className="offer-package-total"><span>{presentation.label}</span><b dir={presentation.fullPrice.status === "on-demand" ? "rtl" : "ltr"}>{price.label}</b>
    {price.clarification ? <small>{price.clarification}</small> : null}</span>;
}
