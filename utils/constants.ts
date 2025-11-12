// 1p and others can improperly detect and autofill form fields, use `{...NO_AUTOFILL_PROPS}` to prevent this
export const NO_AUTOFILL_PROPS = {
  autoComplete: "off",
  "data-1p-ignore": true,
  "data-op-ignore": true,
  "data-bwignore": true,
  "data-lpignore": "true",
  "data-form-type": "other",
}
