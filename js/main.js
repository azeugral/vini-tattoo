(function () {
  var d = document;
  var WA = '5541998255010';
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- hero: a peça num quadro; começa no detalhe e se afasta até aparecer inteira ---------- */
  var hero = d.querySelector('.hero'), fotos = [].slice.call(d.querySelectorAll('.ah')), atual = 0;
  requestAnimationFrame(function () { hero.classList.add('pronto'); });
  if (!reduz && fotos.length > 1) {
    var vis = true;
    new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }).observe(hero);
    setInterval(function () {
      if (!vis || d.hidden) return;
      var a = fotos[atual]; atual = (atual + 1) % fotos.length; var b = fotos[atual];
      b.classList.remove('sai'); b.style.animation = 'none'; void b.offsetWidth; b.style.animation = '';
      b.classList.add('on'); a.classList.add('sai'); a.classList.remove('on');
    }, 5000);
  }

  /* ---------- topo e gaveta ---------- */
  var topo = d.getElementById('topo'), gav = d.getElementById('gaveta'), burger = d.getElementById('burger');
  function rolar() { topo.classList.toggle('solido', scrollY > 30 || !gav.hidden); }
  addEventListener('scroll', rolar, { passive: true }); rolar();
  function gaveta(a) { gav.hidden = !a; burger.setAttribute('aria-expanded', a); d.body.style.overflow = a ? 'hidden' : ''; rolar(); }
  burger.addEventListener('click', function () { gaveta(gav.hidden); });
  gav.addEventListener('click', function (e) { if (e.target.closest('a')) gaveta(false); });

  /* ---------- entrada ao rolar: do centro para fora ---------- */
  var io = new IntersectionObserver(function (es) {
    var meio = innerWidth / 2;
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var r = e.boundingClientRect, dist = Math.abs(r.left + r.width / 2 - meio) / meio;
      e.target.style.transitionDelay = Math.round(Math.min(1, dist) * 240) + 'ms';
      e.target.classList.add('vis'); io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -6% 0px' });
  function observar() { d.querySelectorAll('.rev:not(.vis),.item:not(.vis):not(.sai)').forEach(function (el) { io.observe(el); }); }

  /* ---------- festas ---------- */
  var grade = d.getElementById('grade'), mais = d.getElementById('mais'), filtro = 'todos', passoN = 24, limite = passoN;
  PECAS.forEach(function (p, i) {
    var f = d.createElement('figure'); f.className = 'item'; f.tabIndex = 0; f.dataset.i = i;
    f.setAttribute('role', 'button'); f.setAttribute('aria-label', 'Ampliar: ' + p.l);
    f.innerHTML = '<div class="fr"><img src="img/p/' + p.c + '.webp" alt="' + p.l + ', tatuagem de Vini Tattoo" width="720" height="900" draggable="false"></div>';
    grade.appendChild(f);
  });
  var itens = [].slice.call(grade.children);
  function visiveis() { return itens.filter(function (el) { return filtro === 'todos' || PECAS[el.dataset.i].t === filtro; }); }
  function aplicar() {
    var v = visiveis();
    itens.forEach(function (el) { el.classList.add('sai'); });
    v.forEach(function (el, k) { if (k < limite) el.classList.remove('sai'); });
    mais.hidden = v.length <= limite;
    observar();
  }
  aplicar();
  d.querySelectorAll('.filtros button').forEach(function (b) {
    b.addEventListener('click', function () {
      d.querySelectorAll('.filtros button').forEach(function (x) { x.classList.toggle('on', x === b); });
      filtro = b.dataset.f; limite = passoN; aplicar();
      itens.forEach(function (el) { if (!el.classList.contains('sai')) el.classList.add('vis'); });
      grade.animate && grade.animate([{ opacity: .2, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 500, easing: 'cubic-bezier(.16,.84,.32,1)' });
    });
  });
  mais.addEventListener('click', function () { limite += passoN; aplicar(); });

  observar();

  /* lightbox */
  var lb = d.getElementById('lb'), lbImg = d.getElementById('lbImg'), lbTit = d.getElementById('lbTit'), atualLb = 0, lista = [];
  function abrirLb(i) { lista = visiveis().map(function (el) { return +el.dataset.i; }); atualLb = Math.max(0, lista.indexOf(i)); mostrar(); lb.hidden = false; d.body.style.overflow = 'hidden'; }
  function mostrar() { var p = PECAS[lista[atualLb]]; lbImg.src = 'img/g/' + p.c + '.webp'; lbImg.alt = p.l + ', tatuagem de Vini Tattoo'; lbTit.textContent = p.l; }
  function passo(n) { atualLb = (atualLb + n + lista.length) % lista.length; mostrar(); }
  function fechar() { lb.hidden = true; d.body.style.overflow = ''; }
  grade.addEventListener('click', function (e) { var f = e.target.closest('.item'); if (f) abrirLb(+f.dataset.i); });
  grade.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { var f = e.target.closest('.item'); if (f) { e.preventDefault(); abrirLb(+f.dataset.i); } } });
  d.getElementById('lbX').onclick = fechar;
  d.getElementById('lbP').onclick = function () { passo(-1); };
  d.getElementById('lbS').onclick = function () { passo(1); };
  var MAPA = { cor: 'Colorido', preto: 'Preto e cinza', oriental: 'Oriental', black: 'Blackwork e maori', fech: 'Ainda não sei' };
  function marca(n, v) { var r = d.querySelector('input[name="' + n + '"][value="' + v + '"]'); if (r) r.checked = true; }
  d.getElementById('lbQuero').onclick = function () {
    var p = PECAS[lista[atualLb]];
    d.getElementById('ideia').value = 'Quero uma peça como esta do site: ' + p.l + '.';
    marca('estilo', MAPA[p.t]);
    if (p.t === 'fech') d.querySelector('select[name="tamanho"]').value = 'Fechamento';
    fechar();
    d.getElementById('form').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  d.querySelectorAll('[data-cob]').forEach(function (a) { a.addEventListener('click', function () { marca('cob', 'Sim'); }); });
  lb.addEventListener('click', function (e) { if (e.target === lb) fechar(); });
  addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') fechar(); if (e.key === 'ArrowLeft') passo(-1); if (e.key === 'ArrowRight') passo(1);
  });
  var tx = null;
  lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) { if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 45) passo(dx < 0 ? 1 : -1); tx = null; });

  /* ---------- pedido de orçamento pelo WhatsApp ---------- */
  var form = d.getElementById('form'), erro = d.getElementById('erro');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = new FormData(form), nomeC = (f.get('nome') || '').trim();
    if (!nomeC) { erro.hidden = false; form.nome.focus(); return; }
    erro.hidden = true;
    var l = ['Olá, Vini! Sou *' + nomeC + '* e quero um orçamento.', '',
      '*Estilo:* ' + f.get('estilo'), '*Cobertura:* ' + f.get('cob'),
      '*Local do corpo:* ' + ((f.get('local') || '').trim() || 'a definir'),
      '*Tamanho:* ' + f.get('tamanho'), '*Disponibilidade:* ' + f.get('quando')];
    var ideia = (f.get('ideia') || '').trim();
    if (ideia) l.push('', '*Ideia:* ' + ideia);
    l.push('', 'Vou mandar a referência e a foto do local aqui na conversa.', '(pedido enviado pelo site)');
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(l.join('\n')), '_blank', 'noopener');
  });
})();
