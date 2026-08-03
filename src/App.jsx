import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Minus,
  Plus,
} from "@phosphor-icons/react";
import {
  TipHubContentProvider,
  useTipHubContent,
} from "./content/TipHubContent";

const routes = [
  { href: "/what-we-back", label: "What we back" },
  { href: "/companies", label: "Companies" },
  { href: "/founder-platform", label: "Founder platform" },
  { href: "/field-notes", label: "Field notes" },
  { href: "/about", label: "About" },
];

function useRoute() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (href) => {
    if (href === window.location.pathname) return;
    window.history.pushState({}, "", href);
    setPath(href);
    window.scrollTo({ top: 0 });
  };

  return { path, navigate };
}

function Link({ href, navigate, children, className = "", ...props }) {
  return (
    <a
      href={href}
      className={className}
      onClick={(event) => {
        if (
          !event.defaultPrevented &&
          event.button === 0 &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey
        ) {
          event.preventDefault();
          navigate(href);
        }
      }}
      {...props}
    >
      {children}
    </a>
  );
}

function Reveal({ children, className = "", delay = 0, ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.classList.add("is-visible");
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add("is-visible");
          observer.unobserve(node);
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -6%" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ "--reveal-delay": `${delay}ms` }}
      {...props}
    >
      {children}
    </div>
  );
}

function SectionLabel({ number, children, light = false }) {
  return (
    <div className={`section-label ${light ? "is-light" : ""}`}>
      <span>{number}</span>
      <i />
      <span>{children}</span>
    </div>
  );
}

function ArrowButton({ children, onClick, tone = "orange", type = "button" }) {
  return (
    <button className={`arrow-button is-${tone}`} onClick={onClick} type={type}>
      <span>{children}</span>
      <ArrowUpRight aria-hidden="true" size={19} weight="regular" />
    </button>
  );
}

function Header({ path, navigate, openPitch, hero = false }) {
  return (
    <header className={`site-header ${hero ? "home-site-header" : ""}`}>
      <Link href="/" navigate={navigate} className="brand-link" aria-label="TipHub home">
        <img src="/brand/tiphub-logo-primary.svg" alt="TipHub" />
      </Link>
      <nav aria-label="Primary navigation">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            navigate={navigate}
            className={`nav-link ${path === route.href ? "is-active" : ""}`}
          >
            {route.label}
          </Link>
        ))}
      </nav>
      <button className="header-pitch" type="button" onClick={openPitch}>
        <span>Pitch TipHub</span>
        <ArrowUpRight aria-hidden="true" size={20} weight="regular" />
      </button>
    </header>
  );
}

function HomeHero({ navigate, openPitch }) {
  const { content } = useTipHubContent();
  const { fundProfile, siteSettings } = content;

  return (
    <section className="home-hero" aria-label="TipHub: Opportunity has a geography. Ambition does not.">
      <Header path="/" navigate={navigate} openPitch={openPitch} hero />
      <img
        className="home-hero-art"
        src="/assets/tiphub-hero-background.png"
        alt="TipHub Living Atlas: a layered paper terrain connecting global ambition"
      />
      <div className="home-hero-copy">
        <h1>
          <span>Opportunity<br />has a geography.</span>
          <em>Ambition<br />does not.</em>
        </h1>
        <p>{siteSettings.companyDescription}</p>
        <div className="home-hero-actions">
          <ArrowButton onClick={openPitch} tone="carbon">Pitch TipHub</ArrowButton>
          <Link href="/companies" navigate={navigate} className="home-hero-secondary">
            Explore companies <ArrowUpRight aria-hidden="true" size={18} weight="regular" />
          </Link>
        </div>
      </div>
      <dl className="home-hero-meta">
        <div><dt>Global mandate</dt><dd>{fundProfile.stages.join(" & ")}</dd></div>
        <div><dt>{fundProfile.provisional ? "Provisional fund" : "Fund"}</dt><dd>{fundProfile.fundSize}</dd></div>
      </dl>
      <div className="scroll-cue" aria-hidden="true">
        <span>Explore the terrain</span>
        <i />
      </div>
    </section>
  );
}

