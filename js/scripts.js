window.addEventListener("DOMContentLoaded", () => {
    const data = window.siteData;
    if (!data) {
        return;
    }

    const page = document.body.dataset.page || "about";
    renderChrome(data, page);
    renderPage(page, data);
    setupForms();
});

function renderChrome(data, page) {
    const header = document.getElementById("site-header");
    const footer = document.getElementById("site-footer");
    const activePage = page === "portfolio-detail" || page === "ups-thesis"
        ? "portfolio"
        : page === "blog-detail"
            ? "blog"
            : page;
    const navLinks = data.nav
        .map(
            item => `
                <a class="nav-link ${activePage === item.key ? "is-active" : ""}" href="${item.href}">
                    ${item.label}
                </a>
            `
        )
        .join("");

    header.innerHTML = `
        <div class="site-header">
            <nav class="site-nav" aria-label="Primary">
                <div class="brand">
                    <a class="brand-home" href="/" aria-label="${data.site.name} home">
                        <img class="brand-mark" src="${data.site.logo}" alt="" />
                        <span class="brand-name">${data.site.name}</span>
                    </a>
                    <button class="brand-tag-toggle" type="button" aria-expanded="false" aria-label="Show tagline label">
                        <span class="brand-tag">${data.site.tagline}</span>
                        <span class="brand-tag-indicator">Tagline</span>
                    </button>
                </div>
                <div class="nav-links">${navLinks}</div>
                <button class="nav-toggle" type="button" aria-label="Open navigation" aria-expanded="false">
                    <span class="nav-toggle-line"></span>
                    <span class="nav-toggle-line"></span>
                    <span class="nav-toggle-line"></span>
                </button>
            </nav>
            <div class="mobile-sheet" aria-label="Mobile navigation">
                ${navLinks}
            </div>
        </div>
    `;

    footer.innerHTML = `
        <footer class="footer">
            <div class="footer-inner">
                <p class="footer-copy">Built as a static portfolio with responsive navigation, PDF export, and updated branding assets.</p>
                <div class="social-row">
                    <a class="ghost-button" href="${data.site.linkedin}" target="_blank" rel="noreferrer">LinkedIn</a>
                    <a class="ghost-button" href="${data.site.github}" target="_blank" rel="noreferrer">GitHub</a>
                    <a class="ghost-button" href="mailto:${data.site.email}">${data.site.email}</a>
                </div>
            </div>
        </footer>
    `;

    const toggle = header.querySelector(".nav-toggle");
    const taglineToggle = header.querySelector(".brand-tag-toggle");
    const mobileLinks = header.querySelectorAll(".mobile-sheet .nav-link");
    toggle.addEventListener("click", () => {
        const open = document.body.classList.toggle("nav-open");
        toggle.setAttribute("aria-expanded", String(open));
    });
    if (taglineToggle) {
        taglineToggle.addEventListener("click", () => {
            const expanded = taglineToggle.getAttribute("aria-expanded") === "true";
            taglineToggle.setAttribute("aria-expanded", String(!expanded));
            taglineToggle.classList.toggle("is-open", !expanded);
        });
    }
    mobileLinks.forEach(link => {
        link.addEventListener("click", () => {
            document.body.classList.remove("nav-open");
            toggle.setAttribute("aria-expanded", "false");
        });
    });
}

function renderPage(page, data) {
    const root = document.getElementById("page-root");
    if (!root) {
        return;
    }

    if (page === "about") {
        root.innerHTML = renderAboutPage(data);
        return;
    }

    if (page === "portfolio") {
        root.innerHTML = renderPortfolioPage(data);
        setupPortfolioTabs(data.portfolio.sections);
        return;
    }

    if (page === "portfolio-detail" || page === "ups-thesis") {
        root.innerHTML = renderPortfolioDetailPage(data);
        return;
    }

    if (page === "blog") {
        root.innerHTML = renderBlogPage(data);
        injectStatusMessage("subscribed", "Subscription received. Please confirm the email if the form service asks.");
        return;
    }

    if (page === "blog-detail") {
        root.innerHTML = renderBlogDetailPage(data);
        return;
    }

    if (page === "resume") {
        root.innerHTML = renderResumePage(data);
        setupResumeDownload();
        openHashDisclosure();
        return;
    }

    if (page === "contact") {
        root.innerHTML = renderContactPage(data);
        injectStatusMessage("submitted", "Message received. You should be redirected back here after the form submission completes.");
    }
}

