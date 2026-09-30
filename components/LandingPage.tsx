'use client';

import React from 'react';
import Image from 'next/image';
import {ArrowUpRight} from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

/** Self-hosted competition photography (public/landing) */
const IMG = {
  hero: '/landing/hero.jpg',
  pit: '/landing/pit.jpg',
  field: '/landing/field.jpg',
  hands: '/landing/hands.jpg',
  crowd: '/landing/crowd.jpg',
};

export const LandingPage: React.FC<LandingPageProps> = ({onEnter}) => {
  return (
    <div className="landing-grain relative min-h-screen overflow-x-hidden bg-[#0a0a0b] text-[#f4f0ea]">
      {/* Warm ambient wash — not cyan grid */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-1/4 top-0 h-[70vh] w-[70vw] rounded-full bg-[#c45c26]/12 blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-[50vh] w-[40vw] rounded-full bg-[#1a4d6d]/25 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-[40vh] w-[50vw] rounded-full bg-[#8b3a1a]/10 blur-[90px]" />
      </div>

      {/* ── Nav ── */}
      <header className="relative z-20 mx-auto flex max-w-[1400px] items-center justify-between px-6 pb-2 pt-7 sm:px-10 lg:px-14">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-2xl font-semibold tracking-tight text-[#f4f0ea] sm:text-[1.75rem]">
            Vortex
          </span>
          <span className="font-landing-mono text-[11px] tracking-[0.22em] text-[#f4f0ea]/45 uppercase">
            5419
          </span>
        </div>
        <nav className="flex items-center gap-6 sm:gap-8">
          <a
            href="#work"
            className="hidden text-[13px] tracking-wide text-[#f4f0ea]/55 transition hover:text-[#f4f0ea] sm:inline"
          >
            What it does
          </a>
          <a
            href="#access"
            className="hidden text-[13px] tracking-wide text-[#f4f0ea]/55 transition hover:text-[#f4f0ea] md:inline"
          >
            Access
          </a>
          <button
            type="button"
            onClick={onEnter}
            className="group inline-flex items-center gap-1.5 text-[13px] font-medium tracking-wide text-[#f4f0ea] transition"
          >
            Sign in
            <ArrowUpRight className="h-3.5 w-3.5 opacity-60 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
          </button>
        </nav>
      </header>

      {/* ── Hero: split editorial ── */}
      <section className="relative z-10 mx-auto grid max-w-[1400px] items-end gap-10 px-6 pb-16 pt-10 sm:px-10 lg:grid-cols-12 lg:gap-8 lg:px-14 lg:pb-24 lg:pt-14">
        <div className="lg:col-span-6 lg:pb-6">
          <p className="font-landing-mono mb-6 text-[11px] tracking-[0.28em] text-[#e8a87c]/80 uppercase">
            FIRST · REEFSCAPE · TEAM 5419
          </p>
          <h1 className="font-display text-[clamp(2.75rem,7.5vw,5.75rem)] leading-[0.92] font-medium tracking-[-0.02em] text-[#f4f0ea]">
            Built for the
            <br />
            <em className="font-normal text-[#e8a87c]">people</em> on
            <br />
            the field.
          </h1>
          <p className="mt-8 max-w-md text-[15px] leading-[1.65] text-[#f4f0ea]/55 sm:text-base">
            Match notes while the alliance is still rolling. Pit specs between inspections. Floor
            time logged with a code your lead just made — not another fake kiosk PIN.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <button
              type="button"
              onClick={onEnter}
              className="inline-flex items-center gap-3 bg-[#f4f0ea] px-7 py-3.5 text-[13px] font-semibold tracking-wide text-[#0a0a0b] transition hover:bg-[#e8a87c]"
            >
              Open the console
              <ArrowUpRight className="h-4 w-4" />
            </button>
            <span className="font-landing-mono max-w-[14rem] text-[11px] leading-relaxed tracking-wide text-[#f4f0ea]/35">
              Admin token · Member name + password after first setup
            </span>
          </div>
        </div>

        <div className="relative lg:col-span-6">
          <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[5/6] lg:ml-auto lg:max-w-xl lg:aspect-[4/5]">
            <Image
              src={IMG.hero}
              alt="Engineers working on robotics hardware in a lab"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover object-[center_30%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b]/75 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <p className="font-display text-xl leading-snug text-[#f4f0ea] sm:text-2xl">
                “Scouting shouldn’t feel like homework during eliminations.”
              </p>
              <p className="mt-2 font-landing-mono text-[10px] tracking-[0.2em] text-[#f4f0ea]/45 uppercase">
                Design brief · Vortex software
              </p>
            </div>
          </div>
          {/* Offset caption plate — not a card grid */}
          <div className="pointer-events-none absolute -bottom-4 -left-2 hidden w-44 rotate-[-3deg] bg-[#c45c26] px-4 py-3 text-[#0a0a0b] shadow-2xl sm:block lg:-left-8">
            <p className="font-landing-mono text-[10px] tracking-widest uppercase opacity-70">Season</p>
            <p className="font-display text-lg leading-none">Reefscape</p>
          </div>
        </div>
      </section>

      {/* ── Full-bleed photo band ── */}
      <section className="relative z-10 mt-6 h-[38vh] min-h-[220px] w-full overflow-hidden sm:h-[46vh]">
        <Image
          src={IMG.crowd}
          alt="Team collaborating under arena lights"
          fill
          sizes="100vw"
          className="object-cover object-center opacity-90"
        />
        <div className="absolute inset-0 bg-[#0a0a0b]/55" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0b] via-[#0a0a0b]/40 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-[1400px] items-end px-6 pb-10 sm:px-10 lg:px-14">
          <p className="font-display max-w-xl text-2xl leading-tight text-[#f4f0ea] sm:text-3xl md:text-4xl">
            From queue queue to finals — one place for what the robot actually did.
          </p>
        </div>
      </section>

      {/* ── What it does: magazine rows, not icon boxes ── */}
      <section id="work" className="relative z-10 mx-auto max-w-[1400px] px-6 py-20 sm:px-10 sm:py-28 lg:px-14">
        <div className="mb-16 flex flex-col gap-4 border-b border-[#f4f0ea]/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-display text-3xl tracking-tight text-[#f4f0ea] sm:text-4xl md:text-5xl">
            On the floor
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-[#f4f0ea]/45">
            Less dashboard chrome. More of the work that wins matches.
          </p>
        </div>

        {/* Row 1 */}
        <article className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="relative aspect-[16/11] overflow-hidden lg:col-span-7">
            <Image
              src={IMG.field}
              alt="Robotics competition field under bright lights"
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover"
            />
          </div>
          <div className="lg:col-span-5">
            <p className="font-landing-mono text-[11px] tracking-[0.25em] text-[#e8a87c] uppercase">
              01 — Match scouting
            </p>
            <h3 className="font-display mt-3 text-2xl leading-snug text-[#f4f0ea] sm:text-3xl">
              Write what you saw before the next queue starts.
            </h3>
            <p className="mt-4 text-[15px] leading-relaxed text-[#f4f0ea]/50">
              Auto cycles, climb notes, driver feel — saved to SQL the moment you hit submit. Members
              add alliance teams as they appear; leads pull analytics when it matters.
            </p>
          </div>
        </article>

        {/* Row 2 reversed */}
        <article className="mt-20 grid items-center gap-10 lg:mt-28 lg:grid-cols-12 lg:gap-14">
          <div className="order-2 lg:order-1 lg:col-span-5">
            <p className="font-landing-mono text-[11px] tracking-[0.25em] text-[#e8a87c] uppercase">
              02 — Pit &amp; floor
            </p>
            <h3 className="font-display mt-3 text-2xl leading-snug text-[#f4f0ea] sm:text-3xl">
              Specs in the pits. Enter time with a live code.
            </h3>
            <p className="mt-4 text-[15px] leading-relaxed text-[#f4f0ea]/50">
              Photograph drivetrains, note inspection status, and log who’s on the floor using a code
              your admin generates for the session — no NFC theater, no permanent 4-digit PIN.
            </p>
          </div>
          <div className="relative order-1 aspect-[16/11] overflow-hidden lg:order-2 lg:col-span-7">
            <Image
              src={IMG.pit}
              alt="Technicians assembling mechanical systems"
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover"
            />
          </div>
        </article>

        {/* Row 3 — overlapping photo composition */}
        <article className="mt-20 grid items-end gap-8 lg:mt-28 lg:grid-cols-12">
          <div className="lg:col-span-4 lg:pb-8">
            <p className="font-landing-mono text-[11px] tracking-[0.25em] text-[#e8a87c] uppercase">
              03 — Strategy
            </p>
            <h3 className="font-display mt-3 text-2xl leading-snug text-[#f4f0ea] sm:text-3xl">
              Picklist when the data is real.
            </h3>
            <p className="mt-4 text-[15px] leading-relaxed text-[#f4f0ea]/50">
              Admins rank alliances from scouting that actually happened — not seed spreadsheets from
              last week. Clear the board when the event ends.
            </p>
          </div>
          <div className="relative lg:col-span-8">
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <Image
                src={IMG.hands}
                alt="Close-up of hands working on precision electronics"
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
              />
            </div>
            <p className="mt-4 font-landing-mono text-[11px] tracking-wide text-[#f4f0ea]/30">
              Postgres pooler · local SQLite fallback · empty start when you want a clean slate
            </p>
          </div>
        </article>
      </section>

      {/* ── Access: two columns of type, no twin feature cards ── */}
      <section
        id="access"
        className="relative z-10 border-t border-[#f4f0ea]/10 bg-[#0e0e10] px-6 py-20 sm:px-10 sm:py-28 lg:px-14"
      >
        <div className="mx-auto grid max-w-[1400px] gap-16 lg:grid-cols-2 lg:gap-24">
          <div>
            <p className="font-landing-mono text-[11px] tracking-[0.28em] text-[#e8a87c]/70 uppercase">
              Leads
            </p>
            <h2 className="font-display mt-4 text-4xl tracking-tight text-[#f4f0ea] sm:text-5xl">
              One key.
              <br />
              Full control.
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-[#f4f0ea]/50">
              Sign in with the administrator token from your environment. Generate floor entry codes,
              clear tournament data, run SQL, shape the picklist — the tools that shouldn’t live on
              every student’s phone.
            </p>
            <button
              type="button"
              onClick={onEnter}
              className="mt-8 inline-flex items-center gap-2 border-b border-[#e8a87c] pb-1 text-[13px] font-medium text-[#e8a87c] transition hover:border-[#f4f0ea] hover:text-[#f4f0ea]"
            >
              Continue as admin
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="lg:pt-16">
            <p className="font-landing-mono text-[11px] tracking-[0.28em] text-[#7eb8c9]/80 uppercase">
              Scouts &amp; students
            </p>
            <h2 className="font-display mt-4 text-4xl tracking-tight text-[#f4f0ea] sm:text-5xl">
              Your name.
              <br />
              Your password.
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-[#f4f0ea]/50">
              First time: name, password, and the shared member token once. After that you only need
              the name and password you chose — the token stays behind the scenes for API access.
            </p>
            <button
              type="button"
              onClick={onEnter}
              className="mt-8 inline-flex items-center gap-2 border-b border-[#7eb8c9] pb-1 text-[13px] font-medium text-[#7eb8c9] transition hover:border-[#f4f0ea] hover:text-[#f4f0ea]"
            >
              Continue as member
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Closing CTA strip ── */}
      <section className="relative z-10 overflow-hidden px-6 py-24 sm:px-10 sm:py-32 lg:px-14">
        <div className="pointer-events-none absolute inset-0">
          <Image src={IMG.hero} alt="" fill sizes="100vw" className="object-cover opacity-[0.12]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0b] via-[#0a0a0b]/85 to-[#0a0a0b]" />
        </div>
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05] tracking-tight text-[#f4f0ea]">
            Ready when the field is.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-[#f4f0ea]/45">
            Set your keys in the environment, open the console, and start from empty if you want a
            clean event.
          </p>
          <button
            type="button"
            onClick={onEnter}
            className="mt-10 inline-flex items-center gap-3 bg-[#c45c26] px-8 py-4 text-[13px] font-semibold tracking-wide text-[#f4f0ea] transition hover:bg-[#e07a3d]"
          >
            Enter Vortex Command
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <footer className="relative z-10 mx-auto flex max-w-[1400px] flex-col gap-3 border-t border-[#f4f0ea]/8 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-14">
        <p className="font-display text-lg text-[#f4f0ea]/80">Vortex · 5419</p>
        <p className="font-landing-mono text-[10px] tracking-[0.18em] text-[#f4f0ea]/30 uppercase">
          FIRST Robotics Competition · Not affiliated with FIRST
        </p>
      </footer>
    </div>
  );
};
