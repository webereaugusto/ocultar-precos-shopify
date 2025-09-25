<script>
document.addEventListener('DOMContentLoaded', function() {
  const THRESHOLD = 10000000; // R$ 100.000,00 em centavos
  const WHATSAPP_NUMBER = '5511916233690';
  const WHATSAPP_MESSAGE = 'Olá! visitei o site e gostaria de informações sobre o produto';

  const PRICE_SELECTORS = [
    '.enj-product-price',
    '.product-price',
    '.price-product',
    '.product__price',
    '.price',
    '[class*="price"]'
  ];

  const CART_SELECTORS = [
    '.add-to-cart',
    '.icon-addcart',
    '.enj-add-to-cart-btn',
    '.engoj-btn-addtocart',
    '.shop-button',
    '.product-form__cart-submit',
    '.shopify-payment-button__button',
    'button[name="add"]',
    'button[type="submit"]',
    '[data-add-to-cart]'
  ];

  const CONTAINER_SELECTORS = [
    '[data-product-handle]',
    '.product',
    '.product-single',
    '.product-details',
    '.product__info-wrapper',
    '.product-info',
    '.info-product',
    '.product-item',
    '.product-item-v1',
    '.product-item-v2',
    '.product-card',
    '.prod_sidebar .product_info'
  ];

  function hideImportant(el) {
    if (!el) return;
    el.style.setProperty('display', 'none', 'important');
    el.style.setProperty('visibility', 'hidden', 'important');
  }

  function parsePrice(text) {
    if (!text) return 0;
    let clean = text.replace(/R\$\s*/gi, '')
                    .replace(/\s*BRL/gi, '')
                    .replace(/\s+/g, ' ')
                    .trim();
    clean = clean.replace(/\./g, '').replace(',', '.');
    const value = parseFloat(clean) * 100;
    return isNaN(value) ? 0 : Math.round(value);
  }

  function findContainer(el) {
    for (const selector of CONTAINER_SELECTORS) {
      const container = el.closest(selector);
      if (container) return container;
    }
    return el.parentElement || el;
  }

  function findPriceEl(container) {
    for (const selector of PRICE_SELECTORS) {
      const priceEl = container.querySelector(selector);
      if (priceEl && /\d/.test(priceEl.textContent)) return priceEl;
    }
    return null;
  }

  function addWhatsappMessage(container, productUrl) {
    if (container.querySelector('.whatsapp-price-message')) return;

    const titleEl = container.querySelector('h1, h2, h3, h4, .title-product, .product-title');
    const productTitle = titleEl ? titleEl.textContent.trim() : 'produto';
    const url = productUrl || container.querySelector('a[href*="/products/"]')?.href || window.location.href;

    const wrapper = document.createElement('div');
    wrapper.className = 'whatsapp-price-message';

    const p = document.createElement('p');
    const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`${WHATSAPP_MESSAGE} ${productTitle} - ${url}`)}`;
    p.innerHTML = `📱 Consulte o preço pelo WhatsApp <a href="${whatsappLink}" target="_blank" rel="noopener" style="color:#25D366;text-decoration:none;font-weight:bold;">(Clique aqui)</a>`;
    wrapper.appendChild(p);

    if (titleEl && titleEl.parentNode) {
      titleEl.parentNode.insertBefore(wrapper, titleEl.nextSibling);
    } else {
      const priceEl = findPriceEl(container);
      if (priceEl && priceEl.parentNode) {
        priceEl.parentNode.insertBefore(wrapper, priceEl.nextSibling);
      } else {
        container.appendChild(wrapper);
      }
    }
  }

  function processContainer(container) {
    if (!container || container.dataset.whatsappDone === 'true') return;

    const priceEl = findPriceEl(container);
    if (!priceEl) return;

    const price = parsePrice(priceEl.textContent || priceEl.innerText);
    if (price < THRESHOLD) {
      container.dataset.whatsappDone = 'true';
      return;
    }

    container.querySelectorAll(PRICE_SELECTORS.join(',')).forEach(hideImportant);
    CART_SELECTORS.forEach(selector => {
      container.querySelectorAll(selector).forEach(hideImportant);
    });

    const productUrl = container.querySelector('a[href*="/products/"]')?.href || window.location.href;
    addWhatsappMessage(container, productUrl);

    container.dataset.whatsappDone = 'true';
  }

  function scanAll() {
    document.querySelectorAll(PRICE_SELECTORS.join(',')).forEach(priceNode => {
      const container = findContainer(priceNode);
      processContainer(container);
    });
  }

  scanAll();
  setInterval(scanAll, 300);

  const observer = new MutationObserver(() => setTimeout(scanAll, 100));
  observer.observe(document.body, { childList: true, subtree: true });
});
</script>
