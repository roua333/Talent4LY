"use strict";

const FORM_ID = "talent-registration-form";
const TABLE_NAME = "talent4ly_applications";
const MIN_PROJECT_LENGTH = 30;

function getById(id) {
  return document.getElementById(id);
}

function normalizeText(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function normalizeMultiline(value) {
  return String(value ?? "").trim().replace(/\r\n/g, "\n");
}

function isSupabaseConfigured() {
  const config = window.TALENT4LY_SUPABASE;
  return Boolean(config && config.url && config.anonKey);
}

function setFieldError(fieldId, message) {
  const field = getById(fieldId);
  const error = getById(`${fieldId}-error`);

  if (field) {
    field.setAttribute("aria-invalid", message ? "true" : "false");
  }

  if (error) {
    error.textContent = message || "";
    error.classList.toggle("is-visible", Boolean(message));
  }
}

function clearErrors() {
  [
    "full_name",
    "phone",
    "email",
    "core_skills",
    "other_skill",
    "professional_link",
    "best_project_summary",
  ].forEach((fieldId) => setFieldError(fieldId, ""));
}

function getSelectedSkills() {
  return [
    ...document.querySelectorAll(
      'input[name="core_skills"]:checked'
    ),
  ].map((checkbox) => checkbox.value);
}

function isReasonableLibyanPhone(value) {
  const compact = value.replace(/[\s().-]/g, "");

  return /^(?:\+?218|00218|0)?9[1-6]\d{7}$/.test(compact);
}

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" ||
      url.protocol === "http:"
    );
  } catch {
    return false;
  }
}

function validateForm() {
  clearErrors();

  const data = {
    full_name: normalizeText(
      getById("full_name").value
    ),

    phone: normalizeText(
      getById("phone").value
    ),

    email: normalizeText(
      getById("email").value
    ).toLowerCase(),

    core_skills: getSelectedSkills(),

    other_skill: normalizeText(
      getById("other_skill").value
    ),

    professional_link: normalizeText(
      getById("professional_link").value
    ),

    best_project_summary: normalizeMultiline(
      getById("best_project_summary").value
    ),
  };

  let firstInvalid = null;

  function fail(
    fieldId,
    message,
    focusTarget = fieldId
  ) {
    setFieldError(fieldId, message);

    if (!firstInvalid) {
      firstInvalid = getById(focusTarget);
    }
  }

  if (data.full_name.length < 5) {
    fail(
      "full_name",
      "يرجى كتابة الاسم الثلاثي بشكل واضح."
    );
  }

  if (!isReasonableLibyanPhone(data.phone)) {
    fail(
      "phone",
      "يرجى إدخال رقم هاتف ليبي صحيح بصيغة محلية أو دولية."
    );
  }

  const emailInput = getById("email");

  if (
    !data.email ||
    !emailInput.checkValidity()
  ) {
    fail(
      "email",
      "يرجى إدخال بريد إلكتروني صحيح."
    );
  }

  if (data.core_skills.length === 0) {
    fail(
      "core_skills",
      "يرجى اختيار مجال واحد على الأقل.",
      "skills-group"
    );
  }

  if (
    data.core_skills.includes("Other") &&
    data.other_skill.length < 2
  ) {
    fail(
      "other_skill",
      "يرجى كتابة المجال أو المهارة الأخرى."
    );
  }

  if (!isValidHttpUrl(data.professional_link)) {
    fail(
      "professional_link",
      "يرجى إدخال رابط صحيح يبدأ بـ http:// أو https://"
    );
  }

  if (
    data.best_project_summary.length <
    MIN_PROJECT_LENGTH
  ) {
    fail(
      "best_project_summary",
      `يرجى كتابة نبذة أوضح عن المشروع لا تقل عن ${MIN_PROJECT_LENGTH} حرفاً.`
    );
  }

  if (firstInvalid) {
    firstInvalid.focus?.({
      preventScroll: false,
    });

    firstInvalid.scrollIntoView?.({
      behavior: "smooth",
      block: "center",
    });

    return {
      valid: false,
      data: null,
    };
  }

  if (
    !data.core_skills.includes("Other")
  ) {
    data.other_skill = null;
  }

  return {
    valid: true,
    data,
  };
}

function showStatus(
  type,
  arabic,
  english = ""
) {
  const status = getById("form-status");

  if (!status) return;

  status.className =
    `form-status form-status--${type} is-visible`;

  status.innerHTML = "";

  const ar = document.createElement("div");

  ar.textContent = arabic;

  status.appendChild(ar);

  if (english) {
    const en = document.createElement("div");

    en.dir = "ltr";
    en.lang = "en";
    en.textContent = english;

    status.appendChild(en);
  }
}