function renderAboutPage(data) {
    const metricCards = (data.about.metrics || [])
        .map(
            item => `
                <${item.href ? "a" : "article"} class="metric${item.href ? " metric-link" : ""}"${item.href ? ` href="${item.href}"` : ""}>
                    ${item.tag ? `<span class="feature-kicker">${item.tag}</span>` : ""}
                    <p class="metric-value">${item.value}</p>
                    <p class="metric-label">${item.label}</p>
                </${item.href ? "a" : "article"}>
            `
        )
        .join("");

    const recentExperienceCards = data.resume.experience
        .slice(0, 3)
        .map(
            item => `
                <a class="timeline-link-card" href="/resume/#${buildExperienceAnchorId(item.company)}">
                    <div class="timeline-top">
                        <div>
                            <p class="item-title">${item.role}</p>
                            <p class="item-subtitle logo-line">
                                <img class="inline-logo" src="${item.logo}" alt="${item.company} logo" />
                                ${item.company}
                            </p>
                        </div>
                        <span class="item-date">${item.dates}</span>
                    </div>
                    <p class="timeline-copy">${item.description}</p>
                </a>
            `
        )
        .join("");

    const academicFocusCards = data.resume.education
        .map(
            item => `
                <a class="timeline-link-card" href="/resume/#${buildEducationAnchorId(item.school)}">
                    <div class="timeline-top">
                        <div>
                            <p class="item-title logo-line">
                                ${item.logo ? `<img class="inline-logo" src="${item.logo}" alt="${item.school} logo" />` : ""}
                                ${item.school}
                            </p>
                            <p class="item-subtitle">${item.degree}</p>
                        </div>
                        <span class="item-date">${item.dates}</span>
                    </div>
                    <p class="timeline-copy">${item.summary}</p>
                </a>
            `
        )
        .join("");

    return `
        <div class="page">
            <section class="hero">
                <div class="hero-media">
                    <img class="hero-image" src="${data.site.profileImage}" alt="Portrait of ${data.site.name}" />
                </div>
                <div>
                    <span class="eyebrow">About</span>
                    <h1 class="hero-title">${data.site.name}</h1>
                    <p class="hero-copy">${data.about.bio}</p>
                    <div class="hero-actions">
                        <a class="ghost-button" href="/portfolio/">View Portfolio</a>
                        <a class="ghost-button" href="/resume/">Open Resume</a>
                    </div>
                    <div class="social-row">
                        <a class="ghost-button" href="${data.site.linkedin}" target="_blank" rel="noreferrer">LinkedIn</a>
                        <a class="ghost-button" href="${data.site.github}" target="_blank" rel="noreferrer">GitHub</a>
                        <a class="ghost-button" href="mailto:${data.site.email}">${data.site.email}</a>
                    </div>
                </div>
            </section>

            <section class="section">
                <div class="section-head">
                    <div>
                        <span class="eyebrow">Highlights</span>
                        <h2 class="section-title">Highlights and current work.</h2>
                    </div>
                </div>
                <div class="card-grid">
                    ${metricCards}
                </div>
            </section>

            <section class="section">
                <div class="split-grid">
                    <article class="list-card">
                        <h3>Recent experience</h3>
                        <div class="timeline-stack">${recentExperienceCards}</div>
                    </article>

                    <article class="list-card">
                        <h3>Academic focus</h3>
                        <div class="timeline-stack">${academicFocusCards}</div>
                    </article>
                </div>
            </section>
        </div>
    `;
}

