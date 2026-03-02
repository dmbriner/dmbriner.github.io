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
    const navLinks = data.nav
        .map(
            item => `
                <a class="nav-link ${page === item.key ? "is-active" : ""}" href="${item.href}">
                    ${item.label}
                </a>
            `
        )
        .join("");

    header.innerHTML = `
        <div class="site-header">
            <nav class="site-nav" aria-label="Primary">
                <a class="brand" href="/">
                    <img class="brand-mark" src="${data.site.logo}" alt="${data.site.name} logo" />
                    <span class="brand-copy">
                        <span class="brand-name">${data.site.name}</span>
                        <span class="brand-tag">${data.site.tagline}</span>
                    </span>
                </a>
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
    const mobileLinks = header.querySelectorAll(".mobile-sheet .nav-link");
    toggle.addEventListener("click", () => {
        const open = document.body.classList.toggle("nav-open");
        toggle.setAttribute("aria-expanded", String(open));
    });
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

    if (page === "blog") {
        root.innerHTML = renderBlogPage(data);
        injectStatusMessage("subscribed", "Subscription received. Please confirm the email if the form service asks.");
        return;
    }

    if (page === "resume") {
        root.innerHTML = renderResumePage(data);
        setupResumeDownload();
        return;
    }

    if (page === "contact") {
        root.innerHTML = renderContactPage(data);
        injectStatusMessage("submitted", "Message received. You should be redirected back here after the form submission completes.");
    }
}

function renderAboutPage(data) {
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
                        <a class="button" href="/portfolio/">View portfolio</a>
                        <a class="ghost-button" href="/resume/">Open resume</a>
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
                        <h2 class="section-title">Work spanning finance, research, and quantitative analysis.</h2>
                    </div>
                </div>
                <div class="card-grid">
                    ${data.about.metrics
                        .map(
                            metric => `
                                <article class="metric">
                                    <p class="metric-value">${metric.value}</p>
                                    <p class="metric-label">${metric.label}</p>
                                </article>
                            `
                        )
                        .join("")}
                </div>
            </section>

            <section class="section">
                <div class="split-grid">
                    <article class="list-card">
                        <h3>Recent experience</h3>
                        <div class="timeline-stack">
                            ${data.resume.experience
                                .slice(0, 3)
                                .map(
                                    item => `
                                        <div class="timeline-item">
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
                                        </div>
                                    `
                                )
                                .join("")}
                        </div>
                    </article>

                    <article class="list-card">
                        <h3>Academic focus</h3>
                        <div class="timeline-stack">
                            ${data.resume.education
                                .map(
                                    item => `
                                        <div class="timeline-item">
                                            <div class="timeline-top">
                                                <div>
                                                    <p class="item-title">${item.school}</p>
                                                    <p class="item-subtitle">${item.degree}</p>
                                                </div>
                                                <span class="item-date">${item.dates}</span>
                                            </div>
                                            <p class="timeline-copy">${item.summary}</p>
                                        </div>
                                    `
                                )
                                .join("")}
                        </div>
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

function renderResumePage(data) {
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
                                    ${data.resume.experience
                                        .map(
                                            item => `
                                                <div class="timeline-item">
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
                                                </div>
                                            `
                                        )
                                        .join("")}
                                </div>
                            </article>

                            <article class="resume-card">
                                <h3>Education</h3>
                                <div class="timeline-stack">
                                    ${data.resume.education
                                        .map(
                                            item => `
                                                <div class="timeline-item">
                                                    <div class="timeline-top">
                                                        <div>
                                                            <p class="item-title">${item.school}</p>
                                                            <p class="item-subtitle">${item.degree}</p>
                                                        </div>
                                                        <span class="item-date">${item.dates}</span>
                                                    </div>
                                                    <p class="timeline-copy">${item.summary}</p>
                                                    ${item.details.map(detail => `<p class="timeline-copy">${detail}</p>`).join("")}
                                                </div>
                                            `
                                        )
                                        .join("")}
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
                                <h3>Research</h3>
                                <div class="timeline-stack">
                                    ${data.portfolio.sections
                                        .find(section => section.key === "research")
                                        .items.map(
                                            item => `
                                                <div class="timeline-item">
                                                    <p class="item-title">${item.title}</p>
                                                    <p class="item-meta">${item.meta}</p>
                                                    <p class="timeline-copy">${item.description}</p>
                                                </div>
                                            `
                                        )
                                        .join("")}
                                </div>
                            </article>

                            <article class="resume-card">
                                <h3>Awards and certifications</h3>
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

    const render = key => {
        const activeSection = sections.find(section => section.key === key) || sections[0];
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
                        .map(
                            item => `
                                <article class="portfolio-card">
                                    <div class="entry-top">
                                        <div>
                                            <p class="item-title">${item.title}</p>
                                            <p class="item-meta">${item.meta}</p>
                                        </div>
                                        ${item.tag ? `<span class="tag">${item.tag}</span>` : ""}
                                    </div>
                                    <p class="card-copy">${item.description}</p>
                                    ${item.href ? `<a class="portfolio-link" href="${item.href}" ${item.href.startsWith("http") ? 'target="_blank" rel="noreferrer"' : ""}>Open item</a>` : ""}
                                </article>
                            `
                        )
                        .join("")}
                </div>
            </section>
        `;
    };

    buttons.forEach(button => {
        button.addEventListener("click", () => render(button.dataset.portfolioTab));
    });
    render(sections[0].key);
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
