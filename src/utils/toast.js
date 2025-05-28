let vm = null;

export function initToast(vueInstance) {
  vm = vueInstance;
}

export function showSuccessToast(message) {
  if (!vm) return;
  vm.$root.$emit("set-snackbar", {
    message,
    color: "success",
    show: true,
  });
}

export function showErrorToast(message) {
  if (!vm) return;
  vm.$root.$emit("set-snackbar", {
    message,
    color: "error",
    show: true,
  });
}

export function showWarningToast(message) {
  if (!vm) return;
  vm.$root.$emit("set-snackbar", {
    message,
    color: "warning",
    show: true,
  });
}

export function showInfoToast(message) {
  if (!vm) return;
  vm.$root.$emit("set-snackbar", {
    message,
    color: "info",
    show: true,
  });
}