function renderPortfolioPage(data) {
    const tabs = data.portfolio.sections
        .map(
            (section, index) => `
                <button
                    class="tab-button ${index === 0 ? "is-active" : ""}"
                    type="button"
                    data-portfolio-tab="${section.key}"
                >
                    ${section.label}
                </button>
            `
        )
        .join("");

    return `
        <div class="page">
            <section class="section">
                <div class="section-head">
                    <div>
                        <span class="eyebrow">Portfolio</span>
                        <h1 class="page-title">Selected work.</h1>
                        <p class="page-intro">The portfolio is grouped into concise tracks so the main navigation stays simple while the underlying work remains intact.</p>
                    </div>
                </div>
                <div class="tab-bar" role="tablist" aria-label="Portfolio sections">
                    ${tabs}
                </div>
                <div id="portfolio-panel"></div>
            </section>
        </div>
    `;
}

function renderBlogPage(data) {
    const postsMarkup = data.blog.posts.length
        ? data.blog.posts
              .map(
                  post => `
                    <article class="post-item">
                        <div class="post-top">
                            <div>
                                <p class="item-title">${post.title}</p>
                                <p class="item-meta">${post.date}</p>
                                <p class="item-meta">By <a class="meta-link" href="/">Dana Briner</a></p>
                            </div>
                            <span class="tag">${post.category}</span>
                        </div>
                        <p class="card-copy">${post.excerpt}</p>
                        ${post.href ? `<a class="portfolio-link" href="${post.href}">Read more</a>` : ""}
                    </article>
                  `
              )
              .join("")
        : `<p class="card-copy">Posts will appear here as they are published.</p>`;

    return `
        <div class="page">
            <section class="section">
                <div class="section-head">
                    <div>
                        <span class="eyebrow">Blog</span>
                        <h1 class="page-title">Notes and essays.</h1>
                        <p class="page-intro">A simple subscription form is included for static hosting and forwards signups directly for follow-up.</p>
                    </div>
                    <a class="ghost-button" href="/rss.xml">RSS feed</a>
                </div>
                <div id="status-anchor"></div>
                <div class="form-layout">
                    <article class="form-card">
                        <h3>Subscribe</h3>
                        <p class="section-copy">Enter an email to receive future posts and portfolio updates.</p>
                        <form
                            class="form-stack js-email-form"
                            action="https://formsubmit.co/${data.site.email}"
                            method="POST"
                            data-next-path="/blog/?subscribed=1"
                        >
                            <input type="hidden" name="_subject" value="New blog subscriber" />
                            <input type="hidden" name="_template" value="table" />
                            <input type="text" name="_honey" class="sr-only" tabindex="-1" autocomplete="off" />
                            <input type="hidden" name="_next" value="" />
                            <div class="field-row">
                                <label class="field-label" for="subscribe-email">Email</label>
                                <input class="field-input" id="subscribe-email" name="email" type="email" required />
                            </div>
                            <p class="form-note">The form uses a static-hosting-friendly email handler with a honeypot field for basic spam filtering.</p>
                            <div class="button-row">
                                <button class="button" type="submit">Subscribe</button>
                            </div>
                        </form>
                    </article>

                    <article class="blog-card">
                        <h3>Index</h3>
                        <div class="post-stack">${postsMarkup}</div>
                    </article>
                </div>
            </section>
        </div>
    `;
}

function renderBlogDetailPage(data) {
    const params = new URLSearchParams(window.location.search);
    const post = findBlogPost(data, params.get("id"));
    if (!post) {
        return `
            <div class="page">
                <section class="section">
                    <div class="section-head">
                        <div>
                            <span class="eyebrow">Blog</span>
                            <h1 class="page-title">Post not found.</h1>
                        </div>
                    </div>
                    <div class="button-row">
                        <a class="ghost-button" href="/blog/">Back to Blog</a>
                    </div>
                </section>
            </div>
        `;
    }

    const body = (post.body || [])
        .map(paragraph => `<p class="timeline-copy">${paragraph}</p>`)
        .join("");

    return `
        <div class="page">
            <section class="section">
                <div class="button-row">
                    <a class="ghost-button" href="/blog/">Back to Blog</a>
                </div>
                <article class="tab-panel detail-shell">
                    <div class="entry-top">
                        <div>
                            <p class="item-title">${post.title}</p>
                            <p class="item-meta">${post.date}</p>
                            <p class="item-meta">By <a class="meta-link" href="/">Dana Briner</a></p>
                        </div>
                        <span class="tag">${post.category}</span>
                    </div>
                    <p class="card-copy detail-summary">${post.excerpt}</p>
                    <div class="detail-body">
                        ${body}
                    </div>
                </article>
            </section>
        </div>
    `;
}

