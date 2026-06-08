(function () {
  const state = {
    data: null,
    selectedTrouble: 0,
    captureMode: document.body.dataset.captureMode || "fixed",
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function text(value) {
    return value == null ? "" : String(value);
  }

  function create(tag, className, content) {
    const element = document.createElement(tag);
    if (className) {
      element.className = className;
    }
    if (content != null) {
      element.textContent = content;
    }
    return element;
  }

  function renderBoard(modules) {
    const board = $("[data-flow-board]");
    board.replaceChildren();

    modules.forEach((module) => {
      const article = create("article", "PortfolioFlow-Module");
      const header = create("header", "PortfolioFlow-ModuleHeader");
      header.append(create("div", "PortfolioFlow-Lane", module.lane));

      const title = create("div", "PortfolioFlow-ModuleTitle");
      title.append(create("h2", "", module.title));
      title.append(create("p", "", module.summary));
      header.append(title);

      const steps = create("div", "PortfolioFlow-Steps");
      module.steps.forEach((step) => {
        const item = create("section", "PortfolioFlow-Step");
        const box = create("div", "PortfolioFlow-StepBox");
        box.append(create("span", "PortfolioFlow-StepNumber", step.number));
        box.append(create("strong", "PortfolioFlow-StepTitle", step.title));
        box.append(create("p", "PortfolioFlow-StepDetail", step.detail));
        item.append(box);
        steps.append(item);
      });

      article.append(header, steps);
      board.append(article);
    });
  }

  function renderPlanning(insights) {
    const grid = $("[data-planning-grid]");
    grid.replaceChildren();

    insights.forEach((insight, index) => {
      const card = create("article", "PortfolioFlow-PlanningCard");
      card.append(create("span", "PortfolioFlow-PlanningNumber", String(index + 1).padStart(2, "0")));
      card.append(create("h3", "", insight.title));
      card.append(create("p", "", insight.analysis));
      const decision = create("strong", "PortfolioFlow-Decision", "Implementation decision");
      const detail = create("p", "PortfolioFlow-DecisionText", insight.implementationDecision);
      card.append(decision, detail);
      grid.append(card);
    });
  }

  function renderImageEvidence(images) {
    const grid = $("[data-image-evidence]");
    grid.replaceChildren();

    images.forEach((item) => {
      const card = create("figure", "PortfolioFlow-ImageCard");
      const image = create("img");
      image.src = item.imageUrl;
      image.alt = item.title;
      image.loading = "lazy";
      const caption = create("figcaption");
      caption.append(create("strong", "", item.title));
      caption.append(create("span", "", item.analysis));
      card.append(image, caption);
      grid.append(card);
    });
  }

  function renderBackend(modules) {
    const grid = $("[data-backend-grid]");
    grid.replaceChildren();

    modules.forEach((module) => {
      const column = create("section", "PortfolioFlow-BackendColumn");
      column.append(create("h2", "", module.title));
      const list = create("ol");
      module.steps.forEach((step) => {
        const item = create("li");
        item.textContent = `${step.number}. ${step.title} - ${step.detail}`;
        list.append(item);
      });
      column.append(list);
      grid.append(column);
    });
  }

  function renderAi(useCases) {
    const grid = $("[data-ai-grid]");
    grid.replaceChildren();
    useCases.forEach((useCase) => {
      const card = create("article", "PortfolioFlow-AICard");
      card.append(create("h3", "", useCase.title));
      card.append(create("p", "", useCase.detail));
      grid.append(card);
    });
  }

  function terminalCopy(item, mode) {
    if (mode === "error") {
      return [
        "$ curl /portfolio/reproduce/" + item.key,
        "HTTP/1.1 500 INTERNAL_SERVER_ERROR",
        "Symptom: " + item.before,
        "Capture note: take this screenshot before applying the fix.",
      ].join("\n");
    }
    if (mode === "overview") {
      return [
        "$ ./gradlew test --tests PortfolioFlowContract",
        "BUILD SUCCESSFUL",
        "Evidence: failure mode and fixed mode are isolated capture states.",
        "No production workflow is intentionally broken.",
      ].join("\n");
    }
    return [
      "$ curl /portfolio/verify/" + item.key,
      "HTTP/1.1 200 OK",
      "Fix: " + item.fix,
      "Result: " + item.after,
    ].join("\n");
  }

  function renderTroubleshooting(items) {
    const list = $("[data-trouble-list]");
    list.replaceChildren();

    items.forEach((item, index) => {
      const button = create("button", "PortfolioFlow-TroubleButton" + (index === state.selectedTrouble ? " is-active" : ""));
      button.type = "button";
      button.dataset.troubleIndex = index;
      button.append(create("strong", "", item.title));
      button.append(create("span", "", item.before));
      button.addEventListener("click", () => {
        state.selectedTrouble = index;
        renderTroubleshooting(items);
      });
      list.append(button);
    });

    const selected = items[state.selectedTrouble] || items[0];
    const terminal = $("[data-capture-terminal]");
    const mode = state.captureMode;
    $("[data-capture-status]").textContent = mode === "error" ? "Failure Evidence" : mode === "overview" ? "Verification Evidence" : "Fixed Evidence";
    $("[data-capture-title]").textContent = selected.title;
    $("[data-capture-before]").textContent = selected.before;
    $("[data-capture-fix]").textContent = selected.fix;
    $("[data-capture-after]").textContent = selected.after;
    terminal.textContent = terminalCopy(selected, mode);
    terminal.classList.toggle("is-error", mode === "error");
    terminal.classList.toggle("is-fixed", mode !== "error");
  }

  function bindTabs() {
    $$("[data-flow-tab]").forEach((tab) => {
      tab.addEventListener("click", () => {
        const target = tab.dataset.flowTab;
        $$("[data-flow-tab]").forEach((button) => button.classList.toggle("is-active", button === tab));
        $$("[data-flow-panel]").forEach((panel) => {
          const active = panel.dataset.flowPanel === target;
          panel.hidden = !active;
          panel.classList.toggle("is-active", active);
        });
      });
    });
  }

  function applyInitialState() {
    $$("[data-capture-link]").forEach((link) => {
      link.classList.toggle("is-active", link.dataset.captureLink === state.captureMode);
    });

    const initialView = document.body.dataset.initialView;
    const initialTab = $(`[data-flow-tab="${initialView}"]`);
    if (initialTab) {
      initialTab.click();
    }
    if (state.captureMode === "error" || state.captureMode === "fixed") {
      const troubleTab = $('[data-flow-tab="troubleshooting"]');
      if (troubleTab) {
        troubleTab.click();
      }
    }
  }

  async function load() {
    bindTabs();
    try {
      const response = await fetch("/portfolio/api/flowchart", { headers: { "Accept": "application/json" } });
      if (!response.ok) {
        throw new Error(`Portfolio API failed: ${response.status}`);
      }
      state.data = await response.json();
      renderPlanning(state.data.planningInsights || []);
      renderImageEvidence(state.data.imageEvidence || []);
      renderBoard(state.data.modules);
      renderBackend(state.data.modules);
      renderAi(state.data.aiUseCases);
      renderTroubleshooting(state.data.troubleshooting);
      applyInitialState();
    } catch (error) {
      const board = $("[data-flow-board]");
      board.textContent = error.message;
    }
  }

  document.addEventListener("DOMContentLoaded", load);
})();
