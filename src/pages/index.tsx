import type { NextPage } from "next";
import DefaultLayout from "../layout/default";

const Home: NextPage = () => {
  return (
    <DefaultLayout>
      <main className="flex min-h-screen w-full flex-col text-white">
        <header className="flex w-full items-center justify-between px-6 py-6 md:px-12">
          <div className="text-lg font-semibold tracking-[0.2em] text-white/80">
            typesdigital
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-white/70 md:flex">
            <a className="transition hover:text-white" href="#services">
              Services
            </a>
            <a className="transition hover:text-white" href="#work">
              Work
            </a>
            <a className="transition hover:text-white" href="#process">
              Process
            </a>
            <a className="transition hover:text-white" href="#contact">
              Contact
            </a>
          </nav>
          <a
            className="rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white/80 transition hover:border-white hover:text-white"
            href="#contact"
          >
            Start a project
          </a>
        </header>

        <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 pb-16 pt-10 md:flex-row md:items-center md:px-12 md:pt-16">
          <div className="flex flex-1 flex-col gap-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
              Digital products for ambitious teams
            </p>
            <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
              Typesdigital builds tech-forward websites and platforms that move
              fast, scale clean, and look unforgettable.
            </h1>
            <p className="text-base text-white/70 md:text-lg">
              We are a full-stack digital studio blending strategy, design, and
              engineering to launch experiences that turn visitors into
              customers. From MVPs to enterprise rebrands, we make it work.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:shadow-xl"
                href="#contact"
              >
                Book a discovery call
              </a>
              <a
                className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white hover:text-white"
                href="#services"
              >
                Explore services
              </a>
            </div>
            <div className="flex flex-wrap gap-6 text-xs uppercase tracking-[0.25em] text-white/50">
              <span>Product strategy</span>
              <span>UX/UI design</span>
              <span>Web apps</span>
              <span>Brand systems</span>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur md:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Latest launch
                </p>
                <h2 className="text-2xl font-semibold">NeonBridge</h2>
              </div>
              <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70">
                8 weeks
              </span>
            </div>
            <p className="text-sm text-white/70">
              A fintech platform rebuilt with realtime dashboards, secure
              onboarding, and a modular design system to support rapid
              experimentation.
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs text-white/60">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-lg font-semibold text-white">+48%</p>
                <p>Conversion uplift</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-lg font-semibold text-white">2.1s</p>
                <p>Median load time</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-lg font-semibold text-white">15</p>
                <p>Integrations shipped</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-lg font-semibold text-white">24/7</p>
                <p>Monitoring & support</p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="services"
          className="mx-auto grid w-full max-w-6xl gap-6 px-6 pb-20 md:grid-cols-3 md:px-12"
        >
          {[
            {
              title: "Design systems",
              body: "Scalable UI kits, component libraries, and brand rules that keep teams aligned.",
            },
            {
              title: "Product engineering",
              body: "Next.js, Node, and cloud architecture for high-performing web apps.",
            },
            {
              title: "Growth-ready sites",
              body: "SEO, analytics, and conversion optimization baked into every launch.",
            },
          ].map((service) => (
            <article
              key={service.title}
              className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-6"
            >
              <h3 className="text-xl font-semibold">{service.title}</h3>
              <p className="text-sm text-white/70">{service.body}</p>
              <span className="text-xs uppercase tracking-[0.25em] text-white/40">
                Learn more →
              </span>
            </article>
          ))}
        </section>

        <section
          id="work"
          className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-20 md:flex-row md:items-center md:px-12"
        >
          <div className="flex flex-1 flex-col gap-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              Featured work
            </p>
            <h2 className="text-3xl font-semibold md:text-4xl">
              Partnering with teams ready to ship bold ideas.
            </h2>
            <p className="text-sm text-white/70">
              We work with startups, scale-ups, and enterprise innovators to
              create digital experiences that feel polished and perform.
            </p>
          </div>
          <div className="grid flex-1 gap-4">
            {[
              {
                name: "Lumen Health",
                detail: "Telehealth experience redesign + HIPAA hosting",
              },
              {
                name: "Atlas Mobility",
                detail: "Fleet management portal with live tracking",
              },
              {
                name: "PulsePay",
                detail: "Payments onboarding flow + identity verification",
              },
            ].map((project) => (
              <div
                key={project.name}
                className="rounded-2xl border border-white/10 bg-black/40 p-5"
              >
                <h3 className="text-lg font-semibold">{project.name}</h3>
                <p className="text-sm text-white/70">{project.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="process"
          className="mx-auto grid w-full max-w-6xl gap-6 px-6 pb-20 md:grid-cols-4 md:px-12"
        >
          {[
            "Discovery & roadmap",
            "Design & prototyping",
            "Engineering & QA",
            "Launch & optimization",
          ].map((step, index) => (
            <div
              key={step}
              className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-6"
            >
              <span className="text-xs uppercase tracking-[0.3em] text-white/50">
                Step {index + 1}
              </span>
              <h3 className="text-lg font-semibold">{step}</h3>
              <p className="text-sm text-white/70">
                Clear deliverables, tight feedback loops, and momentum from day
                one.
              </p>
            </div>
          ))}
        </section>

        <section
          id="contact"
          className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-6 pb-24 text-center md:px-12"
        >
          <div className="max-w-2xl space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              Ready to build?
            </p>
            <h2 className="text-3xl font-semibold md:text-4xl">
              Tell us about your product and we will respond within 24 hours.
            </h2>
            <p className="text-sm text-white/70">
              Get a tailored roadmap, timeline, and estimate from the
              Typesdigital team.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:shadow-xl"
              href="mailto:hello@typesdigital.com"
            >
              hello@typesdigital.com
            </a>
            <a
              className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white hover:text-white"
              href="tel:+15551234567"
            >
              +1 (555) 123-4567
            </a>
          </div>
        </section>
      </main>
    </DefaultLayout>
  );
};

export default Home;