function renderResumePage(data) {
    const experienceGroups = groupExperienceByCompany(data.resume.experience);
    const researchSection = data.portfolio.sections.find(section => section.key === "research");

    return `
        <div class="page">
            <section class="section">
                <div class="section-head">
                    <div>
                        <span class="eyebrow">Resume</span>
                        <h1 class="page-title">Experience, education, and research.</h1>
                    </div>
                    <button class="button" id="download-resume" type="button">Download PDF</button>
                </div>
                <div class="resume-shell" id="resume-document">
                    <div class="resume-header">
                        <div>
                            <h2 class="section-title">${data.site.name}</h2>
                            <div class="resume-meta">
                                <span>${data.site.location}</span>
                                <span>${data.site.phone}</span>
                                <span>${data.site.email}</span>
                            </div>
                        </div>
                        <div class="pill-row">
                            <span class="pill">Finance</span>
                            <span class="pill">Physics</span>
                            <span class="pill">Data Science</span>
                        </div>
                    </div>

                    <div class="resume-grid">
                        <div class="list-stack">
                            <article class="resume-card">
                                <h3>Experience</h3>
                                <div class="timeline-stack">
                                    ${experienceGroups
                                        .map(
                                            group => `
                                                <details class="disclosure-card experience-group-card" id="${group.anchorId}">
                                                    <summary class="timeline-top disclosure-summary">
                                                        <div>
                                                            <p class="item-title logo-line">
                                                                <img class="company-logo" src="${group.logo}" alt="${group.company} logo" />
                                                                ${group.company}
                                                            </p>
                                                            <p class="item-subtitle">${group.previewSummary}</p>
                                                            ${group.previewRoles.length ? `
                                                                <div class="role-preview-stack">
                                                                    ${group.previewRoles
                                                                        .map(
                                                                            role => `
                                                                                <div class="role-preview-item">
                                                                                    <span class="role-preview-title">${role.role}</span>
                                                                                    <span class="role-preview-date">${role.dates}</span>
                                                                                </div>
                                                                            `
                                                                        )
                                                                        .join("")}
                                                                </div>
                                                            ` : ""}
                                                        </div>
                                                        <span class="item-date">${group.dateSummary}</span>
                                                    </summary>
                                                    <div class="experience-role-stack">
                                                        ${group.roles
                                                            .map(
                                                                role => `
                                                                    <div class="experience-role">
                                                                        <div class="timeline-top">
                                                                            <div>
                                                                                <p class="item-title experience-role-title">${role.role}</p>
                                                                                <p class="item-subtitle">${role.dates}</p>
                                                                            </div>
                                                                        </div>
                                                                        <p class="timeline-copy">${role.description}</p>
                                                                        <ul class="detail-list">
                                                                            ${(role.details || []).map(detail => `<li>${detail}</li>`).join("")}
                                                                        </ul>
                                                                    </div>
                                                                `
                                                            )
                                                            .join("")}
                                                    </div>
                                                    ${group.href && group.callToAction ? `
                                                        <div class="association-row">
                                                            <a class="association-link" href="${group.href}">${group.callToAction}</a>
                                                        </div>
                                                    ` : ""}
                                                </details>
                                            `
                                        )
                                        .join("")}
                                </div>
                            </article>

                            <article class="resume-card">
                                <h3>Education</h3>
                                <div class="timeline-stack">
                                    ${data.resume.education
                                        .map(item => {
                                            const relatedResearchLinks = (item.portfolioIds || [])
                                                .map(id => findPortfolioItem(data, id))
                                                .filter(Boolean)
                                                .map(
                                                    linkedItem => `
                                                        <a class="association-link" href="${buildPortfolioDetailHref(linkedItem.detailPath, "research")}">
                                                            ${linkedItem.title}
                                                        </a>
                                                    `
                                                )
                                                .join("");

                                            return `
                                                <details class="disclosure-card education-card" id="${buildEducationAnchorId(item.school)}">
                                                    <summary class="timeline-top disclosure-summary">
                                                        <div>
                                                            <p class="item-title logo-line">
                                                                ${item.logo ? `<img class="inline-logo" src="${item.logo}" alt="${item.school} logo" />` : ""}
                                                                ${item.school}
                                                            </p>
                                                            <p class="item-subtitle">${item.degree}</p>
                                                        </div>
                                                        <span class="item-date">${item.dates}</span>
                                                    </summary>
                                                    <p class="timeline-copy">${item.summary}</p>
                                                    <ul class="detail-list">
                                                        ${item.details.map(detail => `<li>${detail}</li>`).join("")}
                                                    </ul>
                                                    ${relatedResearchLinks ? `<div class="association-row">${relatedResearchLinks}</div>` : ""}
                                                </details>
                                            `;
                                        })
                                        .join("")}
                                </div>
                            </article>

                            <article class="resume-card">
                                <h3>Research</h3>
                                <div class="timeline-stack">
                                    ${researchSection.items.map(item => renderResumeResearchCard(item, researchSection.key)).join("")}
                                </div>
                            </article>
                        </div>

                        <div class="list-stack">
                            <article class="resume-card">
                                <h3>Skills</h3>
                                <div class="tag-row">
                                    ${data.resume.skills.map(skill => `<span class="tag">${skill}</span>`).join("")}
                                </div>
                            </article>

                            <article class="resume-card">
                                <h3>Awards and Certifications</h3>
                                <div class="timeline-stack">
                                    ${data.resume.certifications
                                        .map(item => `<div class="timeline-item"><p class="timeline-copy">${item}</p></div>`)
                                        .join("")}
                                    ${data.resume.awards
                                        .map(item => `<div class="timeline-item"><p class="timeline-copy">${item}</p></div>`)
                                        .join("")}
                                </div>
                            </article>

                            <article class="resume-card">
                                <h3>Interests</h3>
                                <p class="timeline-copy">${data.resume.interests}</p>
                            </article>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    `;
}

