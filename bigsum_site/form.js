(() => {
  document.querySelectorAll("[data-contact-form]").forEach((form) => {
    const result = form.querySelector(".form-message");
    const button = form.querySelector('button[type="submit"]');
    const defaultButtonText = button?.textContent || "送信する →";

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const payload = Object.fromEntries(new FormData(form).entries());
      payload.kind = form.dataset.contactForm;
      result?.classList.remove("is-visible", "is-error");
      if (button) {
        button.disabled = true;
        button.textContent = "送信中…";
      }

      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok || !body.ok) throw new Error(body.message || "送信できませんでした。");

        if (result) {
          result.textContent = body.message;
          result.classList.add("is-visible");
        }
        form.reset();
        const quantity = form.querySelector('[name="quantity"]');
        if (quantity) quantity.value = "1";
      } catch (error) {
        if (result) {
          result.textContent = error.message || "送信できませんでした。時間をおいて再度お試しください。";
          result.classList.add("is-visible", "is-error");
        }
      } finally {
        if (button) {
          button.disabled = false;
          button.textContent = defaultButtonText;
        }
      }
    });
  });
})();
