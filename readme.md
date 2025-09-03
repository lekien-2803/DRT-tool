```javascript
(function() {
  const existing = document.getElementById("neo");
  if (existing) existing.remove();

  // Load font Montserrat Alternates
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);

  // Default No Match config - sẽ được thay thế khi import JSON
  let defaultNoMatchConfig = [
    {
      label: "Diff Design",
      value: "Different products/different product type",
      sub: [
        "Different Design", "Different Product"
      ]
    },
    {
      label: "Vary DSQ",
      value: "Products vary by DSQ/number of pieces included but cannot join on DSQ/number of pieces included",
      sub: [
        "Different number of pieces included", "Different Set", "Different DSQ"
      ]
    },
    {
      label: "Vary Material",
      value: "Products vary by material but cannot join by material",
      sub: ["Different Material"]
    },
    {
      label: "Vary Size/Cap",
      value: "Products vary by size/capacity but cannot join by size/capacity",
      sub: [
        "Different Size", "Different Capacity"
      ]
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
      value: "Products vary by other categories which are not allowed grouping",
      sub: [
        "Different MOQ, MMOQ", "Different Brand Catalog (US/UK)"
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

  // Hàm tạo cấu hình mảng với No Match config có thể thay đổi
  function createArrayConfig(noMatchConfig = defaultNoMatchConfig) {
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
        children: noMatchConfig
      },
      // Sửa đổi Bad Imagery thành parent với children
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

  // Biến để lưu config hiện tại
  let currentNoMatchConfig = defaultNoMatchConfig;
  let currentClassName = "Default";

  // Cấu hình style cải tiến: tách theo nhóm (groups) - giống code 1
  const styleSettings = {
    container: {
      backgroundColor: '#f4f4f5',
      borderRadius: '10px',
      fontFamily: 'Lexend, sans-serif',
      boxShadow: '0 0 10px rgba(255,255,255,0.2)',
      padding: '10px',
      maxWidth: '300px', // Giống code 1
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
    inputField: {
      width: '100%',
      padding: '8px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '14px',
      marginBottom: '8px',
      boxSizing: 'border-box',
      // Thêm các style để đảm bảo input hoạt động tốt
      outline: 'none',
      transition: 'border-color 0.3s ease'
    },
    confirmButton: {
      width: '100%',
      padding: '8px',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '14px',
      cursor: 'pointer',
      marginBottom: '8px'
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
      selected: { background: '#4CAF50', color: '#fff' },
      multiSelectControl: { background: '#2196F3', color: '#fff' },
      importBtn: { background: '#9C27B0', color: '#fff' },
      // Thêm style cho các nút mới
      badImagery: { background: '#a0a0a0', color: '#fff' },
      joinedIncorrectly: { background: '#a0a0a0', color: '#fff' }
    },
    // Ánh xạ nhãn sang nhóm style
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
      // Thêm mapping cho các nút mới
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

  // Hàm lấy style dựa trên nhãn
  function getLabelStyle(label) {
    const group = styleSettings.labelStyleMap[label];
    return group ? styleSettings.labelStyleGroups[group] : styleSettings.labelStyleGroups.base;
  }

  // Hàm tick checkbox và điền input
  function tickCheckboxAndFillInput(value) {
    // Tìm và tick checkbox
    const checkbox = document.querySelector('input[type="checkbox"]');
    if (checkbox && !checkbox.checked) {
      checkbox.click(); // Click để trigger event
    }
    
    // Đợi một chút để input xuất hiện
    setTimeout(() => {
      const input = document.querySelector('input[placeholder="Which data is wrong for those SKUs?"]');
      if (input) {
        // Set value cho input
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        setter.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, 100);
  }

  // Hàm tạo input field cho SKU và Option - SỬA ĐỔI CHÍNH Ở ĐÂY
  function createAdvancedInputField(child, childWrapper) {
    const inputContainer = document.createElement('div');
    inputContainer.style.marginTop = '8px';
    inputContainer.style.marginBottom = '8px';
    
    // Container cho SKU input (nếu cần)
    if (child.needsSKUInput) {
      const skuLabel = document.createElement('div');
      skuLabel.textContent = 'Nhập SKU:';
      skuLabel.style.fontSize = '12px';
      skuLabel.style.color = '#666';
      skuLabel.style.marginBottom = '4px';
      inputContainer.appendChild(skuLabel);
      
      const skuField = document.createElement('input');
      skuField.type = 'text';
      skuField.placeholder = 'Nhập SKU:';
      skuField.className = 'sku-input';
      Object.assign(skuField.style, styleSettings.inputField);
      
      // THÊM CÁC EVENT LISTENER ĐỂ ĐẢM BẢO INPUT HOẠT ĐỘNG ĐÚNG
      skuField.addEventListener('focus', function(e) {
        e.target.style.borderColor = '#4CAF50';
        e.target.style.boxShadow = '0 0 5px rgba(76, 175, 80, 0.3)';
      });
      
      skuField.addEventListener('blur', function(e) {
        e.target.style.borderColor = '#ccc';
        e.target.style.boxShadow = 'none';
      });
      
      // Đảm bảo click hoạt động
      skuField.addEventListener('mousedown', function(e) {
        e.stopPropagation();
      });
      
      skuField.addEventListener('click', function(e) {
        e.stopPropagation();
        this.focus();
      });
      
      inputContainer.appendChild(skuField);
    }
    
    // Container cho Option input (nếu cần)
    if (child.needsOptionInput) {
      const optionLabel = document.createElement('div');
      optionLabel.textContent = 'Nhập Option Category:';
      optionLabel.style.fontSize = '12px';
      optionLabel.style.color = '#666';
      optionLabel.style.marginBottom = '4px';
      optionLabel.style.marginTop = '8px';
      inputContainer.appendChild(optionLabel);
      
      const optionField = document.createElement('input');
      optionField.type = 'text';
      optionField.placeholder = 'Nhập option category (vd: Color, Size, Material)';
      optionField.className = 'option-input';
      Object.assign(optionField.style, styleSettings.inputField);
      
      // THÊM CÁC EVENT LISTENER TƯƠNG TỰ CHO OPTION INPUT
      optionField.addEventListener('focus', function(e) {
        e.target.style.borderColor = '#4CAF50';
        e.target.style.boxShadow = '0 0 5px rgba(76, 175, 80, 0.3)';
      });
      
      optionField.addEventListener('blur', function(e) {
        e.target.style.borderColor = '#ccc';
        e.target.style.boxShadow = 'none';
      });
      
      // Đảm bảo click hoạt động
      optionField.addEventListener('mousedown', function(e) {
        e.stopPropagation();
      });
      
      optionField.addEventListener('click', function(e) {
        e.stopPropagation();
        this.focus();
      });
      
      inputContainer.appendChild(optionField);
    }
    
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Confirm';
    Object.assign(confirmBtn.style, styleSettings.confirmButton);
    
    // Thêm event listener cho nút confirm
    confirmBtn.addEventListener('mousedown', function(e) {
      e.stopPropagation();
    });
    
    confirmBtn.onclick = () => {
      let finalValue = child.value;
      let isValid = true;
      
      // Validate và thay thế SKU nếu cần
      if (child.needsSKUInput) {
        const skuInput = inputContainer.querySelector('.sku-input');
        const skuValue = skuInput.value.trim();
        if (!skuValue) {
          alert('Please enter a SKU code');
          skuInput.focus();
          isValid = false;
          return;
        }
        finalValue = finalValue.replace('{sku}', skuValue);
      }
      
      // Validate và thay thế Option nếu cần
      if (child.needsOptionInput) {
        const optionInput = inputContainer.querySelector('.option-input');
        const optionValue = optionInput.value.trim();
        if (!optionValue) {
          alert('Please enter an option category');
          optionInput.focus();
          isValid = false;
          return;
        }
        finalValue = finalValue.replace('{option}', optionValue);
      }
      
      if (isValid) {
        tickCheckboxAndFillInput(finalValue);
        childWrapper.style.display = "none";
        
        // Reset inputs
        if (child.needsSKUInput) {
          inputContainer.querySelector('.sku-input').value = '';
        }
        if (child.needsOptionInput) {
          inputContainer.querySelector('.option-input').value = '';
        }
        
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
    };
    
    inputContainer.appendChild(confirmBtn);
    
    // Allow Enter key to confirm trên input cuối cùng
    const inputs = inputContainer.querySelectorAll('input');
    if (inputs.length > 0) {
      const lastInput = inputs[inputs.length - 1];
      lastInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          confirmBtn.click();
        }
      });
      
      // Thêm xử lý Tab để chuyển focus giữa các input
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
    
    return inputContainer;
  }

  // Hàm tạo input field cho SKU (backward compatibility)
  function createSKUInputField(child, childWrapper) {
    return createAdvancedInputField(child, childWrapper);
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

  // Xử lý kéo thả - NGĂN EVENT PROPAGATION
  let isDragging = false, offsetX = 0, offsetY = 0;
  div.addEventListener("mousedown", function(e) {
    // Chỉ kéo thả khi click vào container, không phải các input
    if (e.target === div || (!e.target.tagName.match(/INPUT|BUTTON/))) {
      isDragging = true;
      offsetX = e.clientX - div.getBoundingClientRect().left;
      offsetY = e.clientY - div.getBoundingClientRect().top;
      e.preventDefault();
    }
  });
  
  document.addEventListener("mousemove", function(e) {
    if (isDragging) {
      div.style.left = `${e.clientX - offsetX}px`;
      div.style.top = `${e.clientY - offsetY}px`;
    }
  });
  
  document.addEventListener("mouseup", () => isDragging = false);

  // Hiển thị class hiện tại
  const classNameText = document.createElement('div');
  classNameText.style.fontSize = '12px';
  classNameText.style.color = '#666';
  classNameText.style.marginBottom = '5px';
  classNameText.style.fontWeight = 'bold';
  classNameText.innerText = `Class: ${currentClassName}`;
  div.appendChild(classNameText);

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
    
    if (currentHour < 12) {
      workMinutes = (currentHour - 7) * 60 + currentMinute;
    } else if (currentHour >= 13) {
      workMinutes = 5 * 60 + (currentHour - 13) * 60 + currentMinute;
    } else {
      workMinutes = 5 * 60;
    }
    
    workMinutes = Math.max(0, Math.min(workMinutes, 8 * 60));
    const expectedKPI = Math.floor(workMinutes / 1.5);
    
    return { workMinutes, expectedKPI };
  }

  const controlRow = document.createElement('div');
  controlRow.style.display = 'flex';
  controlRow.style.justifyContent = 'space-between';
  controlRow.style.gap = '8px'; // Giống code 1
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

  // Thay nút refresh bằng nút import JSON
  const importBtn = document.createElement('button');
  importBtn.innerText = '📁';
  importBtn.title = "Import JSON config cho No Match";
  Object.assign(importBtn.style, styleSettings.buttonBase, styleSettings.labelStyleGroups.importBtn);
  importBtn.style.flex = '1';
  controlRow.appendChild(importBtn);

  // Tạo input file ẩn
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json';
  fileInput.style.display = 'none';
  div.appendChild(fileInput);

  // Xử lý import JSON
  importBtn.onclick = () => {
    fileInput.click();
  };

  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target.result);
          
          // Kiểm tra cấu trúc JSON
          if (jsonData.className && jsonData.noMatchConfig && Array.isArray(jsonData.noMatchConfig)) {
            currentNoMatchConfig = jsonData.noMatchConfig;
            currentClassName = jsonData.className;
            
            // Cập nhật hiển thị class name
            classNameText.innerText = `Class: ${currentClassName}`;
            
            // Render lại giao diện với config mới
            renderButtons();
            
            console.log(`✅ Đã import thành công config cho class: ${currentClassName}`);
          } else {
            console.error('❌ File JSON không đúng cấu trúc. Cần có "className" và "noMatchConfig"');
          }
        } catch (error) {
          console.error('❌ Lỗi khi parse JSON:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const getCount = () => parseInt(localStorage.getItem('punchCount')) || 0;
  
  const updateCounter = (n) => {
    counterText.innerText = `Bạn đã kick được ${n} ⚡`;
    
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

  // Container cho các nút chức năng
  const buttonsContainer = document.createElement('div');
  div.appendChild(buttonsContainer);

  // Hàm render các nút
  function renderButtons() {
    // Xóa các nút cũ
    buttonsContainer.innerHTML = '';
    
    const arr = createArrayConfig(currentNoMatchConfig);
    
    // Render các nút theo cấu trúc
    arr.forEach((item) => {
      if (item.type === "parent") {
        // Nút cha
        const parentBtn = document.createElement("button");
        parentBtn.textContent = item.label;
        Object.assign(parentBtn.style, styleSettings.buttonBase, getLabelStyle(item.label));
        buttonsContainer.appendChild(parentBtn);

        const childWrapper = document.createElement("div");
        childWrapper.style.display = "none";
        childWrapper.style.marginLeft = "10px";
        buttonsContainer.appendChild(childWrapper);

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

          // Xử lý click cho nút con
          if (item.action === "bad_imagery" || item.action === "joined_incorrectly") {
            // Xử lý đặc biệt cho "Bad Imagery" và "Joined Incorrectly"
            childBtn.onclick = () => {
              if (child.needsSKUInput || child.needsOptionInput) {
                // Toggle hiển thị input field cho SKU và/hoặc Option
                if (subWrapper.style.display === "none") {
                  subWrapper.innerHTML = ''; // Clear existing content
                  const inputContainer = createAdvancedInputField(child, childWrapper);
                  subWrapper.appendChild(inputContainer);
                  subWrapper.style.display = "block";
                  
                  // Focus vào input field đầu tiên
                  setTimeout(() => {
                    const firstInput = inputContainer.querySelector('input');
                    if (firstInput) {
                      firstInput.focus();
                    }
                  }, 100);
                } else {
                  // Thu gọn lại
                  subWrapper.style.display = "none";
                  subWrapper.innerHTML = ''; // Clear content khi đóng
                }
              } else {
                // Xử lý bình thường cho các option không cần input
                tickCheckboxAndFillInput(child.value);
                childWrapper.style.display = "none";
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              }
            };
          } else if (child.sub) {
            // Logic cũ cho các nút có sub
            let selectedItems = [];

            childBtn.onclick = () => {
              subWrapper.style.display = subWrapper.style.display === "none" ? "block" : "none";

              if (subWrapper.style.display === "block") {
                selectedItems = [];
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
                  const index = selectedItems.indexOf(subText);
                  if (index > -1) {
                    selectedItems.splice(index, 1);
                    Object.assign(subBtn.style, styleSettings.buttonBase, styleSettings.labelStyleGroups.alt);
                  } else {
                    selectedItems.push(subText);
                    Object.assign(subBtn.style, styleSettings.buttonBase, styleSettings.labelStyleGroups.selected);
                  }
                } else {
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
            const input = document.querySelector('.BaseBox-sc-16uwbyc-0.TextInput__StyledInput-sc-1clzs2v-1.gWxvUi');
            if (input) {
              const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
              setter.call(input, "");
              input.dispatchEvent(new Event('input', { bubbles: true }));
            }
            
            const matchBtn = document.querySelector('.DuplicatesReviewDecision-option-button--match');
            if (matchBtn) {
              matchBtn.click();
              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }
          }
        };
        buttonsContainer.appendChild(btn);
      }
    });
  }

  // Render ban đầu
  renderButtons();

  console.log("🚀 Giao diện đã khởi chạy với tính năng input field được cải thiện - click chuột hoạt động bình thường");
})();
```