function renderContactPage(data) {
    return `
        <div class="page">
            <section class="section">
                <div class="section-head">
                    <div>
                        <span class="eyebrow">Contact</span>
                        <h1 class="page-title">Start a conversation.</h1>
                        <p class="page-intro">The form posts through a static hosting form handler so it works after deployment without a custom backend.</p>
                    </div>
                </div>
                <div id="status-anchor"></div>
                <div class="form-layout">
                    <article class="form-card">
                        <h3>Contact form</h3>
                        <form
                            class="form-stack js-email-form"
                            action="https://formsubmit.co/${data.site.email}"
                            method="POST"
                            data-next-path="/contact/?submitted=1"
                        >
                            <input type="hidden" name="_subject" value="New portfolio contact message" />
                            <input type="hidden" name="_template" value="table" />
                            <input type="text" name="_honey" class="sr-only" tabindex="-1" autocomplete="off" />
                            <input type="hidden" name="_next" value="" />
                            <div class="field-row">
                                <label class="field-label" for="contact-name">Name</label>
                                <input class="field-input" id="contact-name" name="name" type="text" required />
                            </div>
                            <div class="field-row">
                                <label class="field-label" for="contact-email">Email</label>
                                <input class="field-input" id="contact-email" name="email" type="email" required />
                            </div>
                            <div class="field-row">
                                <label class="field-label" for="contact-message">Message</label>
                                <textarea class="field-textarea" id="contact-message" name="message" required></textarea>
                            </div>
                            <button class="button" type="submit">Send message</button>
                        </form>
                    </article>

                    <article class="contact-card">
                        <h3>Direct links</h3>
                        <div class="post-stack">
                            <div class="post-item">
                                <p class="item-title">Email</p>
                                <a class="portfolio-link" href="mailto:${data.site.email}">${data.site.email}</a>
                            </div>
                            <div class="post-item">
                                <p class="item-title">LinkedIn</p>
                                <a class="portfolio-link" href="${data.site.linkedin}" target="_blank" rel="noreferrer">${data.site.linkedinLabel}</a>
                            </div>
                            <div class="post-item">
                                <p class="item-title">GitHub</p>
                                <a class="portfolio-link" href="${data.site.github}" target="_blank" rel="noreferrer">${data.site.githubLabel}</a>
                            </div>
                        </div>
                    </article>
                </div>
            </section>
        </div>
    `;
}

