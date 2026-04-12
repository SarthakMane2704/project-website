const App = {
  selectors: {
    competitionsGrid: document.querySelector("#competitions-grid"),
    competitionCount: document.querySelector("#competition-count"),
    template: document.querySelector("#competition-card-template"),
    navToggle: document.querySelector(".nav-toggle"),
    navLinks: document.querySelector(".nav-links"),
    contactForm: document.querySelector(".contact-form"),
    revealItems: () => document.querySelectorAll(".reveal")
  },

  async init() {
    this.bindNavigation();
    this.bindContactForm();
    this.setupRevealObserver();
    await this.loadCompetitions();
  },

  bindNavigation() {
    const { navToggle, navLinks } = this.selectors;

    if (navToggle && navLinks) {
      navToggle.addEventListener("click", () => {
        const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
        navToggle.setAttribute("aria-expanded", String(!isExpanded));
        document.body.classList.toggle("menu-open", !isExpanded);
      });

      navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          navToggle.setAttribute("aria-expanded", "false");
          document.body.classList.remove("menu-open");
        });
      });
    }
  },

  bindContactForm() {
    const { contactForm } = this.selectors;

    if (!contactForm) {
      return;
    }

    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const submitButton = contactForm.querySelector("button[type='submit']");
      if (submitButton) {
        submitButton.textContent = "Message Prepared";
      }
    });
  },

  async loadCompetitions() {
    const { competitionsGrid, competitionCount } = this.selectors;

    if (!competitionsGrid || !competitionCount) {
      return;
    }

    try {
      const response = await fetch("competitions.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Unable to load competition data.");
      }

      const competitions = await response.json();
      this.renderCompetitions(Array.isArray(competitions) ? competitions : []);
    } catch (error) {
      competitionCount.textContent = "Data unavailable";
      competitionsGrid.innerHTML = `<div class="empty-state">Unable to load competition decks right now.</div>`;
    }
  },

  renderCompetitions(competitions) {
    const { competitionsGrid, competitionCount, template } = this.selectors;

    if (!competitions.length) {
      competitionCount.textContent = "0 decks";
      competitionsGrid.innerHTML = `<div class="empty-state">No competitions added yet. Update <strong>competitions.json</strong> to populate this section.</div>`;
      this.refreshRevealObserver();
      return;
    }

    const fragment = document.createDocumentFragment();

    competitions.forEach((competition) => {
      const card = template.content.firstElementChild.cloneNode(true);
      card.querySelector(".position-badge").textContent = competition.position;
      card.querySelector(".organizer").textContent = competition.organizer;
      card.querySelector(".competition-title").textContent = competition.title;
      card.querySelector(".competition-description").textContent = competition.description;

      const viewLink = card.querySelector(".view-link");
      const downloadLink = card.querySelector(".download-link");
      viewLink.href = competition.link;
      downloadLink.href = competition.link;

      const tagRow = card.querySelector(".tag-row");
      (competition.tags || []).forEach((tag) => {
        const pill = document.createElement("span");
        pill.className = "tag";
        pill.textContent = tag;
        tagRow.appendChild(pill);
      });

      fragment.appendChild(card);
    });

    competitionsGrid.innerHTML = "";
    competitionsGrid.appendChild(fragment);
    competitionCount.textContent = `${competitions.length} featured decks`;
    this.refreshRevealObserver();
  },

  setupRevealObserver() {
    this.revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            this.revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12
      }
    );

    this.refreshRevealObserver();
  },

  refreshRevealObserver() {
    if (!this.revealObserver) {
      return;
    }

    this.selectors.revealItems().forEach((item) => this.revealObserver.observe(item));
  }
};

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
