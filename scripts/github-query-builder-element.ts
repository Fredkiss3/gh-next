import { controller, attr, findTarget } from "@github/catalyst";
import Combobox from "@github/combobox-nav";
import { html, render } from "@github-ui/jtml-shimmed";
import type { TemplateResult } from "@github-ui/jtml-shimmed";
import {
  QueryEvent,
  Provider,
  Parser,
  SearchItem,
  FilterItem,
  SearchScopeText,
  AutocompleteText,
  FetchDataEvent,
  Avatar,
  FilterProvider,
  Icon,
  QueryElement,
  SearchProvider,
  isCustomIcon,
  TextElementStyle
} from "./query-builder-api";

class FeedbackEvent extends Event {
  constructor(
    public key: string,
    public text: string,
    public data: Record<string, unknown>
  ) {
    super("query-builder-feedback", { bubbles: true, cancelable: true });
    this.key = key;
    this.text = text;
    this.data = data;
  }
}

interface LocalizedScreenReaderText {
  suggestion: string;
  suggestions: string;
  clear_search: string;
}

// Sorts by priority number; the lower the number, the higher it will appear in the list
const sortByPriority = (
  a: FilterProvider | SearchItem | FilterItem,
  b: FilterProvider | SearchItem | FilterItem
) => a.priority - b.priority;

@controller
export class QueryBuilderElement extends HTMLElement {
  #combobox?: Combobox;
  #interactingWithList = false;
  #isCleared = false;
  #providers: Record<string, Provider> = {};
  #filterNames: Set<string> = new Set();
  #abortController: AbortController | null = null;
  #parseAbortController: AbortController | null = null;
  #searchItems: Map<SearchProvider, SearchItem[]> = new Map();
  #searchItemsFetchBuffer: Map<SearchProvider, SearchItem[]> = new Map();
  #searchItemsMarkedForClearing: Set<SearchProvider> = new Set();
  #filters: Set<FilterProvider> = new Set();
  #filterItems: Map<FilterProvider, FilterItem[]> = new Map();
  #uniqueId: string | null;
  #focusClass = "QueryBuilder-focus";
  #inputCache = new Map<string, QueryElement[]>();
  #SCREEN_READER_DELAY = 150;
  #fetchDataTimeout = 3000;
  #fetchingResults: Promise<unknown> | false = false;
  #canAttachProviders = false;
  #requested = false;
  parser: Parser<unknown> = {
    parse: this.#defaultParser.bind(this),
    flatten: (ast: QueryElement[]) => ast
  };
  parsedMetadata: unknown = undefined;
  renderSingularItemNames = false;
  #usingCustomParser = false;
  lastParsedQuery: string | undefined = undefined;

  @attr filterKey: string;

  /** the overlaying input where the user will type, but doesn't style the text */
  get input(): HTMLInputElement {
    return findTarget(this, "input") as HTMLInputElement;
  }
  /** contains the styled input content that the user can see */
  get styledInputContent(): HTMLElement {
    return findTarget(this, "styledInputContent") as HTMLElement;
  }
  /** the element that scrolls with the styled input content */
  get styledInputContainer(): HTMLDivElement {
    return findTarget(this, "styledInputContainer") as HTMLDivElement;
  }
  get styledInput(): HTMLElement {
    return findTarget(this, "styledInput") as HTMLElement;
  }
  get overlay(): HTMLElement {
    return findTarget(this, "overlay") as HTMLElement;
  }
  /** this sizer is invisible and contains the same text as the input; we measure it's width to set the width of the visually styled input */
  get sizer(): HTMLElement {
    return findTarget(this, "sizer") as HTMLElement;
  }
  get clearButton(): HTMLButtonElement {
    return findTarget(this, "clearButton") as HTMLButtonElement;
  }
  get resultsList(): HTMLUListElement {
    return findTarget(this, "resultsList") as HTMLUListElement;
  }
  get screenReaderFeedback(): HTMLElement {
    return findTarget(this, "screenReaderFeedback") as HTMLElement;
  }

  get query() {
    return this.input.value;
  }

  get i18n(): LocalizedScreenReaderText {
    return {
      suggestion: "suggestion",
      suggestions: "suggestions",
      clear_search: "Input cleared."
    };
  }

  // This navigate callback is used to signal that a user has clicked on a URL.
  // We need this in code view to intercept line hash navigations (i.e. #L123)
  // within the same file.
  navigate(event: Event) {
    const url = (event?.target as HTMLElement)
      ?.closest("a")
      ?.getAttribute("href");
    if (url) {
      this.dispatchEvent(
        new CustomEvent("query-builder:navigate", {
          bubbles: true,
          detail: { url }
        })
      );
    }
  }

  get closed() {
    return this.overlay && this.overlay.hasAttribute("hidden");
  }

  set closed(value: boolean) {
    if (value) {
      if (this.closed) return;

      if (this.overlay) {
        this.overlay.hidden = true;
      }

      this.input.setAttribute("aria-expanded", "false");

      this.#combobox?.clearSelection();
    } else {
      if (!this.closed) return;

      if (this.overlay) {
        this.overlay.hidden = false;
      }
      this.input.setAttribute("aria-expanded", "true");
    }
  }