function setupPortfolioTabs(sections) {
    const panel = document.getElementById("portfolio-panel");
    const buttons = document.querySelectorAll("[data-portfolio-tab]");
    if (!panel || !buttons.length) {
        return;
    }

    const updatePortfolioUrl = key => {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", key);
        window.history.replaceState({}, "", `${url.pathname}${url.search}`);
    };

    const render = key => {
        const activeSection = sections.find(section => section.key === key) || sections[0];
        updatePortfolioUrl(activeSection.key);
        buttons.forEach(button => {
            button.classList.toggle("is-active", button.dataset.portfolioTab === activeSection.key);
        });
        panel.innerHTML = `
            <section class="tab-panel">
                <div class="section-head">
                    <div>
                        <h2 class="section-title">${activeSection.label}</h2>
                        <p class="section-copy">${activeSection.description}</p>
                    </div>
                </div>
                <div class="portfolio-grid">
                    ${activeSection.items
                        .map(item => renderPortfolioCard(item, activeSection.key))
                        .join("")}
                </div>
            </section>
        `;
    };

    buttons.forEach(button => {
        button.addEventListener("click", () => render(button.dataset.portfolioTab));
    });

    const initialTab = new URLSearchParams(window.location.search).get("tab");
    render(initialTab || sections[0].key);
}

function renderPortfolioDetailPage(data) {
    const params = new URLSearchParams(window.location.search);
    const item = findPortfolioItem(data, params.get("id"));
    const activeSection = findPortfolioSection(data, params.get("tab")) || findPortfolioSectionForItem(data, params.get("id"));
    const backHref = activeSection ? `/portfolio/?tab=${activeSection.key}` : "/portfolio/";
    if (!item) {
        return `
            <div class="page">
                <section class="section">
                    <div class="section-head">
                        <div>
                            <span class="eyebrow">Portfolio</span>
                            <h1 class="page-title">Item not found.</h1>
                        </div>
                    </div>
                    <div class="button-row">
                        <a class="ghost-button" href="${backHref}">Back to Portfolio</a>
                    </div>
                </section>
            </div>
        `;
    }

    return `
        <div class="page">
            <section class="section">
                <div class="button-row">
                    <a class="ghost-button" href="${backHref}">Back to Portfolio</a>
                </div>
                <article class="tab-panel detail-shell">
                    <div class="entry-top">
                        <div>
                            <p class="item-title title-with-icon">
                                ${item.logo ? `<img class="project-icon" src="${item.logo}" alt="" />` : ""}
                                ${item.title}
                            </p>
                            <p class="item-meta">${item.meta}</p>
                        </div>
                        ${item.tag ? `<span class="tag">${item.tag}</span>` : ""}
                    </div>
                    <p class="card-copy detail-summary">${item.description}</p>
                    ${renderAssociationLinks(item.associations)}
                    ${renderDetailContent(item)}
                </article>
            </section>
        </div>
    `;
}

function renderAssociationLinks(associations) {
    if (!associations || !associations.length) {
        return "";
    }

    return `
        <div class="association-row">
            ${associations
                .map(
                    link => `
                        <a class="association-link" href="${link.href}">
                            ${link.logo ? `<img class="association-logo" src="${link.logo}" alt="" />` : ""}
                            ${link.label}
                        </a>
                    `
                )
                .join("")}
        </div>
    `;
}

