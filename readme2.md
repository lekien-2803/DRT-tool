```javascript
(function() {
  'use strict';
  
  // ==================== CONSTANTS ====================
  const CONFIG = {
    TIMER_DURATION: 90, // seconds
    KPI_RATE: 1.5, // minutes per pair
    WORK_START_HOUR: 7,
    LUNCH_START_HOUR: 12,
    LUNCH_END_HOUR: 13,
    WORK_HOURS: 8,
    UPDATE_INTERVAL: 60000, // 1 minute
    CONTAINER_ID: 'neo',
    FONT_URL: 'https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap'
  };

  const SELECTORS = {
    decisionInput: '.BaseBox-sc-16uwbyc-0.TextInput__StyledInput-sc-1clzs2v-1.gWxvUi',
    submitButton: 'button[data-hb-id="enterprise-button"]',
    checkbox: 'input[type="checkbox"]',
    wrongDataInput: 'input[placeholder="Which data is wrong for those SKUs?"]',
    mpdLink: 'a'
  };

  // ==================== UTILITY FUNCTIONS ====================
  const Utils = {
    loadFont(url) {
      const link = document.createElement('link');
      link.href = url;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    },

    applyStyles(element, styles) {
      Object.assign(element.style, styles);
    },

    createElement(tag, styles = {}, attributes = {}) {
      const element = document.createElement(tag);
      this.applyStyles(element, styles);
      Object.entries(attributes).forEach(([key, value]) => {
        element[key] = value;
      });
      return element;
    },

    formatTime(seconds) {
      const m = Math.floor(seconds / 60);
      const s = (seconds % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    },

    hashObject(obj) {
      return JSON.stringify(obj);
    }
  };

  // ==================== LOCAL STORAGE MANAGER ====================
  const Storage = {
    get(key, defaultValue = 0) {
      try {
        const value = localStorage.getItem(key);
        return value ? parseInt(value, 10) : defaultValue;
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
        return defaultValue;
      }
    },

    set(key, value) {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (error) {
        console.error(`Error writing localStorage key "${key}":`, error);
        return false;
      }
    },

    remove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error(`Error removing localStorage key "${key}":`, error);
        return false;
      }
    }
  };

  // ==================== DEFAULT CONFIG ====================
  const defaultNoMatchConfig = [
    {
      label: "Diff Design",
      value: "Different products/different product type",
      sub: ["Different Design", "Different Product"]
    },
    {
      label: "Vary DSQ",
      value: "Products vary by DSQ/number of pieces included but cannot join on DSQ/number of pieces included",
      sub: ["Different number of pieces included", "Different Set", "Different DSQ"]
    },
    {
      label: "Vary Material",
      value: "Products vary by material but cannot join by material",
      sub: ["Different Material"]
    },
    {
      label: "Vary Size/Cap",
      value: "Products vary by size/capacity but cannot join by size/capacity",
      sub: ["Different Size", "Different Capacity"]
    },
    {
      label: "Vary Pattern",
      value: "Products vary by pattern but cannot join by pattern",
      sub: ["Different Pattern"]
    },
    {
      label: "Vary Graphic",
      value: "Products vary by graphic/subject but cannot join on graphic/subject",
      sub: ["Different Graphic", "Different Subject"]
    },
    {
      label: "Vary Color",
      value: "Products vary by color/finish but cannot join by color/finish",
      sub: ["Different Color", "Different Finish"]
    },
    {
      label: "Not Enough",
      value: "Not enough information to make decision (missing imagery/product information)",
      sub: ["Sku is missing size information"]
    },
    {
      label: "Kit/Composite",
      value: "SKU is a Kit/Composite",
      sub: ["Sku is a Child SKU", "Sku is a Composite SKU"]
    },
    {
      label: "Customize Option",
      value: "SKU has a Customize Option",
      sub: ["SKU has an Option with the value Customize: Yes", 
            "Both SKUs have an Option with the value Customize: Yes"]
    },
    {
      label: "One-of-a-kind",
      value: "Products vary but option grouping is not allowed for the class"
    },
    {
      label: "Other",
      value: "Products vary by other categories which do not allow grouping",
      sub: [
        "Different Sport Team",
        "Different Orientation",
        "Different MOQ, MMOQ", 
        "Different Brand Catalog (US/UK)"
      ]
    },
    {
      label: "More than",
      value: "Products vary by more than one category that does not allow grouping",
      sub: [
        "Different Pattern", "Different Border",
        "Different Graphic",
        "Different Color", "Different Finish",
        "Different Size", "Different Capacity",
        "Different Material",
        "Different Set", "Different number of pieces included", "Different DSQ"
      ],
      allowMulti: true
    }
  ];

  // ==================== STYLE SETTINGS ====================
  const styleSettings = {
    container: {
      backgroundColor: '#f4f4f5',
      borderRadius: '10px',
      fontFamily: 'Lexend, sans-serif',
      boxShadow: '0 0 10px rgba(255,255,255,0.2)',
      padding: '10px',
      maxWidth: '300px',
      maxHeight: '80vh',
      overflowY: 'auto',
      color: '#333',
      border: '1px solid #d9d9d9',
      position: 'fixed',
      top: '200px',
      left: '20px',
      zIndex: '9999',
      cursor: 'move'
    },
    buttonBase: {
      padding: '8px 12px',
      border: '1px solid #d9d9d9',
      borderRadius: '5px',
      background: '#ffffff',
      fontSize: '14px',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginBottom: '6px',
      display: 'block',
      width: '100%',
      color: '#000000'
    },
    inputField: {
      width: '100%',
      padding: '8px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '14px',
      marginBottom: '8px',
      boxSizing: 'border-box',
      outline: 'none',
      transition: 'border-color 0.3s ease'
    },
    labelStyleGroups: {
      base: {},
      mpd: { background: '#01768b', color: '#fff' },
      match: { background: '#25ac7f', color: '#fff' },
      optionVariant: { background: '#e7cf00', color: '#fff' },
      noMatch: { background: '#bd081c', color: '#fff' },
      alt: { background: '#ffcfc9', color: '#c2081c' },
      alt2: { background: '#ffe5a0', color: '#ff5a00' },
      alt21: { background: '#ffc8aa', color: '#ff5a00' },
      selected: { background: '#4CAF50', color: '#fff' },
      multiSelectControl: { background: '#2196F3', color: '#fff' },
      importBtn: { background: '#9C27B0', color: '#fff' },
      badImagery: { background: '#a0a0a0', color: '#fff' },
      joinedIncorrectly: { background: '#a0a0a0', color: '#fff' }
    },
    labelStyleMap: {
      MPD: 'mpd',
      IAT: 'mpd',
      Exact: 'match',
      "Option Variant": 'optionVariant',
      "No Match": 'noMatch',
      "Some Opt": 'alt21',
      "No Opt": 'alt2',
      "Diff Design": 'alt',
      "Vary DSQ": 'alt',
      "Vary Material": 'alt',
      "Vary Size/Cap": 'alt',
      "Vary Pattern": 'alt',
      "Vary Graphic": 'alt',
      "Customize Option": 'alt',
      "Vary Color": 'alt',
      "Not Enough": 'alt',
      "Kit/Composite": 'alt',
      "One-of-a-kind": 'alt',
      Other: 'alt',
      "More than": 'alt',
      "Bad Imagery": 'badImagery',
      "SKU Bad Imagery": 'alt',
      "Both SKUs Bad Imagery": 'alt',
      "Joined Incorrectly": 'joinedIncorrectly',
      "SKU A Design": 'alt',
      "Both SKUs Design": 'alt',
      "SKU A Option": 'alt',
      "Both SKUs Option": 'alt'
    }
  };

  // ==================== STATE MANAGER ====================
  class StateManager {
    constructor() {
      this.state = {
        count: Storage.get('punchCount', 0),
        timer: {
          duration: CONFIG.TIMER_DURATION,
          remaining: CONFIG.TIMER_DURATION,
          interval: null
        },
        config: {
          noMatch: defaultNoMatchConfig,
          className: 'Default'
        },
        ui: {
          isDragging: false,
          offsetX: 0,
          offsetY: 0
        },
        lastConfigHash: null
      };
      this.subscribers = [];
    }

    getState() {
      return this.state;
    }

    setState(updates) {
      this.state = { ...this.state, ...updates };
      this.notify();
    }

    subscribe(callback) {
      this.subscribers.push(callback);
      return () => {
        this.subscribers = this.subscribers.filter(cb => cb !== callback);
      };
    }

    notify() {
      this.subscribers.forEach(callback => callback(this.state));
    }

    updateCount(value) {
      this.state.count = value;
      Storage.set('punchCount', value);
      this.notify();
    }

    increaseCount() {
      this.updateCount(this.state.count + 1);
    }

    decreaseCount() {
      this.updateCount(Math.max(0, this.state.count - 1));
    }

    resetCount() {
      Storage.remove('punchCount');
      this.updateCount(0);
    }

    updateConfig(noMatchConfig, className) {
      this.state.config = { noMatch: noMatchConfig, className };
      this.notify();
    }
  }

  // ==================== KPI CALCULATOR ====================
  class KPICalculator {
    static calculate() {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      let workMinutes = 0;
      
      if (currentHour < CONFIG.LUNCH_START_HOUR) {
        workMinutes = (currentHour - CONFIG.WORK_START_HOUR) * 60 + currentMinute;
      } else if (currentHour >= CONFIG.LUNCH_END_HOUR) {
        workMinutes = 5 * 60 + (currentHour - CONFIG.LUNCH_END_HOUR) * 60 + currentMinute;
      } else {
        workMinutes = 5 * 60;
      }
      
      workMinutes = Math.max(0, Math.min(workMinutes, CONFIG.WORK_HOURS * 60));
      const expectedKPI = Math.floor(workMinutes / CONFIG.KPI_RATE);
      
      return { workMinutes, expectedKPI };
    }

    static formatKPIText(count) {
      const { expectedKPI } = this.calculate();
      const difference = count - expectedKPI;
      
      if (difference >= 0) {
        return `<span style="color: #4CAF50;">Vượt mục tiêu ${difference} cặp 🎯</span>`;
      } else {
        return `<span style="color: #f44336;">Còn thiếu ${Math.abs(difference)} cặp 📈</span>`;
      }
    }
  }

  // ==================== DOM HELPERS ====================
  class DOMHelper {
    static findDecisionInput() {
      return document.querySelector(SELECTORS.decisionInput);
    }

    static findCheckbox() {
      return document.querySelector(SELECTORS.checkbox);
    }

    static findWrongDataInput() {
      return document.querySelector(SELECTORS.wrongDataInput);
    }

    static setInputValue(input, value) {
      if (!input) return false;
      
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 
        "value"
      ).set;
      
      setter.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      
      return true;
    }

    static tickCheckboxAndFillInput(value) {
      const checkbox = this.findCheckbox();
      if (checkbox && !checkbox.checked) {
        checkbox.click();
      }
      
      setTimeout(() => {
        const input = this.findWrongDataInput();
        if (input) {
          this.setInputValue(input, value);
        }
      }, 100);
    }

    static scrollToBottom() {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  }

  // ==================== INPUT HELPER ====================
  class InputHelper {
    static addInteractivity(input) {
      input.addEventListener('focus', (e) => {
        e.target.style.borderColor = '#4CAF50';
        e.target.style.boxShadow = '0 0 5px rgba(76, 175, 80, 0.3)';
      });
      
      input.addEventListener('blur', (e) => {
        e.target.style.borderColor = '#ccc';
        e.target.style.boxShadow = 'none';
      });
      
      input.addEventListener('mousedown', (e) => e.stopPropagation());
      
      input.addEventListener('click', function(e) {
        e.stopPropagation();
        this.focus();
      });
      
      return input;
    }

    static createField(placeholder, className) {
      const input = Utils.createElement('input', styleSettings.inputField, {
        type: 'text',
        placeholder,
        className
      });
      
      return this.addInteractivity(input);
    }

    static addTabNavigation(inputs) {
      inputs.forEach((input, index) => {
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Tab' && !e.shiftKey && index < inputs.length - 1) {
            e.preventDefault();
            inputs[index + 1].focus();
          } else if (e.key === 'Tab' && e.shiftKey && index > 0) {
            e.preventDefault();
            inputs[index - 1].focus();
          }
        });
      });
    }
  }

  // ==================== TIMER MANAGER ====================
  class TimerManager {
    constructor(stateManager, timerElement) {
      this.stateManager = stateManager;
      this.timerElement = timerElement;
    }

    start() {
      this.stop();
      const state = this.stateManager.getState();
      state.timer.remaining = state.timer.duration;
      this.updateDisplay();
      
      state.timer.interval = setInterval(() => {
        if (state.timer.remaining > 0) {
          state.timer.remaining--;
          this.updateDisplay();
        } else {
          this.stop();
          this.timerElement.innerText = "⏱️ Hết giờ!";
        }
      }, 1000);
    }

    stop() {
      const state = this.stateManager.getState();
      if (state.timer.interval) {
        clearInterval(state.timer.interval);
        state.timer.interval = null;
      }
    }

    updateDisplay() {
      const state = this.stateManager.getState();
      this.timerElement.innerText = `⏱️ ${Utils.formatTime(state.timer.remaining)}`;
    }

    cleanup() {
      this.stop();
    }
  }

  // ==================== SUBMIT HOOK MANAGER ====================
  class SubmitHookManager {
    constructor(stateManager) {
      this.stateManager = stateManager;
      this.observer = null;
    }

    start() {
      if (this.observer) {
        this.observer.disconnect();
      }

      this.observer = new MutationObserver(() => {
        const buttons = document.querySelectorAll(
          `${SELECTORS.submitButton}:not([data-punch-hooked])`
        );
        
        buttons.forEach(btn => {
          btn.addEventListener('click', () => {
            this.stateManager.increaseCount();
          }, { once: true });
          btn.dataset.punchHooked = "true";
        });
      });

      this.observer.observe(document.body, { 
        childList: true, 
        subtree: true 
      });
    }

    cleanup() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    }
  }

  // ==================== BUTTON RENDERER ====================
  class ButtonRenderer {
    constructor(stateManager, container) {
      this.stateManager = stateManager;
      this.container = container;
    }

    getLabelStyle(label) {
      const group = styleSettings.labelStyleMap[label];
      return group ? styleSettings.labelStyleGroups[group] : styleSettings.labelStyleGroups.base;
    }

    createArrayConfig() {
      const state = this.stateManager.getState();
      return [
        { label: "MPD", type: "mpd" },
        { label: "IAT", type: "iat" },
        { label: "Exact", type: "match" },
        {
          label: "Option Variant",
          type: "parent",
          action: "variant",
          children: [
            { label: "Some Opt", value: "Option Variant (some but not all options match)" },
            { label: "No Opt", value: "Option Variant (but no options match)" }
          ]
        },
        {
          label: "No Match",
          type: "parent",
          action: "no",
          children: state.config.noMatch
        },
        {
          label: "Bad Imagery",
          type: "parent",
          action: "bad_imagery",
          children: [
            { 
              label: "SKU Bad Imagery", 
              value: "SKU {sku} has options that contain images representing different options",
              needsSKUInput: true 
            },
            { 
              label: "Both SKUs Bad Imagery", 
              value: "Both SKUs have options that contain images representing different options" 
            }
          ]
        },
        {
          label: "Joined Incorrectly",
          type: "parent",
          action: "joined_incorrectly",
          children: [
            { 
              label: "SKU A Design", 
              value: "SKU {sku} is joined incorrectly by design",
              needsSKUInput: true 
            },
            { 
              label: "Both SKUs Design", 
              value: "Both SKUs are joined incorrectly by design" 
            },
            { 
              label: "SKU A Option", 
              value: "SKU {sku} is incorrectly joined, violating the 'DO NOT JOIN BY' rule in MCJS ({option})",
              needsSKUInput: true,
              needsOptionInput: true 
            },
            { 
              label: "Both SKUs Option", 
              value: "Both SKUs are incorrectly joined, violating the 'DO NOT JOIN BY' rule in MCJS ({option})",
              needsOptionInput: true 
            }
          ]
        }
      ];
    }

    createAdvancedInputField(child, childWrapper) {
      const inputContainer = Utils.createElement('div');
      inputContainer.style.marginTop = '8px';
      inputContainer.style.marginBottom = '8px';
      
      const inputs = [];
      
      if (child.needsSKUInput) {
        const skuLabel = Utils.createElement('div', {
          fontSize: '12px',
          color: '#666',
          marginBottom: '4px'
        }, { textContent: 'Nhập SKU:' });
        inputContainer.appendChild(skuLabel);
        
        const skuField = InputHelper.createField('Nhập SKU (vd: DTOF1133)', 'sku-input');
        inputContainer.appendChild(skuField);
        inputs.push(skuField);
      }
      
      if (child.needsOptionInput) {
        const optionLabel = Utils.createElement('div', {
          fontSize: '12px',
          color: '#666',
          marginBottom: '4px',
          marginTop: '8px'
        }, { textContent: 'Nhập Option Category:' });
        inputContainer.appendChild(optionLabel);
        
        const optionField = InputHelper.createField(
          'Nhập option category (vd: Color, Size, Material)', 
          'option-input'
        );
        inputContainer.appendChild(optionField);
        inputs.push(optionField);
      }
      
      const confirmBtn = Utils.createElement('button', {
        ...styleSettings.buttonBase,
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none'
      }, { textContent: 'Confirm' });
      
      confirmBtn.addEventListener('mousedown', (e) => e.stopPropagation());
      
      confirmBtn.onclick = () => {
        let finalValue = child.value;
        let isValid = true;
        
        if (child.needsSKUInput) {
          const skuInput = inputContainer.querySelector('.sku-input');
          const skuValue = skuInput.value.trim();
          if (!skuValue) {
            alert('Please enter a SKU code');
            skuInput.focus();
            return;
          }
          finalValue = finalValue.replace('{sku}', skuValue);
        }
        
        if (child.needsOptionInput) {
          const optionInput = inputContainer.querySelector('.option-input');
          const optionValue = optionInput.value.trim();
          if (!optionValue) {
            alert('Please enter an option category');
            optionInput.focus();
            return;
          }
          finalValue = finalValue.replace('{option}', optionValue);
        }
        
        if (isValid) {
          DOMHelper.tickCheckboxAndFillInput(finalValue);
          childWrapper.style.display = "none";
          
          inputs.forEach(input => input.value = '');
          DOMHelper.scrollToBottom();
        }
      };
      
      inputContainer.appendChild(confirmBtn);
      
      if (inputs.length > 0) {
        InputHelper.addTabNavigation(inputs);
        
        const lastInput = inputs[inputs.length - 1];
        lastInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            confirmBtn.click();
          }
        });
      }
      
      return inputContainer;
    }

    createMultiSelectControls(child, subWrapper, item, childWrapper) {
      let selectedItems = [];
      
      const controlRow = Utils.createElement('div', {
        display: 'flex',
        gap: '4px',
        marginBottom: '8px'
      });
      
      const confirmBtn = Utils.createElement('button', {
        ...styleSettings.buttonBase,
        ...styleSettings.labelStyleGroups.multiSelectControl,
        flex: '1',
        fontSize: '12px'
      }, { 
        textContent: '✓ Confirm',
        className: 'control-btn'
      });
      
      confirmBtn.onclick = () => {
        if (selectedItems.length > 0) {
          const target = document.querySelector(`.DuplicatesReviewDecision-option-button--${item.action}`);
          if (target) target.click();
          
          const input = DOMHelper.findDecisionInput();
          if (input) {
            DOMHelper.setInputValue(input, `${child.value}: ${selectedItems.join(', ')}`);
          }
          
          subWrapper.style.display = "none";
          childWrapper.style.display = "none";
          selectedItems = [];
          DOMHelper.scrollToBottom();
        }
      };
      
      const clearBtn = Utils.createElement('button', {
        ...styleSettings.buttonBase,
        ...styleSettings.labelStyleGroups.alt,
        flex: '1',
        fontSize: '12px'
      }, { 
        textContent: '✗ Clear',
        className: 'control-btn'
      });
      
      clearBtn.onclick = () => {
        selectedItems = [];
        subWrapper.querySelectorAll('button:not(.control-btn)').forEach(btn => {
          Utils.applyStyles(btn, {
            ...styleSettings.buttonBase,
            ...styleSettings.labelStyleGroups.alt
          });
        });
      };
      
      controlRow.appendChild(confirmBtn);
      controlRow.appendChild(clearBtn);
      
      return { controlRow, selectedItems };
    }

    handleMPDIATClick(type, timerManager) {
      timerManager.start();
      const link = Array.from(document.querySelectorAll(SELECTORS.mpdLink))
        .find(a => a.textContent.includes("Manage Product Descriptions"));
      
      if (link) {
        const url = new URL(link.href);
        const skus = url.searchParams.get("skus");
        if (skus) {
          const targetUrl = type === "mpd"
            ? `https://partners.wayfair.com/v/product_catalog/manage_product_description/index?page_number=1&skus=${skus}`
            : `https://partners.wayfair.com/v/catalog/media/admin/image_association/load_skus?sku_list=${skus}`;
          window.open(targetUrl, "_blank");
        }
      }
    }

    handleMatchClick() {
      const input = DOMHelper.findDecisionInput();
      if (input) {
        DOMHelper.setInputValue(input, "");
      }
      
      const matchBtn = document.querySelector('.DuplicatesReviewDecision-option-button--match');
      if (matchBtn) {
        matchBtn.click();
        DOMHelper.scrollToBottom();
      }
    }

    render(timerManager) {
      const state = this.stateManager.getState();
      const configHash = Utils.hashObject(state.config.noMatch);
      
      if (configHash === state.lastConfigHash) {
        return;
      }
      
      state.lastConfigHash = configHash;
      this.container.innerHTML = '';
      
      const arr = this.createArrayConfig();
      
      arr.forEach((item) => {
        if (item.type === "parent") {
          this.renderParentButton(item, timerManager);
        } else {
          this.renderSimpleButton(item, timerManager);
        }
      });
    }

    renderParentButton(item, timerManager) {
      const parentBtn = Utils.createElement('button', {
        ...styleSettings.buttonBase,
        ...this.getLabelStyle(item.label)
      }, { textContent: item.label });
      
      this.container.appendChild(parentBtn);

      const childWrapper = Utils.createElement('div', {
        display: 'none',
        marginLeft: '10px'
      });
      this.container.appendChild(childWrapper);

      item.children.forEach(child => {
        const childBtn = Utils.createElement('button', {
          ...styleSettings.buttonBase,
          ...this.getLabelStyle(child.label)
        }, { textContent: child.label });
        
        childWrapper.appendChild(childBtn);

        const subWrapper = Utils.createElement('div', {
          display: 'none',
          maxHeight: '200px',
          overflowY: 'auto',
          marginLeft: '10px',
          border: '1px solid #ddd',
          borderRadius: '5px',
          padding: '5px',
          backgroundColor: '#fafafa'
        });
        childWrapper.appendChild(subWrapper);

        if (item.action === "bad_imagery" || item.action === "joined_incorrectly") {
          this.handleAdvancedChild(child, childBtn, subWrapper, childWrapper);
        } else if (child.sub) {
          this.handleSubChild(child, childBtn, subWrapper, childWrapper, item);
        } else {
          this.handleSimpleChild(child, childBtn, childWrapper, item);
        }
      });

      parentBtn.onclick = () => {
        childWrapper.style.display = childWrapper.style.display === "none" ? "block" : "none";
      };
    }

    handleAdvancedChild(child, childBtn, subWrapper, childWrapper) {
      childBtn.onclick = () => {
        if (child.needsSKUInput || child.needsOptionInput) {
          if (subWrapper.style.display === "none") {
            subWrapper.innerHTML = '';
            const inputContainer = this.createAdvancedInputField(child, childWrapper);
            subWrapper.appendChild(inputContainer);
            subWrapper.style.display = "block";
            
            setTimeout(() => {
              const firstInput = inputContainer.querySelector('input');
              if (firstInput) firstInput.focus();
            }, 100);
          } else {
            subWrapper.style.display = "none";
            subWrapper.innerHTML = '';
          }
        } else {
          DOMHelper.tickCheckboxAndFillInput(child.value);
          childWrapper.style.display = "none";
          DOMHelper.scrollToBottom();
        }
      };
    }

    handleSubChild(child, childBtn, subWrapper, childWrapper, item) {
      let selectedItemsRef = [];

      childBtn.onclick = () => {
        subWrapper.style.display = subWrapper.style.display === "none" ? "block" : "none";

        if (subWrapper.style.display === "block") {
          selectedItemsRef = [];
          subWrapper.querySelectorAll('button:not(.control-btn)').forEach(btn => {
            Utils.applyStyles(btn, {
              ...styleSettings.buttonBase,
              ...styleSettings.labelStyleGroups.alt
            });
          });
        }

        setTimeout(() => {
          if (subWrapper.style.display === "block") {
            subWrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 100);
      };

      if (child.allowMulti) {
        const { controlRow } = this.createMultiSelectControls(child, subWrapper, item, childWrapper);
        subWrapper.appendChild(controlRow);
      }

      child.sub.forEach(subText => {
        const subBtn = Utils.createElement('button', {
          ...styleSettings.buttonBase,
          ...styleSettings.labelStyleGroups.alt,
          marginBottom: '4px'
        }, { textContent: subText });

        subBtn.onclick = () => {
          if (child.allowMulti) {
            const index = selectedItemsRef.indexOf(subText);
            if (index > -1) {
              selectedItemsRef.splice(index, 1);
              Utils.applyStyles(subBtn, {
                ...styleSettings.buttonBase,
                ...styleSettings.labelStyleGroups.alt
              });
            } else {
              selectedItemsRef.push(subText);
              Utils.applyStyles(subBtn, {
                ...styleSettings.buttonBase,
                ...styleSettings.labelStyleGroups.selected
              });
            }
          } else {
            const target = document.querySelector(`.DuplicatesReviewDecision-option-button--${item.action}`);
            if (target) target.click();
            
            const input = DOMHelper.findDecisionInput();
            if (input) {
              DOMHelper.setInputValue(input, `${child.value}${subText ? ": " + subText : ""}`);
            }
            
            subWrapper.style.display = "none";
            childWrapper.style.display = "none";
            DOMHelper.scrollToBottom();
          }
        };
        
        subWrapper.appendChild(subBtn);
      });

      // Update confirm button logic for multi-select
      if (child.allowMulti) {
        const confirmBtn = subWrapper.querySelector('.control-btn');
        if (confirmBtn) {
          confirmBtn.onclick = () => {
            if (selectedItemsRef.length > 0) {
              const target = document.querySelector(`.DuplicatesReviewDecision-option-button--${item.action}`);
              if (target) target.click();
              
              const input = DOMHelper.findDecisionInput();
              if (input) {
                DOMHelper.setInputValue(input, `${child.value}: ${selectedItemsRef.join(', ')}`);
              }
              
              subWrapper.style.display = "none";
              childWrapper.style.display = "none";
              selectedItemsRef = [];
              DOMHelper.scrollToBottom();
            }
          };
        }
      }
    }

    handleSimpleChild(child, childBtn, childWrapper, item) {
      childBtn.onclick = () => {
        const target = document.querySelector(`.DuplicatesReviewDecision-option-button--${item.action}`);
        if (target) target.click();
        
        const input = DOMHelper.findDecisionInput();
        if (input) {
          DOMHelper.setInputValue(input, child.value);
        }
        
        childWrapper.style.display = "none";
        DOMHelper.scrollToBottom();
      };
    }

    renderSimpleButton(item, timerManager) {
      const btn = Utils.createElement('button', {
        ...styleSettings.buttonBase,
        ...this.getLabelStyle(item.label)
      }, { textContent: item.label });
      
      if (item.type === "mpd" || item.type === "iat") {
        btn.style.display = "inline-block";
        btn.style.width = "48%";
        btn.style.marginRight = "2%";
      }
      
      btn.onclick = () => {
        if (item.type === "mpd" || item.type === "iat") {
          this.handleMPDIATClick(item.type, timerManager);
        } else if (item.type === "match") {
          this.handleMatchClick();
        }
      };
      
      this.container.appendChild(btn);
    }
  }

  // ==================== UI MANAGER ====================
  class UIManager {
    constructor(stateManager) {
      this.stateManager = stateManager;
      this.container = null;
      this.elements = {};
      this.timerManager = null;
      this.submitHook = null;
      this.buttonRenderer = null;
      this.updateInterval = null;
    }

    init() {
      this.cleanup();
      Utils.loadFont(CONFIG.FONT_URL);
      this.createContainer();
      this.setupDragging();
      this.createUI();
      this.setupEventListeners();
      this.startAutoUpdate();
      
      return this;
    }

    cleanup() {
      const existing = document.getElementById(CONFIG.CONTAINER_ID);
      if (existing) {
        if (existing._timerManager) {
          existing._timerManager.cleanup();
        }
        if (existing._submitHook) {
          existing._submitHook.cleanup();
        }
        if (existing._updateInterval) {
          clearInterval(existing._updateInterval);
        }
        existing.remove();
      }
    }

    createContainer() {
      this.container = Utils.createElement('div', styleSettings.container, {
        id: CONFIG.CONTAINER_ID
      });
      document.body.appendChild(this.container);
    }

    setupDragging() {
      const state = this.stateManager.getState();
      
      this.container.addEventListener("mousedown", (e) => {
        if (e.target === this.container || !e.target.tagName.match(/INPUT|BUTTON/)) {
          state.ui.isDragging = true;
          state.ui.offsetX = e.clientX - this.container.getBoundingClientRect().left;
          state.ui.offsetY = e.clientY - this.container.getBoundingClientRect().top;
          e.preventDefault();
        }
      });
      
      document.addEventListener("mousemove", (e) => {
        if (state.ui.isDragging) {
          this.container.style.left = `${e.clientX - state.ui.offsetX}px`;
          this.container.style.top = `${e.clientY - state.ui.offsetY}px`;
        }
      });
      
      document.addEventListener("mouseup", () => {
        state.ui.isDragging = false;
      });
    }

    createUI() {
      this.createClassNameText();
      this.createTimerText();
      this.createCounterText();
      this.createKPIText();
      this.createControlButtons();
      this.createButtonsContainer();
    }

    createClassNameText() {
      const state = this.stateManager.getState();
      this.elements.classNameText = Utils.createElement('div', {
        fontSize: '12px',
        color: '#666',
        marginBottom: '5px',
        fontWeight: 'bold'
      }, { innerText: `Class: ${state.config.className}` });
      
      this.container.appendChild(this.elements.classNameText);
    }

    createTimerText() {
      this.elements.timerText = Utils.createElement('div', {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '10px'
      });
      
      this.container.appendChild(this.elements.timerText);
      
      this.timerManager = new TimerManager(this.stateManager, this.elements.timerText);
      this.timerManager.start();
      
      this.container._timerManager = this.timerManager;
    }

    createCounterText() {
      this.elements.counterText = Utils.createElement('div', {
        marginBottom: '5px',
        fontSize: '14px',
        color: '#333'
      });
      
      this.container.appendChild(this.elements.counterText);
    }

    createKPIText() {
      this.elements.kpiText = Utils.createElement('div', {
        marginBottom: '10px',
        fontSize: '14px',
        color: '#666'
      });
      
      this.container.appendChild(this.elements.kpiText);
    }

    createControlButtons() {
      const controlRow = Utils.createElement('div', {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '8px',
        marginBottom: '10px'
      });

      const resetBtn = Utils.createElement('button', {
        ...styleSettings.buttonBase,
        flex: '1'
      }, { 
        innerText: '♻️',
        title: 'Reset số kick'
      });
      resetBtn.onclick = () => this.stateManager.resetCount();

      const minusBtn = Utils.createElement('button', {
        ...styleSettings.buttonBase,
        backgroundColor: '#eee',
        flex: '1'
      }, { innerText: '-1' });
      minusBtn.onclick = () => this.stateManager.decreaseCount();

      const plusBtn = Utils.createElement('button', {
        ...styleSettings.buttonBase,
        backgroundColor: '#eee',
        flex: '1'
      }, { innerText: '+1' });
      plusBtn.onclick = () => this.stateManager.increaseCount();

      const importBtn = Utils.createElement('button', {
        ...styleSettings.buttonBase,
        ...styleSettings.labelStyleGroups.importBtn,
        flex: '1'
      }, { 
        innerText: '📁',
        title: 'Import JSON config cho No Match'
      });

      const fileInput = Utils.createElement('input', { display: 'none' }, {
        type: 'file',
        accept: '.json'
      });

      importBtn.onclick = () => fileInput.click();
      fileInput.onchange = (e) => this.handleFileImport(e);

      controlRow.appendChild(resetBtn);
      controlRow.appendChild(minusBtn);
      controlRow.appendChild(plusBtn);
      controlRow.appendChild(importBtn);
      
      this.container.appendChild(controlRow);
      this.container.appendChild(fileInput);
    }

    createButtonsContainer() {
      this.elements.buttonsContainer = Utils.createElement('div');
      this.container.appendChild(this.elements.buttonsContainer);
      
      this.buttonRenderer = new ButtonRenderer(
        this.stateManager, 
        this.elements.buttonsContainer
      );
      this.buttonRenderer.render(this.timerManager);
    }

    handleFileImport(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          
          if (jsonData.className && jsonData.noMatchConfig && Array.isArray(jsonData.noMatchConfig)) {
            this.stateManager.updateConfig(jsonData.noMatchConfig, jsonData.className);
            this.elements.classNameText.innerText = `Class: ${jsonData.className}`;
            this.buttonRenderer.render(this.timerManager);
            
            console.log(`✅ Đã import thành công config cho class: ${jsonData.className}`);
          } else {
            console.error('❌ File JSON không đúng cấu trúc. Cần có "className" và "noMatchConfig"');
            alert('File JSON không đúng cấu trúc!');
          }
        } catch (error) {
          console.error('❌ Lỗi khi parse JSON:', error);
          alert('Lỗi khi đọc file JSON!');
        }
      };
      
      reader.readAsText(file);
    }

    setupEventListeners() {
      this.stateManager.subscribe((state) => {
        this.updateCounter(state.count);
      });

      this.submitHook = new SubmitHookManager(this.stateManager);
      setTimeout(() => this.submitHook.start(), 1000);
      
      this.container._submitHook = this.submitHook;
    }

    updateCounter(count) {
      this.elements.counterText.innerText = `Bạn đã kick được ${count} ⚡`;
      this.elements.kpiText.innerHTML = KPICalculator.formatKPIText(count);
    }

    startAutoUpdate() {
      this.updateInterval = setInterval(() => {
        const state = this.stateManager.getState();
        this.updateCounter(state.count);
      }, CONFIG.UPDATE_INTERVAL);
      
      this.container._updateInterval = this.updateInterval;
    }
  }

  // ==================== MAIN INITIALIZATION ====================
  try {
    const stateManager = new StateManager();
    const uiManager = new UIManager(stateManager);
    uiManager.init();
    
    console.log("🚀 Optimized Punch Counter initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing Punch Counter:", error);
  }
})();
```
