const siteHeader = `
  <header class="site-header">
    <div class="header-inner">
      <a class="logo" href="./index.html" aria-label="BIGSUM トップページ">
        <img class="logo-image" src="./assets/bigsum_logo.png" alt="BIGSUM" width="2253" height="342" />
      </a>
      <nav class="global-nav" aria-label="グローバルナビゲーション">
        <a href="./index.html">TOP</a>
        <a href="./about.html">私たちについて</a><a href="./services.html">サービス</a>
        <a href="./recruit.html">採用情報</a>
        <a href="./box.html">宅配ボックス購入</a><a class="nav-button" href="./contact.html">お問い合わせ</a>
      </nav>
      <button class="menu-button" type="button" aria-label="メニューを開く" aria-expanded="false"><span></span><span></span></button>
    </div>
  </header>`;

const siteFooter = `
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-brand"><a class="logo" href="./index.html"><img class="logo-image" src="./assets/bigsum_logo.png" alt="BIGSUM" width="2253" height="342" /></a><p>モノを届けるだけではなく、人と人、想いと未来をつなぐ<br>ラストワンマイルのパートナーです。</p></div>
      <div class="footer-column"><h3>私たちについて</h3><a href="./about.html#company">会社概要</a><a href="./about.html#message">代表メッセージ</a><a href="./about.html#philosophy">企業理念</a><a href="./about.html#access">アクセス</a></div>
      <div class="footer-column"><h3>採用情報</h3><a href="./recruit.html#jobs">募集職種</a><a href="./recruit.html#environment">働く環境</a><a href="./recruit.html#faq">よくある質問</a></div>
      <div class="footer-column"><h3>宅配ボックス購入</h3><a href="./box.html#about">Rakuboとは</a><a href="./box.html#products">商品一覧</a></div>
      <div class="footer-column"><h3>お問い合わせ</h3><a href="./contact.html">お問い合わせフォーム</a></div>
    </div>
    <div class="footer-bottom"><small>© 合同会社Big Sum</small><div><a href="./privacy.html">プライバシーポリシー</a><a href="./legal.html">特定商取引法に基づく表記</a></div></div>
  </footer>`;

document.querySelector('[data-site-header]')?.replaceWith(document.createRange().createContextualFragment(siteHeader));
document.querySelector('[data-site-footer]')?.replaceWith(document.createRange().createContextualFragment(siteFooter));
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.global-nav');
const closeMenu = () => {
  nav?.classList.remove('is-open');
  menuButton?.classList.remove('is-open');
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'メニューを開く');
  document.body.classList.remove('menu-open');
};
menuButton?.addEventListener('click', () => {
  const isOpen = !nav?.classList.contains('is-open');
  nav?.classList.toggle('is-open', isOpen);
  menuButton.classList.toggle('is-open', isOpen);
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
  document.body.classList.toggle('menu-open', isOpen);
});
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