function renderPortfolioCard(item, tabKey) {
    return `
        <article class="portfolio-card">
            ${renderAssociationLinks(item.associations)}
            <div class="entry-top">
                <div>
                    <p class="item-title title-with-icon">
                        ${item.logo ? `<img class="project-icon" src="${item.logo}" alt="" />` : ""}
                        ${item.title}
                    </p>
                    ${item.meta ? `<p class="item-meta">${item.meta}</p>` : ""}
                </div>
                ${item.tag ? `<span class="tag">${item.tag}</span>` : ""}
            </div>
            <p class="card-copy">${item.description}</p>
            <a class="portfolio-link" href="${buildPortfolioDetailHref(item.detailPath, tabKey)}">Open item</a>
        </article>
    `;
}

function renderResumeResearchCard(item, tabKey) {
    return `
        <article class="timeline-link-card">
            <p class="item-title">${item.title}</p>
            <p class="item-meta">${item.meta}</p>
            ${renderAssociationLinks(item.associations)}
            <p class="timeline-copy">${item.summary || item.description}</p>
            <a class="portfolio-link" href="${buildPortfolioDetailHref(item.detailPath, tabKey)}">Open item</a>
        </article>
    `;
}

function renderDetailContent(item) {
    const links = item.links && item.links.length
        ? `
            <div class="button-row">
                ${item.links
                    .map(
                        link => `
                            <a class="ghost-button" href="${link.url}" target="_blank" rel="noreferrer">${link.label}</a>
                        `
                    )
                    .join("")}
            </div>
        `
        : "";

    if (item.contentType === "pdf") {
        return `
            ${links}
            <div class="detail-embed">
                <iframe class="embedded-frame" src="${item.pdfSrc}" title="${item.title} PDF"></iframe>
            </div>
        `;
    }

    if (item.contentType === "external-preview") {
        return `
            ${links}
            <div class="detail-embed">
                <iframe class="embedded-frame" src="${item.embedSrc}" title="${item.embedLabel || item.title}" loading="lazy"></iframe>
            </div>
        `;
    }

    const body = (item.detailBody || [])
        .map(paragraph => `<p class="timeline-copy">${paragraph}</p>`)
        .join("");

    return `
        ${links}
        <div class="detail-body">
            ${body}
        </div>
    `;
}

function findPortfolioItem(data, id) {
    if (!id) {
        return null;
    }

    for (const section of data.portfolio.sections) {
        const item = section.items.find(entry => entry.id === id);
        if (item) {
            return item;
        }
    }

    return null;
}

function findBlogPost(data, id) {
    if (!id) {
        return null;
    }

    return data.blog.posts.find(post => post.id === id) || null;
}

function findPortfolioSection(data, key) {
    if (!key) {
        return null;
    }

    return data.portfolio.sections.find(section => section.key === key) || null;
}

function findPortfolioSectionForItem(data, id) {
    if (!id) {
        return null;
    }

    return data.portfolio.sections.find(section => section.items.some(item => item.id === id)) || null;
}

function buildPortfolioDetailHref(detailPath, tabKey) {
    const url = new URL(detailPath, window.location.origin);
    url.searchParams.set("tab", tabKey);
    return `${url.pathname}${url.search}`;
}

function buildExperienceAnchorId(company) {
    return `experience-${slugify(company)}`;
}

function buildEducationAnchorId(school) {
    return `education-${slugify(school)}`;
}

