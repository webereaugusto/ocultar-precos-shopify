Segue um `README.md` prontinho para você subir junto com o código:

---

# Ocultar Preços Altos no Shopify

Este repositório contém um snippet que esconde automaticamente os preços e botões de compra de qualquer produto cujo valor seja **maior ou igual a R$ 100.000,00**, substituindo-os por uma mensagem com link para WhatsApp.

## Como funciona

1. O script percorre o DOM periodicamente.
2. Para cada bloco que exibe um preço, converte o valor exibido (ex.: `R$ 350.000,00 BRL`) para centavos.
3. Se o valor for **≥ R$ 100.000,00**, o script:
   - Oculta todos os elementos de preço.
   - Oculta botões de compra (Add to Cart, Buy Now, etc.).
   - Injeta a mensagem **“📱 Consulte o preço pelo WhatsApp (Clique aqui)”**, com link `wa.me`.
4. Os demais produtos permanecem inalterados.

Não é preciso marcar produtos com tags nem manter listas de handles.

## Instalação

1. Abra o arquivo `layout/theme.liquid` no editor do tema Shopify.
2. Localize o fechamento da tag `</head>`.
3. Cole imediatamente antes o bloco abaixo:

```liquid
{% comment %}
  WhatsApp Hide Price >= R$ 100.000,00 — solução global
{% endcomment %}
<style>
  .whatsapp-price-message {
    margin: 12px 0 !important;
    padding: 14px !important;
    background-color: #f8f9fa !important;
    border-left: 3px solid #25D366 !important;
    border-radius: 6px !important;
    text-align: center !important;
  }
  .whatsapp-price-message p {
    margin: 0 !important;
    color: #333 !important;
    font-weight: bold !important;
    font-size: 14px !important;
  }
</style>

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
```

4. Salve o tema.
5. Faça um `Ctrl + F5` em páginas de produto, coleções e na busca para limpar o cache.

## Personalização

- Se quiser mudar o número do WhatsApp, basta alterar `WHATSAPP_NUMBER`.
- Pode alterar o texto ou o estilo no bloco `<style>`.

## Observações

- O script não depende de tags ou campos personalizados.
- Se algum botão específico de app externo continuar aparecendo, inclua o seletor correspondente em `CART_SELECTORS`.
- Para remover o recurso, basta tirar o bloco do `theme.liquid`.

---

Pronto! Agora é só copiar este `README.md` para o repositório antes de subir.
