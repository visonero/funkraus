// Supabase Auth returns English messages; the site is German, so map known error codes (and, as a fallback,
// message fragments) to German text. Unknown errors get a generic German message instead of raw English.
type AuthErrorLike = { code?: string; message?: string; status?: number } | null | undefined;

const BY_CODE: Record<string, string> = {
  same_password: "Das neue Passwort muss sich vom bisherigen Passwort unterscheiden.",
  weak_password: "Das Passwort ist zu schwach. Bitte wähle mindestens 6 Zeichen und keine leicht zu erratende Kombination.",
  invalid_credentials: "E-Mail-Adresse oder Passwort ist falsch.",
  email_not_confirmed: "Bitte bestätige zuerst deine E-Mail-Adresse über den Link in der Bestätigungs-Mail.",
  user_already_exists: "Mit dieser E-Mail-Adresse existiert bereits ein Konto. Bitte melde dich an.",
  email_exists: "Mit dieser E-Mail-Adresse existiert bereits ein Konto. Bitte melde dich an.",
  over_email_send_rate_limit: "Es wurden zu viele E-Mails angefordert. Bitte warte einige Minuten und versuche es erneut.",
  over_request_rate_limit: "Zu viele Versuche. Bitte warte einen Moment und versuche es erneut.",
  validation_failed: "Bitte prüfe deine Eingaben.",
  email_address_invalid: "Bitte gib eine gültige E-Mail-Adresse ein.",
  signup_disabled: "Die Registrierung ist derzeit nicht möglich.",
  session_not_found: "Deine Sitzung ist abgelaufen. Bitte fordere einen neuen Link an.",
  reauthentication_needed: "Bitte melde dich erneut an, um das Passwort zu ändern.",
};

const BY_MESSAGE: [RegExp, string][] = [
  [/different from the old password/i, BY_CODE.same_password],
  [/invalid login credentials/i, BY_CODE.invalid_credentials],
  [/email not confirmed/i, BY_CODE.email_not_confirmed],
  [/already registered|already exists/i, BY_CODE.user_already_exists],
  [/rate limit|too many/i, BY_CODE.over_email_send_rate_limit],
  [/at least \d+ characters|weak/i, BY_CODE.weak_password],
];

export function germanAuthError(error: AuthErrorLike): string {
  if (error?.code && BY_CODE[error.code]) return BY_CODE[error.code];
  const hit = BY_MESSAGE.find(([pattern]) => pattern.test(error?.message ?? ""));
  return hit ? hit[1] : "Das hat leider nicht geklappt. Bitte versuche es gleich noch einmal.";
}
