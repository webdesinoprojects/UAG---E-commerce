"use client";

import { useRef } from "react";
import Image from "next/image";
import { ArrowRight, ThumbsUp } from "lucide-react";

const benefits = [
  {
    title: "Fast Delivery",
    description: "Chances are there wasn’t collaboration and checkpoints, there wasn’t a process.",
    image: "/images/icons/fast-delivery.svg",
  },
  {
    title: "Best Quality",
    description: "It’s content strategy gone awry right from the start. Forswearing the use of Lorem Ipsum.",
    icon: ThumbsUp,
  },
  {
    title: "Free Return",
    description: "True enough, but that’s not all that it takes to get things back on track out there for a text.",
    image: "/images/icons/free-return.svg",
  },
];

export default function QualityGoods() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollNext = () => {
    scrollerRef.current?.scrollBy({
      left: scrollerRef.current.clientWidth * 0.82,
      behavior: "smooth",
    });
  };

  return (
    <section className="w-full border-t border-zinc-100 bg-white px-4 py-16 font-sans dark:border-zinc-800 dark:bg-zinc-950 sm:px-6 lg:px-8 lg:py-20">
      <div className="relative mx-auto max-w-7xl text-center">
        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">There are some redeeming factors</p>
        <h2 className="mt-5 text-3xl font-medium tracking-wide text-zinc-900 dark:text-white sm:text-4xl">We Provide High Quality Goods</h2>
        <p className="mx-auto mt-5 max-w-4xl text-sm leading-7 text-zinc-500 dark:text-zinc-400 sm:text-base">A client that’s unhappy for a reason is a problem, a client that’s unhappy though he or her can’t</p>

        <div ref={scrollerRef} className="mt-12 flex snap-x snap-mandatory overflow-x-auto pb-3 pr-12 scrollbar-hide md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:pb-0 md:pr-0">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <article key={benefit.title} className="flex w-[78vw] max-w-[20rem] shrink-0 snap-start flex-col items-center bg-transparent px-5 py-7 md:w-auto md:max-w-none md:px-0 md:py-0">
                {benefit.image ? (
                  <Image src={benefit.image} alt="" width={64} height={64} aria-hidden="true" className="h-14 w-14 object-contain" />
                ) : Icon ? (
                  <Icon aria-hidden="true" className="h-14 w-14 stroke-[1.8] text-[#2868c7]" />
                ) : null}
                <h3 className="mt-7 text-2xl font-medium text-zinc-900 dark:text-white">{benefit.title}</h3>
                <p className="mt-4 max-w-sm text-sm leading-7 text-zinc-500 dark:text-zinc-400 sm:text-base">{benefit.description}</p>
              </article>
            );
          })}
        </div>

        <button type="button" onClick={scrollNext} aria-label="Show next quality benefit" className="absolute right-0 bottom-24 flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-md md:hidden">
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