function clearStatus() {
  const status = getById("form-status");

  if (!status) return;

  status.className = "form-status";
  status.textContent = "";
}

function setSubmitting(isSubmitting) {
  const button = getById("submit-button");

  if (!button) return;

  button.disabled = isSubmitting;

  button.querySelector(
    ".submit-label"
  ).hidden = isSubmitting;

  button.querySelector(
    ".submit-loading"
  ).hidden = !isSubmitting;
}

function initializeOtherSkill() {
  const checkbox = getById(
    "other_skill_checkbox"
  );

  const field = getById(
    "other-skill-field"
  );

  const input = getById(
    "other_skill"
  );

  if (
    !checkbox ||
    !field ||
    !input
  ) {
    return;
  }

  const update = () => {
    field.hidden = !checkbox.checked;

    input.required = checkbox.checked;

    if (!checkbox.checked) {
      input.value = "";

      setFieldError(
        "other_skill",
        ""
      );
    }
  };

  checkbox.addEventListener(
    "change",
    update
  );

  update();
}

function initializeCounter() {
  const textarea = getById(
    "best_project_summary"
  );

  const counter = getById(
    "project-counter"
  );

  if (
    !textarea ||
    !counter
  ) {
    return;
  }

  const update = () => {
    counter.textContent =
      `${textarea.value.length} / ${textarea.maxLength}`;
  };

  textarea.addEventListener(
    "input",
    update
  );

  update();
}

function initializeConfigurationStatus() {
  const status = getById(
    "configuration-status"
  );

  if (!status) return;

  status.classList.toggle(
    "is-visible",
    !isSupabaseConfigured()
  );
}

function initializeLiveErrorClearing() {
  document
    .querySelectorAll(".form-control")
    .forEach((control) => {
      control.addEventListener(
        "input",
        () => {
          setFieldError(
            control.id,
            ""
          );

          clearStatus();
        }
      );
    });

  document
    .querySelectorAll(
      'input[name="core_skills"]'
    )
    .forEach((checkbox) => {
      checkbox.addEventListener(
        "change",
        () => {
          setFieldError(
            "core_skills",
            ""
          );

          clearStatus();
        }
      );
    });
}

async function submitApplication(event) {
  event.preventDefault();

  clearStatus();

  const form =
    event.currentTarget;

  const honeypot =
    form.elements.company_website;

  if (
    honeypot &&
    honeypot.value
  ) {
    return;
  }

  const result =
    validateForm();

  if (!result.valid) return;

  if (!isSupabaseConfigured()) {
    showStatus(
      "error",
      "قاعدة البيانات غير مربوطة بعد. أضيفي Supabase URL وAnon Key في ملف supabase-config.js أولاً.",
      "Database configuration is missing."
    );

    return;
  }

  if (!window.supabase?.createClient) {
    showStatus(
      "error",
      "تعذر تحميل خدمة قاعدة البيانات. يرجى التحقق من اتصال الإنترنت ثم المحاولة مرة أخرى.",
      "The database client could not be loaded. Please check your connection and try again."
    );

    return;
  }

  setSubmitting(true);

  try {
    const config =
      window.TALENT4LY_SUPABASE;

    const client =
      window.supabase.createClient(
        config.url,
        config.anonKey,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        }
      );

    const { error } =
      await client
        .from(TABLE_NAME)
        .insert([
          result.data,
        ]);

    if (error) {
      throw error;
    }

    form.reset();

    initializeOtherSkill();
    initializeCounter();
    clearErrors();

    showStatus(
      "success",
      "تم تسجيل بياناتك بنجاح. شكراً لانضمامك إلى مجتمع FL4AI.",
      "Your information has been submitted successfully. Thank you for joining the FL4AI community."
    );

  } catch (error) {
    console.error(
      "FL4AI registration failed:",
      error
    );

    showStatus(
      "error",
      "حدث خطأ أثناء إرسال البيانات. يرجى المحاولة مرة أخرى.",
      "Something went wrong while submitting your information. Please try again."
    );

  } finally {
    setSubmitting(false);
  }
}

function initializeRegistrationPage() {
  const form =
    getById(FORM_ID);

  if (!form) return;

  initializeOtherSkill();
  initializeCounter();
  initializeConfigurationStatus();
  initializeLiveErrorClearing();

  const year =
    getById("current-year");

  if (year) {
    year.textContent =
      String(
        new Date().getFullYear()
      );
  }

  form.addEventListener(
    "submit",
    submitApplication
  );
}

initializeRegistrationPage();