function groupExperienceByCompany(items) {
    const groups = [];

    items.forEach(item => {
        const existing = groups.find(group => group.company === item.company);
        if (existing) {
            existing.roles.push(item);
            if (!existing.portfolioId && item.portfolioId) {
                existing.portfolioId = item.portfolioId;
            }
            if (!existing.portfolioTab && item.portfolioTab) {
                existing.portfolioTab = item.portfolioTab;
            }
            return;
        }

        groups.push({
            company: item.company,
            logo: item.logo,
            roles: [item],
            portfolioId: item.portfolioId || null,
            portfolioTab: item.portfolioTab || null
        });
    });

    return groups.map(group => {
        const href = group.portfolioId
            ? buildPortfolioDetailHref(`/portfolio/item/?id=${group.portfolioId}`, group.portfolioTab || "")
            : group.portfolioTab
                ? `/portfolio/?tab=${group.portfolioTab}`
                : null;
        const previewSource = group.roles.map(role => role.description).join(" ");

        return {
            ...group,
            anchorId: buildExperienceAnchorId(group.company),
            href,
            summary: group.roles.map(role => role.role).join(" · "),
            previewSummary: previewSource,
            dateSummary: `${group.roles[group.roles.length - 1].dates}${group.roles.length > 1 ? " · Multiple roles" : ""}`,
            previewRoles: group.roles.map(role => ({ role: role.role, dates: role.dates })),
            callToAction: href ? (group.portfolioId ? "View Related Work" : "Open Portfolio Track") : null
        };
    });
}

function slugify(value) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function openHashDisclosure() {
    const hash = window.location.hash;
    if (!hash) {
        return;
    }

    const target = document.querySelector(hash);
    if (!(target instanceof HTMLDetailsElement)) {
        return;
    }

    target.open = true;
    target.scrollIntoView({ block: "start", behavior: "smooth" });
}

function setupForms() {
    document.querySelectorAll(".js-email-form").forEach(form => {
        const nextInput = form.querySelector('input[name="_next"]');
        if (nextInput) {
            nextInput.value = `${window.location.origin}${form.dataset.nextPath}`;
        }

        form.addEventListener("submit", event => {
            const email = form.querySelector('input[type="email"]');
            if (email && !email.checkValidity()) {
                event.preventDefault();
                showInlineStatus(form, "Please enter a valid email address.", true);
            }
        });
    });
}

function showInlineStatus(form, message, isError) {
    let node = form.querySelector(".status-message");
    if (!node) {
        node = document.createElement("p");
        node.className = "status-message";
        form.prepend(node);
    }
    node.classList.toggle("error", Boolean(isError));
    node.textContent = message;
}

function injectStatusMessage(param, message) {
    const anchor = document.getElementById("status-anchor");
    if (!anchor) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get(param) === "1") {
        const node = document.createElement("p");
        node.className = "status-message";
        node.textContent = message;
        anchor.appendChild(node);
    }
}

function setupResumeDownload() {
    const button = document.getElementById("download-resume");
    const documentNode = document.getElementById("resume-document");
    if (!button || !documentNode) {
        return;
    }

    button.addEventListener("click", async () => {
        const originalText = button.textContent;
        button.textContent = "Preparing PDF...";
        button.disabled = true;

        try {
            await loadScript("https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js");
            await loadScript("https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js");

            const canvas = await window.html2canvas(documentNode, {
                scale: 2,
                backgroundColor: "#ffffff",
                useCORS: true
            });

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF("p", "pt", "a4");
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imageWidth = pageWidth - 56;
            const imageHeight = canvas.height * imageWidth / canvas.width;
            const imageData = canvas.toDataURL("image/png");
            let remainingHeight = imageHeight;
            let offset = 28;

            pdf.addImage(imageData, "PNG", 28, offset, imageWidth, imageHeight, "", "FAST");
            remainingHeight -= pageHeight;

            while (remainingHeight > 0) {
                offset = remainingHeight - imageHeight + 28;
                pdf.addPage();
                pdf.addImage(imageData, "PNG", 28, offset, imageWidth, imageHeight, "", "FAST");
                remainingHeight -= pageHeight;
            }

            pdf.save("Dana_Briner_Resume.pdf");
        } catch (error) {
            console.error(error);
            window.print();
        } finally {
            button.textContent = originalText;
            button.disabled = false;
        }
    });
}

const loadedScripts = new Map();

function loadScript(src) {
    if (loadedScripts.has(src)) {
        return loadedScripts.get(src);
    }

    const promise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
    loadedScripts.set(src, promise);
    return promise;
}
