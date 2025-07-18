(function() {
  const existing = document.getElementById("neo");
  if (existing) existing.remove();

  // Load font Montserrat Alternates
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);

  // Cấu hình mảng
  const arr = [
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
      children: [
        {
          label: "Diff Design",
          value: "Different products/different product type",
          sub: [
            "Different Design", "Different Product", 
            ]
        },
        {
          label: "Vary DSQ",
          value: "Products vary by DSQ/number of pieces included but cannot join on DSQ/number of pieces included per MCJS",
          sub: [

            "Different number of pieces included", "Different Set", "Different DSQ"]
        },
        {
          label: "Vary Material",
          value: "Products vary by material but cannot join by material per MCJS",
          sub: ["Different Material"]
        },
        {
          label: "Vary Size/Cap",
          value: "Products vary by size/capacity but cannot join by size/capacity per MCJS",
          sub: [

            "Different Size", "Different Capacity"
          ]
        },
        {
          label: "Vary Pattern/Print",
          value: "Products vary by pattern/print but cannot join by pattern/print per MCJS",
          sub: ["Different Pattern", "Different Print"]
        },
        {
          label: "Vary Color",
          value: "Products vary by color/finish but cannot join by color/finish per MCJS",
          sub: ["Different Color", "Different Finish"]
        },
        {
          label: "Not Enough",
          value: "Not enough information to make decision (missing imagery/product information)",
          sub: ["Sku is missing size information"]
        },
        {
          label: "Kit/Composite",
          value: "SKU is Kit or Composite",
          sub: ["Sku is a Child SKU", "Sku is a Composite SKU"]
        },
        {
          label: "One-of-a-kind",
          value: "Products vary but option grouping is not allowed for the class"
        },
        {
          label: "Other",
          value: "Products vary by other categories which are not allowed grouping per MCJS",
          sub: [

            "Different Indoor/Outdoor Textures",
            "Different product type (Throw/Euro)",
            "Different product type (Throw/Lumbar)",
            "Different product type (Throw/Floor)",
            "Different product type (Euro/Floor)",
            "Different product type (Euro/Lumbar)",
            "Different product type (Floor/Lumbar)",

            "Different MOQ, MMOQ", "Different Brand Catalog (US/UK)"

          ]
        },
        {
          label: "More than",
          value: "Products vary by more than one category that does not allow grouping per MCJS",
          sub: [

            "Different Pattern", "Different Border",
            "Different Print",
            "Different Color", "Different Finish",
            "Different Size", "Different Capacity",
            "Different Material",
            "Different Set", "Different number of pieces included", "Different DSQ",
            "Different Faucet included", "Different Countertop material"
          ],
          allowMulti: true
        }
      ]
    }
  ];

  // Cấu hình style cải tiến: tách theo nhóm (groups)
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
      border: '1px solid #d9d9d9'
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
    timerText: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '10px'
    },
    subWrapper: {
      maxHeight: '200px',
      overflowY: 'auto',
      marginLeft: '10px',
      border: '1px solid #ddd',
      borderRadius: '5px',
      padding: '5px',
      backgroundColor: '#fafafa'
    },
    // Style theo nhóm để dễ thay đổi
    labelStyleGroups: {
      base: {},
      mpd: { background: '#01768b', color: '#fff' },
      match: { background: '#25ac7f', color: '#fff' },
      optionVariant: { background: '#e7cf00', color: '#fff' },
      noMatch: { background: '#bd081c', color: '#fff' },
      alt: { background: '#ffcfc9', color: '#c2081c' },
      alt2: { background: '#ffe5a0', color: '#ff5a00' },
      alt21: { background: '#ffc8aa', color: '#ff5a00' },
      selected: { background: '#4CAF50', color: '#fff' }, // Style cho nút đã chọn
      multiSelectControl: { background: '#2196F3', color: '#fff' } // Style cho nút điều khiển multi-select
    },
    // Ánh xạ nhãn sang nhóm style
    labelStyleMap: {
      MPD: 'mpd',
      IAT: 'mpd',
      Exact: 'match',
      "Option Variant": 'optionVariant',
      "No Match": 'noMatch',

      // Các nút con của nút "No Match"
      "Some Opt": 'alt21',
      "No Opt": 'alt2',
      "Diff Design": 'alt',
      "Vary DSQ": 'alt',
      "Vary Material": 'alt',
      "Vary Size/Cap": 'alt',
      "Vary Pattern/Print": 'alt',
      "Vary Color": 'alt',
      "Not Enough": 'alt',
      "Kit/Composite": 'alt',
      "One-of-a-kind": 'alt',
      Other: 'alt',
      "More than": 'alt'
    }
  };

  // Hàm lấy style dựa trên nhãn
  function getLabelStyle(label) {
    const group = styleSettings.labelStyleMap[label];
    return group ? styleSettings.labelStyleGroups[group] : styleSettings.labelStyleGroups.base;
  }

  // Tạo container chính
  const div = document.createElement("div");
  div.id = "neo";
  Object.assign(div.style, styleSettings.container);
  div.style.position = "fixed";
  div.style.top = "200px";
  div.style.left = "20px";
  div.style.zIndex = "9999";
  div.style.cursor = "move";
  document.body.appendChild(div);

  // (Phần code xử lý kéo thả, timer, counter... giữ nguyên như cũ)
  let isDragging = false, offsetX = 0, offsetY = 0;
  div.addEventListener("mousedown", function(e) {
    isDragging = true;
    offsetX = e.clientX - div.getBoundingClientRect().left;
    offsetY = e.clientY - div.getBoundingClientRect().top;
    e.preventDefault();
  });
  document.addEventListener("mousemove", function(e) {
    if (isDragging) {
      div.style.left = `${e.clientX - offsetX}px`;
      div.style.top = `${e.clientY - offsetY}px`;
    }
  });
  document.addEventListener("mouseup", () => isDragging = false);

  const timerText = document.createElement('div');
  Object.assign(timerText.style, styleSettings.timerText);
  div.appendChild(timerText);

  let timerInterval = null, timerDuration = 90, timerRemaining = timerDuration;
  function updateTimerDisplay() {
    const m = Math.floor(timerRemaining / 60);
    const s = (timerRemaining % 60).toString().padStart(2, '0');
    timerText.innerText = `⏱️ ${m}:${s}`;
  }
  function startTimer() {
    clearInterval(timerInterval);
    timerRemaining = timerDuration;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
      if (timerRemaining > 0) {
        timerRemaining--;
        updateTimerDisplay();
      } else {
        clearInterval(timerInterval);
        timerText.innerText = "⏱️ Hết giờ!";
      }
    }, 1000);
  }
  startTimer();

  const counterText = document.createElement('div');
  counterText.style.marginBottom = '5px';
  counterText.style.fontSize = '14px';
  counterText.style.color = '#333';
  div.appendChild(counterText);

  // Thêm phần hiển thị KPI
  const kpiText = document.createElement('div');
  kpiText.style.marginBottom = '10px';
  kpiText.style.fontSize = '14px';
  kpiText.style.color = '#666';
  div.appendChild(kpiText);

  // Hàm tính toán KPI
  function calculateKPI() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    let workMinutes = 0;
    
    // Tính số phút đã làm việc
    if (currentHour < 12) {
      // Buổi sáng (7h - 12h)
      workMinutes = (currentHour - 7) * 60 + currentMinute;
    } else if (currentHour >= 13) {
      // Buổi chiều (13h - 17h)
      workMinutes = 5 * 60 + (currentHour - 13) * 60 + currentMinute; // 5h sáng + giờ chiều
    } else {
      // Giờ nghỉ trưa (12h - 13h)
      workMinutes = 5 * 60; // chỉ tính 5h sáng
    }
    
    // Đảm bảo không âm và không vượt quá 8h
    workMinutes = Math.max(0, Math.min(workMinutes, 8 * 60));
    
    // Tính KPI mong đợi (1 cặp mỗi 1.5 phút)
    const expectedKPI = Math.floor(workMinutes / 1.5);
    
    return { workMinutes, expectedKPI };
  }

  const controlRow = document.createElement('div');
  controlRow.style.display = 'flex';
  controlRow.style.justifyContent = 'space-between';
  controlRow.style.gap = '8px';
  controlRow.style.marginBottom = '10px';
  div.appendChild(controlRow);

  const resetBtn = document.createElement('button');
  resetBtn.innerText = '♻️';
  resetBtn.title = "Reset số kick";
  Object.assign(resetBtn.style, styleSettings.buttonBase);
  resetBtn.style.flex = '1';
  controlRow.appendChild(resetBtn);

  const minusBtn = document.createElement('button');
  minusBtn.innerText = '-1';
  Object.assign(minusBtn.style, styleSettings.buttonBase);
  minusBtn.style.backgroundColor = '#eee';
  minusBtn.style.flex = '1';
  controlRow.appendChild(minusBtn);

  const plusBtn = document.createElement('button');
  plusBtn.innerText = '+1';
  Object.assign(plusBtn.style, styleSettings.buttonBase);
  plusBtn.style.backgroundColor = '#eee';
  plusBtn.style.flex = '1';
  controlRow.appendChild(plusBtn);

  const refreshBtn = document.createElement('button');
  refreshBtn.innerText = '🔄';
  Object.assign(refreshBtn.style, styleSettings.buttonBase);
  refreshBtn.style.flex = '1';
  refreshBtn.title = "Làm mới số kick";
  controlRow.appendChild(refreshBtn);

  const getCount = () => parseInt(localStorage.getItem('punchCount')) || 0;
  
  const updateCounter = (n) => {
    counterText.innerText = `Bạn đã kick được ${n} 🦵`;
    
    // Cập nhật KPI
    const { expectedKPI } = calculateKPI();
    const difference = n - expectedKPI;
    
    if (difference >= 0) {
      kpiText.innerHTML = `<span style="color: #4CAF50;">Vượt mục tiêu ${difference} cặp 🎯</span>`;
    } else {
      kpiText.innerHTML = `<span style="color: #f44336;">Còn thiếu ${Math.abs(difference)} cặp 📈</span>`;
    }
  };
  
  const setCount = (n) => {
    localStorage.setItem('punchCount', n);
    updateCounter(n);
  };
  const increaseCount = () => setCount(getCount() + 1);
  const decreaseCount = () => setCount(Math.max(0, getCount() - 1));

  resetBtn.onclick = () => {
    localStorage.removeItem('punchCount');
    updateCounter(0);
  };
  minusBtn.onclick = decreaseCount;
  plusBtn.onclick = increaseCount;
  refreshBtn.onclick = () => updateCounter(getCount());
  
  // Cập nhật KPI mỗi phút
  setInterval(() => {
    updateCounter(getCount());
  }, 60000);
  
  updateCounter(getCount());

  // Hook submit
  const hookSubmit = () => {
    const observer = new MutationObserver(() => {
      document.querySelectorAll('button[data-hb-id="enterprise-button"]').forEach(btn => {
        if (!btn.dataset.punchHooked) {
          btn.addEventListener('click', () => {
            increaseCount();
          });
          btn.dataset.punchHooked = "true";
        }
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  };
  setTimeout(hookSubmit, 1000);

  // Render các nút theo cấu trúc tái cấu trúc
  arr.forEach((item) => {
    if (item.type === "parent") {
      // Nút cha
      const parentBtn = document.createElement("button");
      parentBtn.textContent = item.label;
      Object.assign(parentBtn.style, styleSettings.buttonBase, getLabelStyle(item.label));
      div.appendChild(parentBtn);

      const childWrapper = document.createElement("div");
      childWrapper.style.display = "none";
      childWrapper.style.marginLeft = "10px";
      div.appendChild(childWrapper);

      // Nút con
      item.children.forEach(child => {
        const childBtn = document.createElement("button");
        childBtn.textContent = child.label;
        Object.assign(childBtn.style, styleSettings.buttonBase, getLabelStyle(child.label));
        childWrapper.appendChild(childBtn);

        const subWrapper = document.createElement("div");
        subWrapper.style.display = "none";
        Object.assign(subWrapper.style, styleSettings.subWrapper);
        childWrapper.appendChild(subWrapper);

        // Nếu có sub, tạo thêm nút
        if (child.sub) {
          // Biến để lưu trữ các lựa chọn đã chọn cho multi-select
          let selectedItems = [];

          childBtn.onclick = () => {
            // Toggle hiển thị sub
            subWrapper.style.display = subWrapper.style.display === "none" ? "block" : "none";

            // Reset selected items khi mở lại
            if (subWrapper.style.display === "block") {
              selectedItems = [];
              // Reset style của tất cả sub buttons
              subWrapper.querySelectorAll('button').forEach(btn => {
                if (!btn.classList.contains('control-btn')) {
                  Object.assign(btn.style, styleSettings.buttonBase, styleSettings.labelStyleGroups.alt);
                }
              });
            }

            setTimeout(() => {
              if (subWrapper.style.display === "block") {
                subWrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }
            }, 100);
          };

          // Nếu là "More than" và có allowMulti
          if (child.allowMulti) {
            // Tạo nút điều khiển cho multi-select
            const controlRow = document.createElement('div');
            controlRow.style.display = 'flex';
            controlRow.style.gap = '4px';
            controlRow.style.marginBottom = '8px';
            subWrapper.appendChild(controlRow);

            const confirmBtn = document.createElement('button');
            confirmBtn.textContent = '✓ Confirm';
            confirmBtn.classList.add('control-btn');
            Object.assign(confirmBtn.style, styleSettings.buttonBase, styleSettings.labelStyleGroups.multiSelectControl);
            confirmBtn.style.flex = '1';
            confirmBtn.style.fontSize = '12px';
            confirmBtn.onclick = () => {
              if (selectedItems.length > 0) {
                const target = document.querySelector(`.DuplicatesReviewDecision-option-button--${item.action}`);
                if (target) target.click();
                const input = document.querySelector('.BaseBox-sc-16uwbyc-0.TextInput__StyledInput-sc-1clzs2v-1.gWxvUi');
                if (input) {
                  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                  // Bỏ dòng .sort() để giữ nguyên thứ tự chọn
                  setter.call(input, `${child.value}: ${selectedItems.join(', ')}`);
                  input.dispatchEvent(new Event('input', { bubbles: true }));
                }
                subWrapper.style.display = "none";
                childWrapper.style.display = "none";
                selectedItems = [];
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              }
            };
            controlRow.appendChild(confirmBtn);

            const clearBtn = document.createElement('button');
            clearBtn.textContent = '✗ Clear';
            clearBtn.classList.add('control-btn');
            Object.assign(clearBtn.style, styleSettings.buttonBase, styleSettings.labelStyleGroups.alt);
            clearBtn.style.flex = '1';
            clearBtn.style.fontSize = '12px';
            clearBtn.onclick = () => {
              selectedItems = [];
              subWrapper.querySelectorAll('button').forEach(btn => {
                if (!btn.classList.contains('control-btn')) {
                  Object.assign(btn.style, styleSettings.buttonBase, styleSettings.labelStyleGroups.alt);
                }
              });
            };
            controlRow.appendChild(clearBtn);
          }

          child.sub.forEach(subText => {
            const subBtn = document.createElement("button");
            subBtn.textContent = subText;
            Object.assign(subBtn.style, styleSettings.buttonBase, styleSettings.labelStyleGroups.alt);
            subBtn.style.marginBottom = '4px';

            subBtn.onclick = () => {
              if (child.allowMulti) {
                // Multi-select logic cho "More than"
                const index = selectedItems.indexOf(subText);
                if (index > -1) {
                  // Bỏ chọn
                  selectedItems.splice(index, 1);
                  Object.assign(subBtn.style, styleSettings.buttonBase, styleSettings.labelStyleGroups.alt);
                } else {
                  // Chọn
                  selectedItems.push(subText);
                  Object.assign(subBtn.style, styleSettings.buttonBase, styleSettings.labelStyleGroups.selected);
                }
              } else {
                // Single select logic cho các nút khác
                const target = document.querySelector(`.DuplicatesReviewDecision-option-button--${item.action}`);
                if (target) target.click();
                const input = document.querySelector('.BaseBox-sc-16uwbyc-0.TextInput__StyledInput-sc-1clzs2v-1.gWxvUi');
                if (input) {
                  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                  setter.call(input, `${child.value}${subText ? ": " + subText : ""}`);
                  input.dispatchEvent(new Event('input', { bubbles: true }));
                }
                subWrapper.style.display = "none";
                childWrapper.style.display = "none";
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              }
            };
            subWrapper.appendChild(subBtn);
          });
        } else {
          // Nếu không có sub, thực hiện ngay action
          childBtn.onclick = () => {
            const target = document.querySelector(`.DuplicatesReviewDecision-option-button--${item.action}`);
            if (target) target.click();
            const input = document.querySelector('.BaseBox-sc-16uwbyc-0.TextInput__StyledInput-sc-1clzs2v-1.gWxvUi');
            if (input) {
              const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
              setter.call(input, child.value);
              input.dispatchEvent(new Event('input', { bubbles: true }));
            }
            childWrapper.style.display = "none";
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          };
        }
      });

      parentBtn.onclick = () => {
        childWrapper.style.display = childWrapper.style.display === "none" ? "block" : "none";
      };

    } else {
      const btn = document.createElement("button");
      btn.textContent = item.label;
      Object.assign(btn.style, styleSettings.buttonBase, getLabelStyle(item.label));
      if (item.type === "mpd" || item.type === "iat") {
        btn.style.display = "inline-block";
        btn.style.width = "48%";
        btn.style.marginRight = "2%";
      }
      btn.onclick = () => {
        if (item.type === "mpd" || item.type === "iat") {
          startTimer();
          const link = Array.from(document.querySelectorAll("a")).find(a => a.textContent.includes("Manage Product Descriptions"));
          if (link) {
            const url = new URL(link.href);
            const skus = url.searchParams.get("skus");
            if (skus) {
              const targetUrl = item.type === "mpd"
                ? `https://partners.wayfair.com/v/product_catalog/manage_product_description/index?page_number=1&skus=${skus}`
                : `https://partners.wayfair.com/v/catalog/media/admin/image_association/load_skus?sku_list=${skus}`;
              window.open(targetUrl, "_blank");
            }
          }
        } else if (item.type === "match") {
          // Xóa sạch input trước khi click nút match
          const input = document.querySelector('.BaseBox-sc-16uwbyc-0.TextInput__StyledInput-sc-1clzs2v-1.gWxvUi');
          if (input) {
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
            setter.call(input, ""); // Xóa sạch text
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }
          
          
          const matchBtn = document.querySelector('.DuplicatesReviewDecision-option-button--match');
          if (matchBtn) {
            matchBtn.click();
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          }
        }
      };
      div.appendChild(btn);
    }
  });

  console.log("🚀 Giao diện đã khởi chạy!");
})();