  show() {
    this.closed = false;
    this.overlay?.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
  }

  hide() {
    if (this.resultsList.getAttribute("data-persist-list") === "false") {
      this.closed = true;
    }
  }

  initialize(parser: Parser<unknown>, providers: Provider[]) {
    this.parser = parser;
    this.#usingCustomParser = true;
    this.#canAttachProviders = true;
    for (const provider of providers) {
      this.attachProvider(provider);
    }
    this.#canAttachProviders = false;
    this.#providers = providers.reduce((rest, provider) => {
      return {
        ...rest,
        [provider.value]: provider
      };
    }, {});
  }

  elementDefinitionReadyForProviders = (e: Event) => {
    const event = e as CustomEvent<{ id: string }>;
    if (event.detail.id === this.#uniqueId) {
      this.readyForRequestProviders();
      e.stopImmediatePropagation();
    }
  };

  detachElementDefinitionReadyForProviders() {
    this.removeEventListener(
      "query-builder:ready-to-request-provider",
      this.elementDefinitionReadyForProviders
    );
  }

  connectedCallback() {
    this.#abortController?.abort();
    const { signal } = (this.#abortController = new AbortController());
    signal.addEventListener("abort", () => {
      this.#providers = {};
    });
    this.#uniqueId = this.input.getAttribute("id");

    if (!this.hasAttribute("defer-request-providers")) {
      document.addEventListener(
        "query-builder:ready-to-request-provider",
        this.elementDefinitionReadyForProviders,
        true
      );
      this.readyForRequestProviders();
    }
  }

  readyForRequestProviders() {
    if (this.#providerCount() > 0 && this.#requested) return;
    this.#combobox ||= new Combobox(this.input, this.resultsList, {
      tabInsertsSuggestions: false
    });
    this.requestProviders();
  }

  async requestProviders() {
    this.#requested = true;
    await Promise.resolve();

    this.#canAttachProviders = true;
    this.dispatchEvent(
      new Event("query-builder:request-provider", { bubbles: true })
    );
    this.#canAttachProviders = false;

    // Existing text may match new providers, so clear cache to ensure that
    // the styling is correct.
    this.#inputCache = new Map<string, QueryElement[]>();
    const elements = this.parseInputValue();
    this.styleInputText(elements);
    this.toggleClearButtonVisibility();
  }

  // This function parse the current input value and cache the resulting parsed metadata. To
  // parse values other than the input's value, directly use this.parser.
  parseInputValue(): QueryElement[] {
    this.parsedMetadata = this.parser.parse(
      this.input.value,
      this.input.selectionStart || 0
    );
    return this.parser.flatten(this.parsedMetadata);
  }

  attachProvider(provider: Provider) {
    if (!this.#abortController) return;
    const { signal } = this.#abortController;

    if (!this.#canAttachProviders) {
      throw new Error(
        "Can't attach providers after the query builder has been connected"
      );
    }
    if (this.#providers[provider.value]) return;

    this.#providers[provider.value] = provider;

    if (provider.type === "filter") {
      this.#filterNames.add(provider.value);

      provider.addEventListener(
        "filter-item",
        (filterItemEvent) => {
          this.#setProvider(this.#filterItems, provider);
          this.#filterItems.get(provider)?.push(filterItemEvent as FilterItem);
          this.#requestUpdate();
        },
        { signal }
      );

      // Determines when to show/hide filters based on the event in the providers
      provider.addEventListener(
        "show",
        () => {
          this.#filters.add(provider);
          this.#requestUpdate();
        },
        { signal }
      );

      provider.addEventListener(
        "fetch-data",
        async (event) => {
          const timeout = new Promise((resolve) =>
            setTimeout(resolve, this.#fetchDataTimeout)
          );
          const fetchDataEvent = event as FetchDataEvent;

          this.#fetchingResults = Promise.race([
            Promise.all([this.#fetchingResults, fetchDataEvent.fetchPromise]),
            timeout
          ]);

          const currentPromise = this.#fetchingResults;

          try {
            await currentPromise;
          } catch (error) {
            // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
            if (error.name !== "AbortError") {
              this.#fetchingResults = false;
              throw error;
            }
          }

          // If the Promise hasn't changed, we're at the last resolution
          if (currentPromise === this.#fetchingResults) {
            this.#fetchingResults = false;
            this.#requestUpdate();

            this.updateVisibility();
          }
        },
        { signal }
      );
    } else {
      provider.addEventListener("fetch-data", async (event) => {
        const fetchDataEvent = event as FetchDataEvent;
        // Indicate that we will clear the search items ourselves once we resolve the promise
        this.#searchItemsMarkedForClearing.delete(provider);

        // Wait until the data is fetched
        await fetchDataEvent.fetchPromise;

        this.#searchItems.set(
          provider,
          this.#searchItemsFetchBuffer.get(provider) || []
        );
        this.#searchItemsFetchBuffer.delete(provider);
        this.#requestUpdate();
      });
      provider.addEventListener(
        "search-item",
        (searchItemEvent) => {
          this.#setProvider(this.#searchItems, provider);
          if (this.#searchItemsFetchBuffer.has(provider)) {
            this.#searchItemsFetchBuffer
              .get(provider)
              ?.push(searchItemEvent as SearchItem);
          } else {
            if (this.#searchItemsMarkedForClearing.has(provider)) {
              this.#searchItems.set(provider, []);
              this.#searchItemsMarkedForClearing.delete(provider);
            }

            this.#searchItems
              .get(provider)
              ?.push(searchItemEvent as SearchItem);
            this.#requestUpdate();
          }
        },
        { signal }
      );
    }
  }

  disconnectedCallback() {
    this.#abortController?.abort();
  }

  comboboxCommit(event: Event) {
    const selectedItem = event.target as HTMLLIElement;
    const selectedItemType = selectedItem?.getAttribute("data-type");
    const selectedItemValue = selectedItem?.getAttribute("data-value") || "";
    const replaceQueryWith =
      selectedItem?.getAttribute("data-replace-query-with") || "";
    const moveCaretTo =
      parseInt(selectedItem?.getAttribute("data-move-caret-to") || "0") || 0;
    let elements: QueryElement[] | undefined = this.parseInputValue();

    if (selectedItemType === "url-result") {
      // these are handled by having a link that the user clicks and the navigation happens without javascript intervention
      // keyboard navigation to links is handled in inputKeydown
    } else if (selectedItemType === "filter-result") {
      // if a filter is chosen, replace the last query element with a new Filter Element
      elements.pop();
      elements.push({
        type: "filter",
        filter: selectedItemValue,
        value: ""
      });
    } else if (selectedItemType === "command-result") {
      const customEventName =
        selectedItem.getAttribute("data-command-name") || "";
      const data = JSON.parse(
        selectedItem.getAttribute("data-command-payload") || "{}"
      );
      this.dispatchEvent(new CustomEvent(customEventName, { detail: data }));
    } else if (selectedItemType === "query-result") {
      // For manually replacing the query from the suggestion, directly manipulate
      // the query/caret position
      if (replaceQueryWith) {
        this.input.value = replaceQueryWith;
        this.input.focus();

        // Unsetting the elements forces `parseQuery` to re-parse from the input string
        elements = undefined;
      } else {
        const newElements = this.parser.flatten(
          this.parser.parse(selectedItemValue, 0)
        );
        elements.push(...newElements);
        elements.push({ type: "text", value: "" });
      }
    } else if (selectedItemType === "filter-item") {
      // If we manually updated the query, we must also manually update the caret position
      if (replaceQueryWith) {
        this.input.value = replaceQueryWith;
        this.input.focus();

        // Unsetting the elements forces `parseQuery` to re-parse from the input string
        elements = undefined;
      } else {
        this.addSelectedItemToFilter(selectedItemValue, elements);
      }
    }
    this.parseQuery(elements);

    // If we manually updated the query, we must also manually update the caret position
    if (replaceQueryWith) {
      const pos = moveCaretTo === -1 ? this.input.value.length : moveCaretTo;
      this.input.setSelectionRange(pos, pos);
    }
    this.input.removeAttribute("aria-activedescendant");
  }

  addSelectedItemToFilter(selectedItemValue: string, elements: QueryElement[]) {
    const valueContainsSpaces = /\s/.test(selectedItemValue);
    const filter = elements.pop();
    if (filter?.type === "filter") {
      // If the filter already has a value and is separated by a comma, instead of a full replace
      // we want to append.
      // is:pub -> is:public
      // is:public,pri -> is:public,private
      const filterValues = filter.value.split(",");
      filterValues.pop();
      filterValues.push(
        valueContainsSpaces ? `"${selectedItemValue}"` : selectedItemValue
      );

      elements.push({
        type: "filter",
        filter: filter?.filter,
        value: filterValues.join(",")
      });
      elements.push({ type: "text", value: "" });
    } else if (filter) {
      elements.push(filter);
    }
  }

  async inputChange() {
    await this.parseQuery();
  }

  inputBlur() {
    if (this.#interactingWithList) {
      this.#interactingWithList = false;
      return;
    }
    this.styledInput.classList.remove(this.#focusClass);
    this.input.removeAttribute("aria-activedescendant");
    this.hide();
  }

  resultsMousedown() {
    this.#interactingWithList = true;
  }

  async inputFocus() {
    this.styledInput.classList.add(this.#focusClass);
    this.readyForRequestProviders();
    this.#combobox!.start();
    const initialValue = this.input.value;

    // Don't needlessly reparse the query on focus
    if (!this.lastParsedQuery || this.lastParsedQuery !== this.input.value) {
      await this.parseQuery();
    }

    if (this.closed && this.input.value === initialValue) {
      this.input.setSelectionRange(0, this.input.value.length);
    }
    this.input.focus();
  }

  moveCaretToEndOfInput() {
    this.input.setSelectionRange(
      this.input.value.length,
      this.input.value.length
    );
  }

  hasFocus() {
    return this.styledInput.classList.contains(this.#focusClass);
  }

  inputKeydown(event: KeyboardEvent) {
    // eslint-disable-next-line no-restricted-syntax
    const key = event.key;

    if (key === "Escape") {
      this.hide();
    } else if (key === "Enter") {
      const selected = this.resultsList.querySelector<HTMLElement>(
        '[aria-selected="true"], [data-combobox-option-default="true"]'
      );
      if (!selected || selected.getAttribute("aria-disabled") === "true")
        return;
      const link = selected.querySelector("a");
      if (link) {
        // eslint-disable-next-line no-restricted-syntax
        const openInNewWindow = event.ctrlKey || event.metaKey;
        if (openInNewWindow) {
          window.open(link.getAttribute("href") || "", "_blank");
        } else {
          link.click();
        }
      }
    }
  }

  inputSubmit(): void {
    this.hide();
  }

  clearButtonFocus(event: FocusEvent) {
    const previousFocusTarget = event.relatedTarget;
    if (!previousFocusTarget) return;

    // If we were previously focused on the input, we should continue to show the results list
    if (previousFocusTarget === this.input) this.show();
  }

  clearButtonBlur() {
    this.hide();
  }

  toggleClearButtonVisibility() {
    if (!this.clearButton) return;

    if (this.input.value !== "") {
      if (this.clearButton.hidden === false) return;

      this.clearButton.hidden = false;
    } else {
      this.clearButton.hidden = true;
    }
  }

  updateVisibility() {
    if (!this.hasFocus()) {
      return;
    }

    if (
      this.#filterItems.size > 0 ||
      this.#searchItems.size > 0 ||
      this.#filters.size > 0
    ) {
      this.show();
    } else if (!this.#fetchingResults) {
      this.hide();
    }
  }

  #setProvider = (
    map: Map<Provider, SearchItem[] | FilterItem[]>,
    provider: Provider
  ) => {
    if (!map.has(provider)) {
      map.set(provider, []);
    }
  };

  #updateRequested = false;

  #requestUpdate() {
    if (this.#updateRequested) return;

    this.#updateRequested = true;
    this.toggleClearButtonVisibility();
    this.#updateRequested = false;
    this.#updateResults();
  }

  #renderFilters() {
    if (this.#filters.size === 0) return;

    return html`<li role="presentation" class="ActionList-sectionDivider">
      <h3
        role="presentation"
        class="ActionList-sectionDivider-title p-2 text-left"
        aria-hidden="true"
      >
        Suggested filters
      </h3>
      <ul role="presentation">
        ${[...this.#filters]
          .sort(sortByPriority)
          .map((filter) => this.#renderFilter(filter))}
      </ul>
    </li>`;
  }

  #renderGroup(provider: Provider, shouldRenderFallbackItems = false) {
    let items: TemplateResult[] = [];
    const lastItem = this.parseInputValue().at(-1)!;

    if (provider.type === "filter") {
      if (provider.manuallyDetermineFilterEligibility) {
        items =
          this.#filterItems
            .get(provider)
            ?.sort(sortByPriority)
            .map((item) => this.#renderFilterItem(item)) || [];
      } else if (lastItem?.type === "filter") {
        items =
          this.#filterItems
            .get(provider)
            ?.filter((item) => item.filter === lastItem.filter)
            .sort(sortByPriority)
            .map((item) => this.#renderFilterItem(item)) || [];
      }
    } else {
      const searchItems = this.#searchItems.get(provider) || [];

      items = [...searchItems]
        .filter((s) => s.isFallbackSuggestion === shouldRenderFallbackItems)
        .sort(sortByPriority)
        .map((p) => this.#renderSearchItem(p));
    }

    if (!items.length) return undefined;

    if (provider.name === "") {
      return html`<li role="presentation" class="ActionList-sectionDivider">
        <ul role="presentation">
          ${items}
        </ul>
      </li>`;
    } else {
      return html`<li role="presentation" class="ActionList-sectionDivider">
        <h3
          role="presentation"
          class="ActionList-sectionDivider-title QueryBuilder-sectionTitle p-2 text-left"
          aria-hidden="true"
        >
          ${provider.name}
        </h3>
        <ul role="presentation">
          ${items}
        </ul>
      </li>`;
    }
  }

  #updateResults() {
    let groupsAsHtml = Object.values(this.#providers)
      .sort((a, b) => a.priority - b.priority)
      .map((p) => this.#renderGroup(p))
      .filter((p) => p !== undefined);

    // If no suggestions are sent back from any provider, we want to show the fallback suggestion
    if (!this.#fetchingResults && groupsAsHtml.length === 0) {
      groupsAsHtml = Object.values(this.#providers)
        .sort((a, b) => a.priority - b.priority)
        .map((p) => this.#renderGroup(p, true))
        .filter((p) => p !== undefined);
    }

    const filtersAsHtml = this.#renderFilters();
    if (filtersAsHtml) groupsAsHtml.push(filtersAsHtml);

    if (groupsAsHtml.length === 0) {
      if (this.#fetchingResults) {
        // TODO Add a loading state
        // render(html`Loading...`, this.resultsList)
      } else {
        // Clear the list HTML first, otherwise the empty string will be appended to what exists
        this.resultsList.textContent = "";
        render(html``, this.resultsList);
      }
    } else {
      render(
        html`${groupsAsHtml.map((groupHtml, index) =>
          index === groupsAsHtml.length - 1
            ? groupHtml
            : html`${groupHtml}
                <li aria-hidden="true" class="ActionList-sectionDivider"></li>`
        )}`,
        this.resultsList
      );
    }

    const numberOfResults =
      this.resultsList.querySelectorAll('[role="option"]').length;
    let screenReaderText: string;

    const resultText =
      numberOfResults === 1 ? this.i18n.suggestion : this.i18n.suggestions;
    screenReaderText = `${numberOfResults} ${resultText}.`;

    if (this.#isCleared) {
      screenReaderText = `${this.i18n.clear_search} ${screenReaderText}`;
      this.#isCleared = false;
    }

    /** This is a hack due to the way the aria live API works.
        A screen reader will not read a live region again
        if the text is the same. Adding a space character tells
        the browser that the live region has updated,
        which will cause it to read again, but with no audible difference. */
    if (this.screenReaderFeedback.textContent === screenReaderText) {
      screenReaderText += "\u00A0";
    }
    // Adds a delay so that focus moving back to the input is read before the amount of suggestions.
    setTimeout(
      () => this.updateScreenReaderFeedback(screenReaderText),
      this.#SCREEN_READER_DELAY
    );
  }

  #normalizeValue(value: string) {
    if (!value) return;

    return value.replace(/\s/g, "-").toLowerCase();
  }

  getLeadingVisual(icon: Icon, avatar?: Avatar) {
    if (avatar) {
      const classes =
        avatar.type === "org"
          ? "avatar avatar-1 avatar-small"
          : "avatar avatar-1 avatar-small circle";
      return html`<img
        src="${avatar.url}"
        alt=""
        role="presentation"
        class="${classes}"
      />`;
    }

    if (icon && isCustomIcon(icon)) {
      return html([icon.html] as unknown as TemplateStringsArray);
    }

    const iconElement = document.getElementById(
      `${icon}-icon`
    ) as HTMLTemplateElement;
    return html([iconElement?.innerHTML] as unknown as TemplateStringsArray);
  }

  // Item that will take you somewhere when chosen (i.e. a link to a repository or a search result)
  #renderSearchItem({
    value,
    prefixText,
    prefixColor,
    target: provider,
    action,
    description,
    icon,
    scope
  }: SearchItem) {
    if ("url" in action) {
      const ariaLabelAction =
        scope === "GENERAL"
          ? `${SearchScopeText[scope]}`
          : `jump to this ${(provider as SearchProvider).singularItemName}`;
      const ariaLabelDescription = description ? `, ${description}` : "";
      const ariaLabel = `${
        prefixText ? `${prefixText} ` : ""
      }${value}${ariaLabelDescription}, ${ariaLabelAction}`;

      let prefixHTML = null;
      if (prefixText) {
        prefixHTML = html`
          <span>
            <div class="d-inline-flex position-relative">
              <div
                class="position-absolute rounded-1 flex-items-stretch height-full width-full"
                style="opacity: 0.1; background-color: var(${prefixColor})"
              ></div>
              <div class="px-1" style="color: var(${prefixColor})">
                ${prefixText}
              </div>
            </div>
            ${this.#styleResults(value)}
          </span>
        `;
      }

      return html`<li
        role="option"
        class="ActionListItem"
        data-type="url-result"
        id="${this.#uniqueId || "search-item"}-result-${this.#normalizeValue(
          value
        )}"
        data-value="${value}"
        aria-label="${ariaLabel}"
      >
        <a
          href="${action.url}"
          data-action="click:query-builder#navigate"
          tabindex="-1"
          class="QueryBuilder-ListItem-link ActionListContent ActionListContent--visual16 QueryBuilder-ListItem"
        >
          ${icon
            ? html`<span
                id="${this.#uniqueId ||
                "search-item"}-result-${this.#normalizeValue(value)}--leading"
                class="ActionListItem-visual ActionListItem-visual--leading"
              >
                ${this.getLeadingVisual(icon)}
              </span>`
            : null}
          <span class="ActionListItem-descriptionWrap">
            <span class="ActionListItem-label text-normal">
              ${prefixHTML || this.#styleResults(value)}
            </span>
            ${description
              ? html`<span class="ActionListItem-description"
                  >${description}</span
                >`
              : null}
          </span>

          <span
            aria-hidden="true"
            class="ActionListItem-description QueryBuilder-ListItem-trailing"
            >${SearchScopeText[scope]}</span
          >
        </a>
      </li>`;
    } else if ("commandName" in action) {
      const ariaLabelAction =
        SearchScopeText[scope] || SearchScopeText["COMMAND"];
      const ariaLabelDescription = description ? `, ${description}` : "";
      const ariaLabel = `${value}${ariaLabelDescription}, ${ariaLabelAction}`;

      return html`<li
        role="option"
        class="ActionListItem"
        data-type="command-result"
        id="${this.#uniqueId || "search-item"}-result-${this.#normalizeValue(
          value
        )}"
        data-value="${value}"
        data-command-name="${action.commandName}"
        data-command-payload="${JSON.stringify(action.data)}"
        aria-label="${ariaLabel}"
      >
        <span
          class="ActionListContent ActionListContent--visual16 QueryBuilder-ListItem"
        >
          ${icon
            ? html`<span
                id="${this.#uniqueId ||
                "search-item"}-result-${this.#normalizeValue(value)}--leading"
                class="ActionListItem-visual ActionListItem-visual--leading"
              >
                ${this.getLeadingVisual(icon)}
              </span>`
            : null}
          <span class="ActionListItem-descriptionWrap">
            <span class="ActionListItem-label text-normal">
              ${this.#styleResults(value)}
            </span>
            ${description
              ? html`<span class="ActionListItem-description"
                  >${description}</span
                >`
              : null}
          </span>

          <span
            aria-hidden="true"
            class="ActionListItem-description QueryBuilder-ListItem-trailing"
            >${ariaLabelAction}</span
          >
        </span>
      </li>`;
    } else {
      let replaceQueryWith = "";
      let moveCaretTo = 0;
      if ("replaceQueryWith" in action) {
        replaceQueryWith = action.replaceQueryWith;
        moveCaretTo = action.moveCaretTo;
      }

      const scopeText =
        "query" in action ? SearchScopeText[scope] : AutocompleteText;

      return html` <li
        role="option"
        class="ActionListItem"
        data-type="query-result"
        data-value="${value}"
        aria-label="${value}${description ? `, ${description}` : ""}"
        data-replace-query-with="${replaceQueryWith}"
        data-move-caret-to="${moveCaretTo}"
        id="${this.#uniqueId || "search-item"}-result-${this.#normalizeValue(
          value
        )}"
      >
        <span
          class="ActionListContent ActionListContent--visual16 QueryBuilder-ListItem"
        >
          ${icon
            ? html`<span
                id="${this.#uniqueId ||
                "search-item"}-result-${this.#normalizeValue(value)}--leading"
                class="ActionListItem-visual ActionListItem-visual--leading"
              >
                ${this.getLeadingVisual(icon)}
              </span>`
            : null}
          <span class="ActionListItem-descriptionWrap">
            <span class="ActionListItem-label text-normal"
              >${this.#styleResults(value)}</span
            >
            ${description
              ? html`<span class="ActionListItem-description"
                  >${description}</span
                >`
              : null}
          </span>

          ${this.#searchItems.size > 0
            ? html`<span
                aria-hidden="true"
                class="ActionListItem-description QueryBuilder-ListItem-trailing"
                >${scopeText}</span
              >`
            : html``}
        </span>
      </li>`;
    }
  }

  #styleResults(query: string) {
    const inputArray = this.parser.flatten(this.parser.parse(query, 0));
    const shouldAddTrailingSpace = !this.#usingCustomParser;

    const out: TemplateResult[] = [];
    for (const group of inputArray) {
      if (group.type === "filter") {
        out.push(
          html`<span>${group.filter}:</span
            ><span data-type="filter-value"
              >${group.value}${shouldAddTrailingSpace ? " " : ""}</span
            >`
        );
      } else {
        let style = "";
        if (group.style === TextElementStyle.Constant) {
          style = "qb-constant";
        } else if (group.style === TextElementStyle.Entity) {
          style = "qb-entity";
        } else if (group.style === TextElementStyle.FilterValue) {
          style = "qb-filter-value";
        }
        out.push(
          html`<span class="${style}"
            >${group.value}${shouldAddTrailingSpace ? " " : ""}</span
          >`
        );
      }
    }

    return out;
  }

  // Keeping these as separate templates in order to
  // make it easier in the future if these need to diverge more.
  // Renders a filter item (i.e. 'repo' or 'project')
  #renderFilter({
    singularItemName,
    icon,
    description,
    value
  }: FilterProvider) {
    const ariaLabelDescription = description ? `, ${description}` : "";
    const ariaLabel = `${
      this.renderSingularItemNames ? singularItemName : value
    }${ariaLabelDescription}`;

    return html` <li
      role="option"
      class="ActionListItem"
      data-type="filter-result"
      data-value="${value}"
      id="${this.#uniqueId || "filter"}-result-${this.#normalizeValue(value)}"
      aria-label="${ariaLabel}, filter"
    >
      <span
        class="ActionListContent ActionListContent--visual16 QueryBuilder-ListItem"
      >
        ${icon
          ? html`<span
              id="${this.#uniqueId || "filter"}-result-${this.#normalizeValue(
                value
              )}--leading"
              class="ActionListItem-visual ActionListItem-visual--leading"
            >
              ${this.getLeadingVisual(icon)}
            </span>`
          : null}
        <span class="ActionListItem-descriptionWrap">
          <span class="ActionListItem-label text-normal">
            ${this.renderSingularItemNames ? singularItemName : `${value}:`}
          </span>
          ${description
            ? html`<span class="ActionListItem-description"
                >${description}</span
              >`
            : null}
        </span>

        ${this.#searchItems.size > 0
          ? html`<span
              aria-hidden="true"
              class="ActionListItem-description QueryBuilder-ListItem-trailing"
              >${AutocompleteText}</span
            >`
          : html``}
      </span>
    </li>`;
  }

  // Renders a filter value that is appended to the input (i.e. 'github/github')
  #renderFilterItem({
    name,
    value,
    target: provider,
    icon,
    avatar,
    description,
    inlineDescription,
    action
  }: FilterItem) {
    const valueToShow = name && name.length > 0 ? name : value;
    const ariaLabelDescription = description ? `, ${description}` : "";
    const ariaLabel = (provider as Provider).singularItemName
      ? `${valueToShow}${ariaLabelDescription}, autocomplete this ${
          (provider as Provider).singularItemName
        }`
      : `${valueToShow}${ariaLabelDescription}, ${(provider as Provider).name}`;

    let replaceQueryWith = "";
    let moveCaretTo = 0;
    if (action && "replaceQueryWith" in action) {
      replaceQueryWith = action.replaceQueryWith;
      moveCaretTo = action.moveCaretTo;
    }

    return html` <li
      role="option"
      class="ActionListItem"
      data-type="filter-item"
      data-replace-query-with="${replaceQueryWith}"
      data-move-caret-to="${moveCaretTo}"
      data-value="${value}"
      id="${this.#uniqueId || "filter-item"}-result-${this.#normalizeValue(
        value
      )}"
      aria-label="${ariaLabel}"
    >
      <span
        class="ActionListContent ActionListContent--visual16 QueryBuilder-ListItem"
      >
        ${icon
          ? html`<span
              id="${this.#uniqueId ||
              "filter-item"}-result-${this.#normalizeValue(value)}--leading"
              class="ActionListItem-visual ActionListItem-visual--leading"
            >
              ${this.getLeadingVisual(icon, avatar)}
            </span>`
          : null}
        <span
          class="${inlineDescription
            ? "ActionListItem-descriptionWrap-inline"
            : "ActionListItem-descriptionWrap"}"
        >
          <span class="ActionListItem-label text-normal">${valueToShow}</span>
          ${description
            ? html`<span class="ActionListItem-description"
                >${description}</span
              >`
            : null}
        </span>

        ${this.#searchItems.size > 0
          ? html`<span
              aria-hidden="true"
              class="ActionListItem-description QueryBuilder-ListItem-trailing"
              >${AutocompleteText}</span
            >`
          : html``}
      </span>
    </li>`;
  }

  /*
   * The updateScreenReaderFeedback function is used to update the screen reader feedback.
   * It dispatchs a custom event so any addEventListener with the same key will be able to
   * update the screen reader feedback with a new i18n text.
   */
  updateScreenReaderFeedback(inputString: string): void {
    const event = new FeedbackEvent("NEW_RESULTS", inputString, {});
    this.dispatchEvent(event);
    this.screenReaderFeedback.textContent = event.text;
  }

  async clear() {
    await this.parseQuery([]);
    this.#isCleared = true;
  }

  async parseQuery(elements?: QueryElement[], focusOnInput = true) {
    this.#parseAbortController?.abort();
    const { signal } = (this.#parseAbortController = new AbortController());

    if (!elements) {
      elements = this.parseInputValue();
    } else {
      const newInputValue = elements
        .map((item) => {
          if (item.type === "filter") return `${item.filter}:${item.value}`;
          return item.value;
        })
        // Don't assume separator if a custom parser is specified
        .join(this.#usingCustomParser ? "" : " ");

      // When using in react, we need to update the prototype value so the dispatched `change` event does not get
      // discarded
      const prototypeValueSetter = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(this.input),
        "value"
      )?.set;

      if (prototypeValueSetter) {
        prototypeValueSetter?.call(this.input, newInputValue);
      } else {
        this.input.value = newInputValue;
      }

      this.input.dispatchEvent(new Event("change", { bubbles: true }));
    }

    this.lastParsedQuery = this.input.value;

    await new Promise((resolve) => requestAnimationFrame(resolve));

    if (signal.aborted) return;
    this.styleInputText(elements);
    if (focusOnInput) this.input.focus();

    await new Promise((resolve) => setTimeout(resolve, 100));
    if (signal.aborted) return;

    for (const provider of this.#searchItems.keys()) {
      this.#searchItemsMarkedForClearing.add(provider);
    }

    this.#filterItems.clear();
    this.#filters.clear();

    const event = new QueryEvent(
      elements,
      this.input.value,
      this.parsedMetadata
    );
    this.dispatchEvent(event);

    // The sync effects of the QueryEvent should all have triggered by now,
    // meaning that any providers which did not clear their own search items
    // (or indicate they were fetching data) should have their data cleared for
    // them.
    let shouldRequestUpdate = false;
    for (const provider of this.#searchItemsMarkedForClearing.keys()) {
      this.#searchItems.delete(provider);
      this.#searchItemsMarkedForClearing.delete(provider);
      shouldRequestUpdate = true;
    }
    if (shouldRequestUpdate) {
      this.#requestUpdate();
    }

    this.updateVisibility();
  }

  // Parses the input value
  #defaultParser(inputValue: string): QueryElement[] {
    const cachedElements = this.#inputCache.get(inputValue);
    if (cachedElements) {
      return cachedElements.slice();
    } else {
      const elements: QueryElement[] = [];
      const queries = inputValue.split(/\s(?=(?:[^"]*"[^"]*")*[^"]*$)/g);
      for (const query of queries) {
        const filterKeyIndex = query.indexOf(this.filterKey);

        if (filterKeyIndex > 0) {
          const filter = query.substring(0, filterKeyIndex);
          const value = query.substring(filterKeyIndex + 1);
          elements.push(
            this.#filterNames.has(filter)
              ? { type: "filter", filter, value }
              : { type: "text", value: query }
          );
        } else {
          elements.push({ type: "text", value: query });
        }
      }
      this.#inputCache.set(inputValue, [...elements]);
      return elements;
    }
  }

  styleInputText(elements: QueryElement[]) {
    this.#setSizer(this.input.value);
    const fragment = document.createDocumentFragment();
    for (const element of elements) {
      const queryItem = document.createElement("span");
      const trailingSpaceElement = document.createElement("span");
      trailingSpaceElement.textContent = " ";

      // If the user overrides the parser, make no assumption about leading or trailing spaces
      const shouldAddTrailingSpace = !this.#usingCustomParser;

      if (element.type === "filter") {
        const { filter, value } = element;
        const filterItem = document.createElement("span");

        queryItem.setAttribute("data-type", "filter-expression");
        filterItem.setAttribute("data-type", "filter");
        filterItem.textContent = filter;

        const filterKey = document.createElement("span");
        filterKey.textContent = this.filterKey;

        const filterValue = document.createElement("span");
        filterValue.setAttribute("data-type", "filter-value");
        filterValue.textContent = value;

        queryItem.appendChild(filterItem);
        queryItem.appendChild(filterKey);
        queryItem.appendChild(filterValue);

        // Adds the trailing space as a separate element so it isn't included in the styling for the filter value
        if (shouldAddTrailingSpace) queryItem.appendChild(trailingSpaceElement);
      } else {
        if (shouldAddTrailingSpace) {
          queryItem.textContent = `${element.value} `;
        } else {
          queryItem.textContent = element.value;
        }

        if (element.style === TextElementStyle.Constant) {
          queryItem.classList.add("qb-constant");
        } else if (element.style === TextElementStyle.Entity) {
          queryItem.classList.add("qb-entity");
        } else if (element.style === TextElementStyle.FilterValue) {
          queryItem.classList.add("qb-filter-value");
        }
      }

      fragment.append(queryItem);
      this.#resizeInput();
    }
    this.styledInputContent.replaceChildren(fragment);
  }

  // Gets the width of the input text to help set the visually styled input
  #setSizer(value: string) {
    this.sizer.textContent = "";

    if (
      this.input.selectionStart !== null &&
      this.input.selectionStart === this.input.selectionEnd
    ) {
      // insert an element where the cursor should be so we can find it
      const index = this.input.selectionStart;
      const cursor = document.createElement("span");

      this.sizer.append(
        value.substring(0, index),
        cursor,
        value.substring(index)
      );
    } else {
      this.sizer.textContent = value;
    }
  }

  // Determines the size of the input for styling purposes
  #resizeInput() {
    const minWidth = 300;
    requestAnimationFrame(() => {
      const cursor = this.sizer.querySelector("span");

      if (cursor) {
        // make sure the cursor is visible
        if (cursor.offsetLeft < this.styledInputContainer.scrollLeft) {
          this.styledInputContainer.scrollLeft = cursor.offsetLeft - minWidth;
        } else if (
          cursor.offsetLeft >
          this.styledInputContainer.scrollLeft +
            this.styledInputContainer.clientWidth
        ) {
          this.styledInputContainer.scrollLeft =
            cursor.offsetLeft -
            this.styledInputContainer.clientWidth +
            minWidth;
        }
      }

      const currentSizerScrollWidth = this.sizer.scrollWidth;
      const newInputWidth = Math.max(
        currentSizerScrollWidth + 2,
        this.input.value === "" ? 2 : 0,
        minWidth
      );

      this.input.style.width = `${newInputWidth}px`;
    });
  }

  #providerCount(): number {
    return Object.keys(this.#providers).length;
  }
}
export * from "./query-builder-api";