function AccordionRow({
  theme,
  active,
  onToggle,
  onHoverOpen,
  onHoverClose,
  dark = false,
}) {
  return (
    <article
      className={`accordion-row ${active ? "is-open" : ""} ${dark ? "is-dark" : ""}`}
      onMouseEnter={onHoverOpen}
      onMouseLeave={onHoverClose}
    >
      <button type="button" onClick={onToggle} aria-expanded={active}>
        <span className="accordion-id">{theme.id}</span>
        <span className="accordion-title">{theme.title}</span>
        <span className="accordion-summary">{theme.description}</span>
        <span className="accordion-icon" aria-hidden="true">
          <Plus className="icon-plus" size={18} weight="regular" />
          <Minus className="icon-minus" size={18} weight="regular" />
        </span>
      </button>
      <div className="accordion-detail">
        <div>
          {theme.id === "02" && (
            <img src="/assets/essential-systems.png" alt="Industrial systems field study" />
          )}
          <div>
            <span className="eyebrow">CURRENT SIGNAL</span>
            <p>{theme.signal}</p>
            <span className="mono">{theme.tags}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function HomePage({ navigate, openPitch }) {
  const {
    content: { convictionSteps, thesisThemes, portfolio },
  } = useTipHubContent();
  const [activeTheme, setActiveTheme] = useState(1);
  return (
    <>
      <HomeHero navigate={navigate} openPitch={openPitch} />

      <section className="section section-mist index-section">
        <Reveal className="section-heading-grid">
          <SectionLabel number="02">Opportunity index</SectionLabel>
          <h2>An index of<br />opportunity.</h2>
          <p>
            We look where others scroll past. Our index maps four recurring
            arenas where overlooked problems can become foundational companies.
          </p>
        </Reveal>
        <div className="accordion">
          {thesisThemes.map((theme, index) => (
            <AccordionRow
              key={theme.id}
              theme={theme}
              active={activeTheme === index}
              onToggle={() =>
                setActiveTheme((current) => (current === index ? null : index))
              }
              onHoverOpen={() => setActiveTheme(index)}
              onHoverClose={() => setActiveTheme(null)}
            />
          ))}
        </div>
        <Link className="text-link" href="/what-we-back" navigate={navigate}>
          View the full thesis <span aria-hidden="true">↗</span>
        </Link>
      </section>

      <section className="section section-carbon conviction-section">
        <Reveal className="section-heading-grid">
          <SectionLabel number="03" light>Conviction process</SectionLabel>
          <h2>Conviction<br />has a process.</h2>
          <p>
            We combine patient study with decisive action. A repeatable journey
            from overlooked signal to durable scale.
          </p>
        </Reveal>
        <div className="process-grid">
          {convictionSteps.map((step, index) => (
            <Reveal key={step.id} className="process-card" delay={index * 80}>
              <div className="process-number">{step.id}</div>
              <i />
              <span className="eyebrow">{step.title}</span>
              <p>{step.text}</p>
            </Reveal>
          ))}
          <div className="signal-memo">
            <span className="mono">SIGNAL MEMO / 04</span>
            <p>What appears small today may become the system everyone depends on.</p>
          </div>
        </div>
      </section>

      <section className="platform-split">
        <div className="platform-manifesto">
          <SectionLabel number="04">Founder platform</SectionLabel>
          <Reveal>
            <h2>Capital is<br />the beginning.</h2>
            <p>
              We build alongside founders through the moments when an
              introduction, a hire, or a market decision changes the slope of
              the company.
            </p>
          </Reveal>
          <Link className="text-link" href="/founder-platform" navigate={navigate}>
            For founders <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="platform-cards">
          <h2>What we bring<br />to the table.</h2>
          {[
            ["01", "Talent", "Build the team before the role becomes obvious."],
            ["02", "Markets", "Turn early conviction into customer pull."],
            ["03", "Momentum", "Design the next financing from strength."],
          ].map((item, index) => (
            <Reveal key={item[0]} className="support-card" delay={index * 80} tabIndex={0}>
              <span>{item[0]}</span>
              <h3>{item[1]}</h3>
              <p>{item[2]}</p>
              <ArrowUpRight aria-hidden="true" size={22} weight="regular" />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section funding-announcements">
        <Reveal className="section-heading-grid">
          <SectionLabel number="05">Portfolio announcements</SectionLabel>
          <h2>Backing essential<br />companies early.</h2>
          <p>Recent announced TipHub allocations across connected markets, intelligence infrastructure, and essential systems.</p>
        </Reveal>
        <div className="funding-announcement-grid">
          {portfolio.slice(0, 3).map((company, index) => (
            <Reveal key={company.id} className="funding-announcement-card" delay={index * 90}>
              <span className="mono">ANNOUNCED ALLOCATION / 2026</span>
              <strong>{company.funding}</strong>
              <h3>{company.name}</h3>
              <p>{company.description}</p>
              <div>
                <a href={company.website} target="_blank" rel="noreferrer">Website ↗</a>
                <a href={company.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
              </div>
            </Reveal>
          ))}
        </div>
        <Link className="text-link" href="/companies" navigate={navigate}>
          View all 25 companies <span aria-hidden="true">↗</span>
        </Link>
      </section>

      <section className="section notes-teaser">
        <Reveal className="section-heading-grid">
          <SectionLabel number="06">Field notes</SectionLabel>
          <h2>Field notes from<br />the edge of obvious.</h2>
          <Link className="text-link" href="/field-notes" navigate={navigate}>
            View all notes <span aria-hidden="true">↗</span>
          </Link>
        </Reveal>
        <div className="editorial-grid">
          <Link href="/field-notes/infrastructure-hiding-inside-ordinary-work" navigate={navigate} className="editorial-card image-card">
            <div className="media-wrap">
              <img src="/assets/essential-systems.png" alt="Operator in an industrial automation facility" />
            </div>
            <span className="mono">SYSTEMS / 08 MIN</span>
            <h3>The quiet rebuild of industrial intelligence.</h3>
            <span className="card-action">Read story ↗</span>
          </Link>
          <article className="editorial-card quote-card" tabIndex={0}>
            <span className="mono">SIGNAL / 20</span>
            <blockquote>“The next great market may begin as a coordination problem nobody wants to own.”</blockquote>
            <span className="card-action">TipHub field memo</span>
          </article>
          <article className="editorial-card index-card" tabIndex={0}>
            <span className="mono">INDEX / 14 MIN</span>
            <h3>Why connected markets compound.</h3>
            <ol>
              <li><span>01</span> Access</li>
              <li><span>02</span> Trust</li>
              <li><span>03</span> Distribution</li>
              <li><span>04</span> Liquidity</li>
            </ol>
          </article>
        </div>
      </section>

      <ConversionBlock
        kicker="For founders"
        title="What are you building before the world is ready?"
        button="Send your pitch"
        onClick={openPitch}
      />
      <Footer navigate={navigate} />
    </>
  );
}

function WhatWeBackPage({ navigate, openPitch }) {
  const {
    content: { fundProfile, thesisThemes },
  } = useTipHubContent();
  const [active, setActive] = useState(1);
  const [openValue, setOpenValue] = useState(null);
  const values = [
    ["01", "Earned insight", "Knowledge built through proximity—not trend recognition."],
    ["02", "Category instinct", "A clear view of what the market will call obvious later."],
    ["03", "Compounding product", "A system that becomes more useful, trusted, or defensible with use."],
    ["04", "Generous ambition", "The will to build a defining company without losing the people it serves."],
  ];
  return (
    <>
      <Header path="/what-we-back" navigate={navigate} openPitch={openPitch} />
      <main>
        <section className="thesis-hero">
          <div className="hero-copy">
            <SectionLabel number="01">Investment thesis</SectionLabel>
            <Reveal>
              <h1>We back the uncommon<br />before it becomes obvious.</h1>
              <p className="accent-serif">Local proof. Global possibility.</p>
              <p>
                TipHub partners at pre-seed and seed with founders building
                essential companies from overlooked insight, connected markets,
                and lived expertise.
              </p>
              <dl className="hero-stats">
                <div><dt>Global mandate</dt><dd>{fundProfile.stages.join(" + ")}</dd></div>
                <div><dt>{fundProfile.provisional ? "Provisional fund" : "Fund"}</dt><dd>{fundProfile.fundSize}</dd></div>
                <div><dt>Scope</dt><dd>{fundProfile.geography}</dd></div>
              </dl>
            </Reveal>
          </div>
          <div className="atlas-window">
            <img src="/assets/what-we-back-atlas.png" alt="TipHub topographic thesis atlas" />
          </div>
        </section>

        <section className="friction-section">
          <div className="friction-visual" aria-hidden="true">
            <img src="/assets/friction-map-strata.png" alt="" />
          </div>
          <div className="friction-intro">
            <SectionLabel number="02">The friction map</SectionLabel>
            <h2>We follow<br />the friction.</h2>
            <p>
              Where systems fail people, new categories begin. We look for
              evidence hiding in everyday workarounds, informal networks, and
              neglected infrastructure.
            </p>
          </div>
          <div className="friction-list">
            {thesisThemes.map((theme, index) => (
              <AccordionRow
                key={theme.id}
                theme={theme}
                dark
                active={active === index}
                onToggle={() =>
                  setActive((current) => (current === index ? null : index))
                }
              />
            ))}
          </div>
        </section>

        <section className="section section-carbon signal-test">
          <Reveal className="section-heading-grid">
            <SectionLabel number="03" light>Our signal test</SectionLabel>
            <h2>The first question<br />is never “how big?”<br /><em>It is “what changed?”</em></h2>
            <p>
              We invest when a local truth reveals a structural shift—before
              the market has named it, priced it, or agreed on the category.
            </p>
          </Reveal>
          <div className="signal-grid">
            {[
              ["01", "Lived proof", "A problem experienced deeply enough to expose the real constraint."],
              ["02", "Structural shift", "A behavior or technology change that makes a new solution possible now."],
              ["03", "Repeatable advantage", "A product loop that compounds learning, trust, or distribution."],
              ["04", "Global path", "A credible route from one market’s truth to many markets’ need."],
            ].map((item, index) => (
              <Reveal key={item[0]} className="signal-card" delay={index * 70}>
                <span>{item[0]}</span><h3>{item[1]}</h3><p>{item[2]}</p>
              </Reveal>
            ))}
          </div>
          <blockquote className="principle-quote">
            “Specificity is not a limit. It is the beginning of scale.”
          </blockquote>
        </section>

        <section className="section section-mist partnership-section">
          <Reveal className="section-heading-grid">
            <SectionLabel number="04">When we partner</SectionLabel>
            <h2>Early enough to shape.<br />Patient enough to build.</h2>
            <p>
              We prefer the moments when company and category are still being
              authored. Our role is conviction, context, and operating help.
            </p>
          </Reveal>
          <div className="stage-cards">
            {[
              ["01 / PRE-SEED", "Before the deck is polished.", "A sharp insight, early evidence, and a founder–market truth."],
              ["02 / SEED", "When the system starts to repeat.", "A product taking shape, a system beginning to repeat, and a category waiting to be defined."],
              ["03 / SELECTIVE A", "While the category is still open.", "Momentum is visible, but the company still benefits from close partnership."],
            ].map((item, index) => (
              <Reveal key={item[0]} className={`stage-card ${index === 1 ? "featured" : ""}`} delay={index * 80}>
                <span className="mono">{item[0]}</span>
                <h3>{item[1]}</h3><p>{item[2]}</p><b>→</b>
              </Reveal>
            ))}
          </div>
          <dl className="mandate-strip">
            <div><dt>First cheque</dt><dd>{fundProfile.firstCheque}</dd></div>
            <div><dt>Partnership</dt><dd>{fundProfile.partnership}</dd></div>
            <div><dt>Follow-on</dt><dd>{fundProfile.followOn}</dd></div>
            <div><dt>Geography</dt><dd>{fundProfile.geography}</dd></div>
          </dl>
        </section>

        <section className="section values-section">
          <Reveal className="section-heading-grid">
            <SectionLabel number="05">What we look for</SectionLabel>
            <h2>Four things we<br />cannot manufacture.</h2>
            <p>Capital can accelerate a company. It cannot substitute for these foundations.</p>
          </Reveal>
          <div className="values-list">
            {values.map((value, index) => (
              <article key={value[0]} className={`value-row ${openValue === index ? "is-open" : ""}`}>
                <button type="button" onClick={() => setOpenValue(openValue === index ? null : index)} aria-expanded={openValue === index}>
                  <span>{value[0]}</span><h3>{value[1]}</h3><p>{value[2]}</p><b>{openValue === index ? "−" : "+"}</b>
                </button>
                <div className="value-detail">
                  <p>We seek evidence in choices already made, work already done, and a precise understanding of whom the company exists to serve.</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <ConversionBlock
        kicker="Start a conversation"
        title="Building from a truth the market has missed?"
        button="Pitch TipHub"
        onClick={openPitch}
        tone="teal"
      />
      <Footer navigate={navigate} tone="teal" />
    </>
  );
}

function CompaniesPage({ navigate, openPitch }) {
  const {
    content: { portfolio, thesisThemes, fundProfile },
  } = useTipHubContent();
  const [theme, setTheme] = useState("All themes");
  const [stage, setStage] = useState("All stages");
  const [query, setQuery] = useState("");
  const filtered = portfolio.filter(
    (company) =>
      (theme === "All themes" || company.theme === theme) &&
      (stage === "All stages" || company.stage === stage) &&
      company.name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <Header path="/companies" navigate={navigate} openPitch={openPitch} />
      <main>
        <section className="companies-hero">
          <div className="companies-hero-copy">
            <SectionLabel number="01" light>Companies</SectionLabel>
            <h1>Companies built from<br />truth, not consensus.</h1>
            <p>
              We partner with founders building the operating systems behind
              energy, industry, AI governance, healthcare, and connected
              markets.
            </p>
          </div>
          <div className="featured-companies">
            {portfolio.slice(0, 3).map((company, index) => (
              <a
                key={company.id}
                className={index === 1 ? "is-featured" : ""}
                href={company.website}
                target="_blank"
                rel="noreferrer"
              >
                <span className="mono">{String(index + 1).padStart(2, "0")}</span>
                <strong>{company.name}</strong>
                <h3>{company.theme}</h3>
                <span className="mono">{company.stage || "EARLY STAGE"} · {company.funding}</span>
                <b>↗</b>
              </a>
            ))}
          </div>
        </section>

        <section className="section companies-index">
          <SectionLabel number="02">Portfolio index</SectionLabel>
          <div className="index-title-row">
            <h2>An index of opportunity.</h2>
            <span>{filtered.length} portfolio companies</span>
          </div>
          <div className="filters">
            <label>
              <span className="mono">THEME</span>
              <select value={theme} onChange={(event) => setTheme(event.target.value)}>
                <option>All themes</option>
                {thesisThemes.map((item) => <option key={item.id}>{item.short}</option>)}
              </select>
            </label>
            <label>
              <span className="mono">STAGE</span>
              <select value={stage} onChange={(event) => setStage(event.target.value)}>
                <option>All stages</option><option>Pre-seed</option><option>Seed</option><option>Selective A</option>
              </select>
            </label>
            <label>
              <span className="mono">REGION</span>
              <select><option>Global</option></select>
            </label>
            <label>
              <span className="mono">SEARCH</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Company name" />
            </label>
          </div>
          <div className="company-table" role="table" aria-label="Portfolio companies">
            <div className="company-table-head" role="row">
              <span>Company</span><span>Thesis</span><span>Stage</span><span>Allocation</span><span>Region</span><span>Links</span>
            </div>
            {filtered.map((company, index) => (
              <Reveal key={company.id} delay={Math.min(index * 50, 300)}>
                <article className="company-row" role="row">
                  <span className="company-name"><b>{String(index + 1).padStart(2, "0")}</b><span><strong>{company.name}</strong><small>{company.description}</small></span></span>
                  <span>{company.theme}</span><span>{company.stage}</span><span className="company-funding">{company.funding}</span><span>{company.region}</span>
                  <span className="company-links">
                    <a href={company.website} target="_blank" rel="noreferrer" aria-label={`Visit ${company.name} website`}>↗</a>
                    <a href={company.linkedin} target="_blank" rel="noreferrer" aria-label={`Visit ${company.name} on LinkedIn`}>in</a>
                  </span>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="section section-orange portfolio-method">
          <SectionLabel number="03">How to read the index</SectionLabel>
          <Reveal className="section-heading-grid">
            <h2>A portfolio should reveal<br />a point of view.</h2>
            <p>
              These companies share a practical instinct: turn overlooked
              constraints into systems that make essential work more capable.
            </p>
          </Reveal>
          <div className="method-grid">
            {[
              ["01", "Filter", "Move from broad landscape to relevant evidence."],
              ["02", "Discover", "See the thesis connecting different operating arenas."],
              ["03", "Visit", "Open each company’s website directly from the index."],
            ].map((item) => (
              <article key={item[0]}><span>{item[0]}</span><b>{item[1]}</b><p>{item[2]}</p></article>
            ))}
          </div>
        </section>
      </main>
      <ConversionBlock kicker="Explore the terrain" title="Looking for the thesis behind the index?" button="What we back" onClick={() => navigate("/what-we-back")} tone="teal" />
      <Footer navigate={navigate} tone="teal" />
    </>
  );
}

function FounderPlatformPage({ navigate, openPitch }) {
  const {
    content: { founderModules },
  } = useTipHubContent();
  const [layer, setLayer] = useState(1);
  const layers = founderModules.map((item, index) => [
    item.id || String(index + 1).padStart(2, "0"),
    item.title,
    item.description,
    item.tags,
  ]);
  return (
    <>
      <Header path="/founder-platform" navigate={navigate} openPitch={openPitch} />
      <main>
        <section className="founder-hero">
          <img src="/assets/founder-operating-atlas.jpg" alt="TipHub founder operating atlas" />
          <div className="founder-hero-copy">
            <SectionLabel number="01">Founder platform</SectionLabel>
            <h1>Company building is a terrain.<br />We help founders read it.</h1>
            <p className="accent-serif">Clarity before velocity.</p>
            <p>
              TipHub works beside founders from first conviction through the
              next critical inflection—connecting capital, operating judgment,
              and trusted networks.
            </p>
            <span className="mono">FOUNDER PLATFORM<br />Capital · Craft · Connections</span>
          </div>
        </section>

        <section className="section section-carbon working-layers">
          <SectionLabel number="02" light>Three working layers</SectionLabel>
          <Reveal className="section-heading-grid">
            <h2>One platform.<br />Three forms of leverage.</h2>
            <p>The work changes as the company changes. Our support is modular, founder-led, and built around the constraint in front of you.</p>
          </Reveal>
          <div className="layer-list">
            {layers.map((item, index) => (
              <article key={item[0]} className={layer === index ? "is-active" : ""}>
                <button type="button" onClick={() => setLayer(index)} aria-expanded={layer === index}>
                  <span>{item[0]}</span><h3>{item[1]}</h3><p>{item[2]}</p><small>{item[3]}</small>
                  <b aria-hidden="true">{layer === index ? <Minus size={21} /> : <Plus size={21} />}</b>
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="section section-mist operating-arc">
          <SectionLabel number="03">The operating arc</SectionLabel>
          <Reveal className="section-heading-grid">
            <h2>From first call to<br />next inflection.</h2>
            <p>Four moments where a small amount of precise help can change the shape of the company.</p>
          </Reveal>
          <div className="arc-line">
            {[
              ["01", "Orient", "Name the real constraint."],
              ["02", "Design", "Choose the operating path."],
              ["03", "Move", "Bring the right people in."],
              ["04", "Compound", "Turn progress into a system."],
            ].map((item, index) => (
              <Reveal key={item[0]} className={index === 1 ? "active" : ""} delay={index * 80}>
                <i /><strong>{item[0]}</strong><span className="mono">{item[1]}</span><p>{item[2]}</p>
              </Reveal>
            ))}
          </div>
          <blockquote className="light-quote">“The right help should reduce noise—and increase founder agency.”</blockquote>
        </section>

        <section className="section founder-desk">
          <SectionLabel number="04">Founder desk</SectionLabel>
          <Reveal className="section-heading-grid">
            <h2>A working desk,<br />not a content library.</h2>
            <p>Practical tools, operator access, and focused working sessions—organized around the company you are building now.</p>
          </Reveal>
          <div className="resource-grid">
            {[
              ["Round room", "Narrative, investor mapping, data-room readiness, and fundraising choreography."],
              ["Product table", "Category framing, user evidence, product loops, and decision reviews."],
              ["Talent bench", "Critical role design, trusted introductions, and leadership calibration."],
              ["Market passage", "Customer discovery, expansion hypotheses, and local-to-global market entry."],
            ].map((item, index) => (
              <article key={item[0]} tabIndex={0}>
                <span className="mono">0{index + 1} / WORKING MODULE</span>
                <h3>{item[0]}</h3><p>{item[1]}</p><b aria-hidden="true"><ArrowRight size={25} /></b>
              </article>
            ))}
          </div>
        </section>

        <section className="section section-orange network-section">
          <SectionLabel number="05">The founder network</SectionLabel>
          <Reveal className="section-heading-grid">
            <h2>The useful network is<br />the one that answers.</h2>
            <p>Operators, specialists, customers, and fellow founders—introduced with context, not broadcast as a directory.</p>
          </Reveal>
          <div className="network-grid">
            {["Operators", "Specialists", "Customers", "Founders"].map((item, index) => (
              <div key={item}><span className="mono">{item}</span><strong>0{index + 1}</strong></div>
            ))}
          </div>
        </section>
      </main>
      <ConversionBlock kicker="Build with us" title="Need a partner for the terrain ahead?" button="Pitch TipHub" onClick={openPitch} tone="teal" />
      <Footer navigate={navigate} tone="teal" />
    </>
  );
}

function FieldNotesPage({ navigate, openPitch }) {
  const {
    content: { notes },
  } = useTipHubContent();
  const [category, setCategory] = useState("Field reports");
  const [subscribed, setSubscribed] = useState(false);
  return (
    <>
      <Header path="/field-notes" navigate={navigate} openPitch={openPitch} />
      <main>
        <section className="notes-hero">
          <div className="notes-hero-copy">
            <SectionLabel number="01">Field notes</SectionLabel>
            <h1>Signals from the<br />productive edge.</h1>
            <p className="accent-serif">Read what the map misses.</p>
            <p>Original fieldwork, founder conversations, and research on the systems reshaping everyday life across connected markets.</p>
            <span className="mono">FEATURED NOTE / SYSTEMS</span>
            <Link href="/field-notes/infrastructure-hiding-inside-ordinary-work" navigate={navigate} className="featured-note-link">
              The infrastructure hiding inside ordinary work <span>↗</span>
            </Link>
          </div>
          <div className="notes-hero-media">
            <img src="/assets/field-notes-atlas.png" alt="Editorial atlas of connected infrastructure" />
          </div>
        </section>

        <section className="section section-mist editions-section">
          <SectionLabel number="02">Latest editions</SectionLabel>
          <Reveal className="section-heading-grid">
            <h2>Field notes for people<br />building before consensus.</h2>
            <p>Reporting from the places where new categories become visible first.</p>
          </Reveal>
          <div className="edition-layout">
            <Link href="/field-notes/infrastructure-hiding-inside-ordinary-work" navigate={navigate} className="edition-feature">
              <span className="mono">FIELD REPORT / 06 MIN</span><b>01</b>
              <h3>When logistics<br />becomes software.</h3>
              <p>A field note on the operators turning fragmented movement into an intelligent network.</p>
              <small>CONNECTED MARKETS / JUL 2026</small>
            </Link>
            <div>
              <article className="edition-card dark"><span className="mono">FOUNDER CONVERSATION</span><h3>Building trust<br />across borders</h3></article>
              <article className="edition-card light"><span className="mono">RESEARCH NOTE</span><b>03</b><h3>Small operators,<br />large leverage</h3></article>
            </div>
          </div>
        </section>

        <section className="section research-index">
          <SectionLabel number="03">The research index</SectionLabel>
          <h2>Browse the terrain.</h2>
          <div className="category-tabs" role="tablist" aria-label="Field note categories">
            {["Field reports", "Founder stories", "Research", "Dispatches"].map((item) => (
              <button key={item} role="tab" aria-selected={category === item} className={category === item ? "is-active" : ""} onClick={() => setCategory(item)} type="button">{item}</button>
            ))}
          </div>
          <div className="notes-list">
            {notes.map((note, index) => (
              <Reveal key={note.id} delay={index * 70}>
                <Link href={`/field-notes/${note.slug || "infrastructure-hiding-inside-ordinary-work"}`} navigate={navigate} className={`note-row ${index === 1 ? "is-featured" : ""}`}>
                  <b>{note.id}</b><span className="mono">{note.theme}</span><h3>{note.title}</h3><time>{note.date}</time><i>↗</i>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="section section-teal dispatch-section">
          <SectionLabel number="04" light>From the field</SectionLabel>
          <Reveal className="section-heading-grid">
            <h2>A dispatch is not a prediction.<br />It is evidence, close up.</h2>
            <blockquote>“The strongest companies often begin as a practical answer to a problem that looks too local to matter.”</blockquote>
          </Reveal>
          <div className="dispatch-rail">
            {["Observe", "Trace", "Test", "Connect", "Write"].map((item, index) => (
              <div key={item} className={index === 2 ? "is-active" : ""}><i /><span>{item}</span></div>
            ))}
          </div>
        </section>

        <section className="newsletter">
          <h2>{subscribed ? "You’re on the field list." : "New signals, sent occasionally."}</h2>
          <p>Field notes and research—no weekly noise.</p>
          {!subscribed && (
            <form onSubmit={(event) => { event.preventDefault(); setSubscribed(true); }}>
              <label className="sr-only" htmlFor="newsletter-email">Email address</label>
              <input id="newsletter-email" type="email" required placeholder="Email address" />
              <button type="submit">Subscribe</button>
            </form>
          )}
        </section>
      </main>
      <Footer navigate={navigate} />
    </>
  );
}

function ArticlePage({ navigate, openPitch, slug }) {
  const {
    content: { notes },
  } = useTipHubContent();
  const note = notes.find((item) => item.slug === slug);
  const articleBlocks = note?.body?.filter(
    (block) => block?._type === "block" && Array.isArray(block.children),
  );

  return (
    <>
      <Header path="/field-notes" navigate={navigate} openPitch={openPitch} />
      <main>
        <article className="article-page">
          <header className="article-header">
            <SectionLabel number={`FIELD NOTE ${note?.id || "01"}`}>{note?.theme || "Systems"}</SectionLabel>
            <h1>{note?.title || "The infrastructure hiding inside ordinary work."}</h1>
            <p className="article-deck">{note?.excerpt || "Why the next enduring systems may be built from the routines, workarounds, and invisible coordination already holding daily life together."}</p>
            <div className="article-meta">
              <span>{note?.readingTime || 8} min read</span>
              <span>{note?.date || "25 Jul 2026"}</span>
              <span>{note?.author || "TipHub field team"}</span>
            </div>
          </header>
          <figure className="article-hero-image">
            <img src={note?.image || "/assets/field-notes-atlas.png"} alt="A terrain model revealing infrastructure across connected regions" />
            <figcaption>A field atlas of systems hiding in plain sight.</figcaption>
          </figure>
          <div className="article-body">
            <aside>
              <span className="mono">FIELD NOTE / 01</span>
              <p>Essential systems<br />Connected markets</p>
            </aside>
            <div className="article-copy">
              {articleBlocks?.length ? (
                articleBlocks.map((block, index) => {
                  const text = block.children.map((child) => child.text).join("");
                  if (block.style === "h2") return <h2 key={block._key || index}>{text}</h2>;
                  if (block.style === "blockquote") return <blockquote key={block._key || index}>{text}</blockquote>;
                  return <p key={block._key || index} className={index === 0 ? "drop-cap" : ""}>{text}</p>;
                })
              ) : (
                <>
                  <p className="drop-cap">The most consequential infrastructure rarely announces itself as infrastructure. It begins as a workaround: a spreadsheet passed between operators, a trusted person who knows whom to call, a route improvised because the official path does not work.</p>
                  <h2>Look for coordination before software.</h2>
                  <p>When a market is fragmented, the first product is often clarity. It gives people a shared view of what is happening, what needs attention, and what should happen next. The strongest founders learn the existing system before they attempt to replace it.</p>
                  <blockquote>“A practical answer to a local problem can become the operating layer for an entire market.”</blockquote>
                  <h2>Build with the grain of reality.</h2>
                  <p>Technology compounds when it respects the people and routines already carrying the system. Better tools do not erase expertise; they make it portable. Better networks do not flatten context; they help trust travel.</p>
                  <p>The investment question is therefore not whether the market appears large from a distance. It is whether a founder has uncovered a repeated, costly constraint and can turn earned insight into a product that improves each time it is used.</p>
                  <hr />
                  <p className="article-end">TipHub field notes study the practical systems, constraints, and market shifts shaping the next generation of essential companies.</p>
                </>
              )}
            </div>
          </div>
        </article>
      </main>
      <ConversionBlock kicker="Continue reading" title="Explore more signals from the productive edge." button="All field notes" onClick={() => navigate("/field-notes")} tone="teal" />
      <Footer navigate={navigate} tone="teal" />
    </>
  );
}

function AboutPage({ navigate, openPitch, openProfile }) {
  const {
    content: { convictionSteps, fundProfile, siteSettings, team, thesisThemes },
  } = useTipHubContent();
  const [active, setActive] = useState(1);
  return (
    <>
      <Header path="/about" navigate={navigate} openPitch={openPitch} />
      <main>
        <section className="about-hero">
          <div className="about-hero-copy">
            <SectionLabel number="01">About TipHub</SectionLabel>
            <h1>Find what<br />others miss.</h1>
            <p className="accent-serif">Back what the world will need.</p>
            <p>TipHub partners early with founders whose insight begins close to the problem and scales far beyond it.</p>
            <div className="about-actions">
              <ArrowButton onClick={openPitch} tone="carbon">Pitch TipHub</ArrowButton>
              <Link href="/what-we-back" navigate={navigate} className="text-link">Open the index ↗</Link>
            </div>
          </div>
          <div className="about-portrait">
            <img src="/assets/team-maya.png" alt="" />
            <span>01</span>
            <p>Uncommon insight<br />creates uncommon<br />impact.</p>
          </div>
        </section>

        <section className="section section-mist about-index">
          <SectionLabel number="02">An index of opportunity</SectionLabel>
          <Reveal className="section-heading-grid">
            <h2>An index of<br />opportunity.</h2>
            <p>We look where others scroll past. Our index maps four living arenas where overlooked problems become foundational companies.</p>
          </Reveal>
          <div className="about-index-list">
            {thesisThemes.map((item, index) => (
              <button key={item.id} type="button" onClick={() => setActive(index)} className={active === index ? "is-active" : ""}>
                <span>{item.id}</span><h3>{item.title}</h3><p>{item.description}</p><small>{item.tags}</small><b>{active === index ? "ACTIVE" : "INDEX"}</b>
              </button>
            ))}
          </div>
        </section>

        <section className="section section-carbon about-process">
          <SectionLabel number="03" light>Conviction has a process</SectionLabel>
          <Reveal className="section-heading-grid">
            <h2>Conviction<br />has a process.</h2>
            <p>Patient study becomes decisive action through a repeatable operating rhythm.</p>
          </Reveal>
          <div className="process-grid about-process-grid">
            {convictionSteps.map((step, index) => (
              <Reveal key={step.id} className="process-card" delay={index * 80}>
                <div className="process-number">{step.id}</div><i /><span className="eyebrow">{step.title}</span><p>{step.text}</p>
              </Reveal>
            ))}
          </div>
          <blockquote className="principle-quote">Close enough to see clearly. Global enough to compound.</blockquote>
        </section>

        <section className="section mandate-section">
          <SectionLabel number="04">Global mandate</SectionLabel>
          <Reveal className="section-heading-grid">
            <h2>One fund.<br />A wide field of view.</h2>
            <p>We invest at pre-seed and seed in founders building essential companies from overlooked insight, connected markets, and lived expertise.</p>
          </Reveal>
          <dl className="mandate-strip">
            <div><dt>{fundProfile.provisional ? "Provisional fund" : "Fund"}</dt><dd>{fundProfile.fundSize}</dd></div>
            <div><dt>Stage</dt><dd>{fundProfile.stages.join(" + ")}</dd></div>
            <div><dt>Scope</dt><dd>{fundProfile.geography}</dd></div>
            <div><dt>Office</dt><dd>{siteSettings.legalAddress || "Global · By appointment"}</dd></div>
          </dl>
          {fundProfile.provisional && (
            <p className="prototype-warning">Fund size and team details are provisional for prototype review and must be confirmed before launch.</p>
          )}
        </section>

        {team.length > 0 && (
          <section className="section team-section">
            <SectionLabel number="05">The people behind the work</SectionLabel>
            <Reveal className="section-heading-grid">
              <h2>Built by people<br />who work beside founders.</h2>
              <p>Meet the investors and operators supporting TipHub’s portfolio.</p>
            </Reveal>
            <div className="team-grid">
              {team.map((person, index) => (
                <button key={person.name} type="button" className="team-card" onClick={() => openProfile(index)}>
                  <div className="team-media"><img src={person.image} alt="" /><div className="team-hover-panel"><span>Open profile</span><b>↗</b></div></div>
                  <span className="mono">{person.location || "TIPHUB"}</span><h3>{person.name}</h3><p>{person.role}</p><i>View profile</i>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>
      <ConversionBlock kicker="Build from the edge" title="Show us what others are missing." button="Pitch TipHub" onClick={openPitch} />
      <Footer navigate={navigate} />
    </>
  );
}

function ConversionBlock({ kicker, title, button, onClick, tone = "carbon" }) {
  return (
    <section className={`conversion is-${tone}`}>
      <span className="mono">{kicker}</span>
      <h2>{title}</h2>
      <ArrowButton onClick={onClick} tone={tone === "teal" ? "orange" : "carbon"}>{button}</ArrowButton>
    </section>
  );
}

function Footer({ navigate, tone = "carbon" }) {
  const {
    content: { fundProfile, siteSettings },
  } = useTipHubContent();

  return (
    <footer className={`site-footer is-${tone}`}>
      <div className="footer-brand">
        <img src="/brand/tiphub-logo-primary.svg" alt="TipHub" />
        <p>{siteSettings.tagline}</p>
      </div>
      <nav aria-label="Footer navigation">
        {routes.map((route) => <Link key={route.href} href={route.href} navigate={navigate}>{route.label}</Link>)}
      </nav>
      <div className="footer-social">
        <a href={siteSettings.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn ↗</a>
        <a href={`mailto:${siteSettings.generalEmail}`}>Email ↗</a>
        <span>{siteSettings.legalAddress || "Global · By appointment"}</span>
      </div>
      <div className="footer-legal">
        <span>
          © {siteSettings.copyrightYear} {siteSettings.legalName}
          {siteSettings.provisional ? " · Provisional prototype" : ""}
        </span>
        <span>
          {fundProfile.geography} · {fundProfile.stages.join(" + ")} · {fundProfile.fundSize}
          {fundProfile.provisional ? " provisional fund" : " fund"}
        </span>
      </div>
    </footer>
  );
}

function PitchModal({ open, onClose }) {
  const {
    content: { siteSettings },
  } = useTipHubContent();
  const [sent, setSent] = useState(false);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    document.body.classList.add("modal-open");
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("modal-open");
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="pitch-modal" role="dialog" aria-modal="true" aria-labelledby="pitch-title">
        <button ref={closeRef} className="modal-close" type="button" onClick={onClose} aria-label="Close pitch form">×</button>
        <SectionLabel number="START HERE">Founder introduction</SectionLabel>
        {sent ? (
          <div className="form-success">
            <h2>Thank you.<br />We’ll read this closely.</h2>
            <p>Your email app should now be open with your introduction ready to send to TipHub.</p>
            <ArrowButton onClick={onClose} tone="carbon">Return to TipHub</ArrowButton>
          </div>
        ) : (
          <>
            <h2 id="pitch-title">What are you building<br />before the world is ready?</h2>
            <p>Give us the clearest version of the problem, the insight you earned, and what changed.</p>
            <form onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const subject = `Founder introduction — ${data.get("company")}`;
              const body = [
                `Name: ${data.get("name")}`,
                `Email: ${data.get("email")}`,
                `Company: ${data.get("company")}`,
                `Company link: ${data.get("link") || "Not provided"}`,
                "",
                "What we have learned:",
                data.get("insight"),
              ].join("\n");
              window.location.href = `mailto:${siteSettings.pitchEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
              setSent(true);
            }}>
              <label>Name<input name="name" required /></label>
              <label>Email<input name="email" type="email" required /></label>
              <label>Company<input name="company" required /></label>
              <label>Company link<input name="link" type="url" placeholder="https://" /></label>
              <label className="full">What have you learned that others are missing?<textarea name="insight" rows="4" required /></label>
              <button type="submit">Send introduction <span>↗</span></button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}

function ProfileModal({ person, onClose }) {
  const closeRef = useRef(null);
  useEffect(() => {
    const onKeyDown = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    document.body.classList.add("modal-open");
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("modal-open");
    };
  }, [onClose]);
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-title">
        <button ref={closeRef} className="modal-close" type="button" onClick={onClose} aria-label="Close team profile">×</button>
        <img src={person.image} alt="" />
        <div>
          <span className="mono">{person.location || "TIPHUB TEAM"}</span>
          <h2 id="profile-title">{person.name}</h2>
          <p className="profile-role">{person.role}</p>
          <p>{person.bio}</p>
          <dl><dt>Focus</dt><dd>{person.focus}</dd><dt>Role</dt><dd>{person.role}</dd></dl>
        </div>
      </section>
    </div>
  );
}

function TipHubApp() {
  const {
    content: { team },
  } = useTipHubContent();
  const { path, navigate } = useRoute();
  const [pitchOpen, setPitchOpen] = useState(false);
  const [profileIndex, setProfileIndex] = useState(null);

  useEffect(() => {
    const titles = {
      "/": "TipHub — Global early-stage venture capital",
      "/what-we-back": "What we back — TipHub",
      "/companies": "Companies — TipHub",
      "/founder-platform": "Founder platform — TipHub",
      "/field-notes": "Field notes — TipHub",
      "/field-notes/infrastructure-hiding-inside-ordinary-work": "The infrastructure hiding inside ordinary work — TipHub",
      "/about": "About — TipHub",
    };
    document.title = titles[path] || titles["/"];
  }, [path]);

  const pageProps = { navigate, openPitch: () => setPitchOpen(true) };
  let page;
  if (path === "/what-we-back") page = <WhatWeBackPage {...pageProps} />;
  else if (path === "/companies") page = <CompaniesPage {...pageProps} />;
  else if (path === "/founder-platform") page = <FounderPlatformPage {...pageProps} />;
  else if (path === "/field-notes") page = <FieldNotesPage {...pageProps} />;
  else if (path.startsWith("/field-notes/")) {
    page = <ArticlePage {...pageProps} slug={path.split("/").filter(Boolean).at(-1)} />;
  }
  else if (path === "/about") page = <AboutPage {...pageProps} openProfile={setProfileIndex} />;
  else page = <HomePage {...pageProps} />;

  return (
    <>
      <div className="route-shell" key={path}>{page}</div>
      <PitchModal open={pitchOpen} onClose={() => setPitchOpen(false)} />
      {profileIndex !== null && <ProfileModal person={team[profileIndex]} onClose={() => setProfileIndex(null)} />}
    </>
  );
}

export function App() {
  return (
    <TipHubContentProvider>
      <TipHubApp />
    </TipHubContentProvider>
  );
}
