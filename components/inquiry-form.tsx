"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { formLabels, formSection, formStates, inquiryTypeOptions } from "@/content/he";
import {
  TYPES_WITH_ASKING_PRICE,
  inquiryFormSchema,
  type InquiryFormValues,
  type SubmitResponse,
  type SubmitStatus,
} from "@/lib/inquiry-schema";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FormState = "idle" | "submitting" | Exclude<SubmitStatus, "invalid">;

const defaultValues: InquiryFormValues = {
  fullName: "",
  phone: "",
  email: "",
  inquiryType: undefined as unknown as InquiryFormValues["inquiryType"],
  block: "",
  parcel: "",
  locality: "",
  askingPrice: "",
  details: "",
  website: "",
};

export function InquiryForm() {
  const [state, setState] = useState<FormState>("idle");
  const statusRef = useRef<HTMLDivElement | null>(null);

  /**
   * מזהה הפנייה הלוגית. נוצר ברגע השליחה הראשונה ונשמר זהה בכל ניסיון
   * חוזר, כדי שהיעד יוכל לזהות כפילות. נוצר בלקוח ולא ברינדור, כדי לא
   * לגרום לאי התאמה בהידרציה.
   */
  const submissionIdRef = useRef<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors },
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues,
    mode: "onBlur",
  });

  // useWatch ולא watch: watch מחזיר פונקציה חדשה בכל רינדור, ומונע מ-React
  // Compiler למזכר את הרכיב.
  const inquiryType = useWatch({ control, name: "inquiryType" });
  const showAskingPrice =
    inquiryType !== undefined && TYPES_WITH_ASKING_PRICE.includes(inquiryType);

  // סוג פנייה שאינו רוכש או מוכר מנקה את המחיר, כדי שערך שהוקלד קודם
  // לא יישלח ולא ייפסל בוולידציה משדה שכבר אינו מוצג.
  useEffect(() => {
    if (!showAskingPrice) {
      setValue("askingPrice", "");
    }
  }, [showAskingPrice, setValue]);

  // הודעת מצב מקבלת מיקוד כדי שמשתמשי מקלדת וקוראי מסך יגיעו אליה.
  useEffect(() => {
    if (state !== "idle" && state !== "submitting") {
      statusRef.current?.focus();
    }
  }, [state]);

  async function submitInquiry(values: InquiryFormValues) {
    setState("submitting");
    submissionIdRef.current ??= crypto.randomUUID();

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...values,
          submissionId: submissionIdRef.current,
        }),
      });

      const result = (await response.json().catch(() => null)) as
        | SubmitResponse
        | null;

      if (result?.status === "invalid") {
        for (const [field, message] of Object.entries(
          result.fieldErrors ?? {},
        )) {
          setError(field as keyof InquiryFormValues, { message });
        }
        setState("idle");
        return;
      }

      switch (result?.status) {
        case "accepted":
          setState("accepted");
          return;
        case "failed":
          setState("failed");
          return;
        case "config_error":
          setState("config_error");
          return;
        default:
          // כולל תשובה שלא ניתן לפרש: לא מצהירים על כישלון ודאי.
          setState("unknown");
      }
    } catch {
      // השליחה מהדפדפן נכשלה. לא ניתן לדעת אם הפנייה נקלטה.
      setState("unknown");
    }
  }

  if (state === "accepted") {
    return (
      <StatusPanel
        ref={statusRef}
        tone="success"
        title={formStates.accepted.title}
        body={formStates.accepted.body}
        extra={formSection.paymentNote}
      />
    );
  }

  return (
    <form
      // handleSubmit נקרא בתוך מטפל האירוע ולא ברינדור, כדי שמזהה הפנייה
      // ייקרא רק בזמן שליחה.
      onSubmit={(event) => void handleSubmit(submitInquiry)(event)}
      noValidate
      className="mt-8 grid gap-5"
    >
      <Field
        label={formLabels.fullName}
        error={errors.fullName?.message}
        render={(props) => (
          <Input
            {...props}
            {...register("fullName")}
            autoComplete="name"
            maxLength={80}
          />
        )}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={formLabels.phone}
          error={errors.phone?.message}
          render={(props) => (
            <Input
              {...props}
              {...register("phone")}
              type="tel"
              inputMode="tel"
              dir="ltr"
              autoComplete="tel"
              className="text-start"
            />
          )}
        />
        <Field
          label={formLabels.email}
          error={errors.email?.message}
          render={(props) => (
            <Input
              {...props}
              {...register("email")}
              type="email"
              inputMode="email"
              dir="ltr"
              autoComplete="email"
              className="text-start"
            />
          )}
        />
      </div>

      <InquiryTypeField
        error={errors.inquiryType?.message}
        register={register}
        selected={inquiryType}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={formLabels.block}
          error={errors.block?.message}
          render={(props) => (
            <Input
              {...props}
              {...register("block")}
              inputMode="numeric"
              maxLength={6}
            />
          )}
        />
        <Field
          label={formLabels.parcel}
          error={errors.parcel?.message}
          render={(props) => (
            <Input
              {...props}
              {...register("parcel")}
              inputMode="numeric"
              maxLength={5}
            />
          )}
        />
      </div>

      <Field
        label={formLabels.locality}
        optional
        error={errors.locality?.message}
        render={(props) => (
          <Input {...props} {...register("locality")} maxLength={60} />
        )}
      />

      {showAskingPrice && (
        <Field
          label={formLabels.askingPrice}
          optional
          hint="בשקלים, בספרות בלבד"
          error={errors.askingPrice?.message}
          render={(props) => (
            <Input
              {...props}
              {...register("askingPrice")}
              inputMode="numeric"
              maxLength={12}
            />
          )}
        />
      )}

      <Field
        label={formLabels.details}
        optional
        error={errors.details?.message}
        render={(props) => (
          <Textarea {...props} {...register("details")} rows={4} maxLength={1500} />
        )}
      />

      {/* honeypot. מוסתר מבני אדם ומקוראי מסך, ונבדק בשרת בלבד. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
      >
        <label htmlFor="website">אתר אינטרנט</label>
        <input
          id="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

      <p className="text-muted-foreground text-sm leading-relaxed">
        {formSection.documentsNote}
      </p>

      <Button
        type="submit"
        size="lg"
        disabled={state === "submitting"}
        className="w-full sm:w-auto sm:justify-self-start"
      >
        {state === "submitting" ? formLabels.submitting : formLabels.submit}
      </Button>

      <p className="text-muted-foreground text-sm">{formSection.paymentNote}</p>

      <div aria-live="polite" aria-atomic="true">
        {state === "submitting" && (
          <p className="text-muted-foreground text-sm">
            {formLabels.submitting}
          </p>
        )}
        {state === "failed" && (
          <StatusPanel
            ref={statusRef}
            tone="error"
            title={formStates.failed.title}
            body={formStates.failed.body}
          />
        )}
        {state === "unknown" && (
          <StatusPanel
            ref={statusRef}
            tone="warning"
            title={formStates.unknown.title}
            body={formStates.unknown.body}
            extra={contactFallback()}
          />
        )}
        {state === "config_error" && (
          <StatusPanel
            ref={statusRef}
            tone="error"
            title={formStates.configError.title}
            body={formStates.configError.body}
            extra={contactFallback()}
          />
        )}
      </div>
    </form>
  );
}

/** מוצג רק אם נמסרו פרטי קשר. לא ממציאים דרך התקשרות שאינה קיימת. */
function contactFallback(): string | undefined {
  const channels = [siteConfig.phone, siteConfig.email].filter(Boolean);
  if (channels.length === 0) return undefined;
  return `אפשר גם ליצור קשר ישירות: ${channels.join(" · ")}`;
}

function Field({
  label,
  error,
  optional = false,
  hint,
  render,
}: {
  label: string;
  error?: string;
  optional?: boolean;
  hint?: string;
  render: (props: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby"?: string;
  }) => React.ReactNode;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {optional && (
          <span className="text-muted-foreground font-normal">
            {" "}
            (רשות)
          </span>
        )}
      </Label>
      {render({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}
      {hint && (
        <p id={hintId} className="text-muted-foreground text-xs">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-destructive text-sm">
          {error}
        </p>
      )}
    </div>
  );
}

function InquiryTypeField({
  error,
  register,
  selected,
}: {
  error?: string;
  register: ReturnType<typeof useForm<InquiryFormValues>>["register"];
  selected?: InquiryFormValues["inquiryType"];
}) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <fieldset
      className="grid gap-2"
      aria-describedby={error ? errorId : undefined}
    >
      <legend className="mb-2 text-sm font-medium">
        {formLabels.inquiryType}
      </legend>
      <div className="grid gap-3 sm:grid-cols-3">
        {inquiryTypeOptions.map((option) => {
          const optionId = `${id}-${option.value}`;
          const hintId = `${optionId}-hint`;

          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={cn(
                "border-input has-focus-visible:ring-ring/50 flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors has-focus-visible:ring-[3px]",
                selected === option.value
                  ? "border-primary bg-accent"
                  : "hover:bg-muted/60",
              )}
            >
              <input
                id={optionId}
                type="radio"
                value={option.value}
                aria-describedby={hintId}
                {...register("inquiryType")}
                className="accent-primary mt-1 size-4"
              />
              <span className="grid gap-1">
                <span className="text-sm font-medium">{option.label}</span>
                <span
                  id={hintId}
                  className="text-muted-foreground text-xs leading-relaxed"
                >
                  {option.hint}
                </span>
              </span>
            </label>
          );
        })}
      </div>
      {error && (
        <p id={errorId} className="text-destructive text-sm">
          {error}
        </p>
      )}
    </fieldset>
  );
}

function StatusPanel({
  ref,
  tone,
  title,
  body,
  extra,
}: {
  ref?: React.Ref<HTMLDivElement>;
  tone: "success" | "error" | "warning";
  title: string;
  body: string;
  extra?: string;
}) {
  return (
    <div
      ref={ref}
      role="status"
      tabIndex={-1}
      className={cn(
        "mt-8 rounded-lg border p-6 outline-none",
        tone === "success" && "border-primary/30 bg-accent",
        tone === "warning" && "border-input bg-muted",
        tone === "error" && "border-destructive/30 bg-destructive/5",
      )}
    >
      <p className="font-heading text-lg font-semibold">{title}</p>
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
        {body}
      </p>
      {extra && (
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          {extra}
        </p>
      )}
    </div>
  );
}
