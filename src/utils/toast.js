import i18n from "@/i18n"; // Import the i18n instance
import "@/assets/scss/toast.scss";
import SwalSuccessIcon from "@/assets/icon/swal_success.svg";
import SwalErrorIcon from "@/assets/icon/swal_error.svg";
import store from "@/store";

const getMessage = (key, variables) => {
  const messagePath = `toast.${key}`;
  const messageExists = i18n.te(messagePath);
  return messageExists ? i18n.t(messagePath, variables) : key;
};

export const showSuccessToast = (
  globalToast,
  messageKey,
  variables = {},
  confirm = false
) => {
  const message = getMessage(messageKey, variables);
  globalToast({
    html: `
      <div class="swal-theme custom-content">
        <div class="custom-svg-icon">
          <img src="${SwalSuccessIcon}" alt="Success Icon" width="42" height="42" />
        </div>
        <span class="custom-message">${message}</span>
      </div>
    `,
    customClass: {
      popup: "custom-success-popup",
    },
    showConfirmButton: confirm,
    position: "bottom-end",
    timer: 2500,
    toast: true,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = globalToast.stopTimer;
      toast.onmouseleave = globalToast.resumeTimer;
    },
  });
};

export const showErrorToast = (
  globalToast,
  messageKey,
  variables = {},
  additionalMessage = "",
  handle
) => {
  let message;
  const user = store.state.user.user;
  const org = store.state.user.orgs;
  if (!user && !org) {
    message = messageKey ?? i18n.t("sessionExpired");
  } else if (additionalMessage === "limitReached") {
    message = `
      ${i18n.t("toast.storageLimit")}
      <a id="connect-account-link" href="#" class="text-link">${i18n.t(
        "toast.connectAnAccount"
      )}</a>
      ${i18n.t("toast.storageCapacity")}
    `;
  } else if (
    typeof additionalMessage === "object" &&
    additionalMessage !== null
  ) {
    message =
      (additionalMessage?.data && additionalMessage?.data[0]?.msg) ||
      additionalMessage?.message ||
      additionalMessage?.errors;
  } else {
    message = additionalMessage || getMessage(messageKey, variables);
  }
  globalToast({
    html: `
      <div class="swal-theme custom-content">
        <div class="custom-svg-icon">
          <img src="${SwalErrorIcon}" alt="Error Icon" width="42" height="42" />
        </div>
        <span class="custom-message">${message}</span>
      </div>
    `,
    customClass: {
      popup: "custom-error-popup",
    },
    showConfirmButton: false,
    position: "bottom-end",
    timer: 2500,
    toast: true,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = globalToast.stopTimer;
      toast.onmouseleave = globalToast.resumeTimer;

      const connectAccountLink = toast.querySelector("#connect-account-link");
      if (connectAccountLink) {
        connectAccountLink.addEventListener("click", (event) => {
          event.preventDefault();
          globalToast.close();
          const connectAccountUrl = `/organizations/${handle}/settings/storage`;
          window.location.href = connectAccountUrl;
        });
      }
    },
  });
};

export const showAlertToast = (globalToast, message) => {
  const swalWithBootstrapButtons = globalToast.mixin({
    toast: true,
    position: "bottom-end",
    timer: 5000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", globalToast.stopTimer);
      toast.addEventListener("mouseleave", globalToast.resumeTimer);
    },
  });

  return swalWithBootstrapButtons
    .fire({
      html: `
          <div class="custom-content">
            <div class="custom-svg-icon">
              <svg width="48" height="50" viewBox="-7 -5 41 41" fill="none" xmlns="http://www.w3.org/2000/svg>
                <g transform="translate(18 17)">
                  <path d="M7.5 12.5L10.5 15.5L16.5 9.5M22 12.5C22 18.0228 17.5228 22.5 12 22.5C6.47715 22.5 2 18.0228 2 12.5C2 6.97715 6.47715 2.5 12 2.5C17.5228 2.5 22 6.97715 22 12.5Z" stroke="#079455" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="12.5" r="14.5" stroke="#C3E8D3" stroke-width="2" />
                  <circle cx="12" cy="12.5" r="18.5" stroke="#C3E8D3" stroke-width="2" opacity="0.5" />
                </g>
              </svg>
            </div>
            <span>${message}</span>
          </div>
        `,
      customClass: {
        container: "custom-success-container",
        popup: "colored-toast",
        timerProgressBar: "custom-timer-bar",
        actions: "custom-footer",
      },
      Text: message,
      showConfirmButton: true,
      showCloseButton: false,
      showCancelButton: true,
      reverseButtons: true,
      cancelButtonText: "Undo",
      cancelButtonAriaLabel: "Undo",
      confirmButtonText: "Close",
      confirmButtonAriaLabel: "Close",
    })
    .then((result) => {
      if (result.isConfirmed) {
        return "Close"; // The user clicked the "Close" button
      } else if (
        result.dismiss === swalWithBootstrapButtons.DismissReason.cancel
      ) {
        return "Undo"; // The user clicked the "Undo" button
      }
    });
};

export const showConfirmationDialog = (
  globalToast,
  title,
  text,
  icon,
  confirmButtonText,
  cancelButtonText
) => {
  const swalWithBootstrapButtons = globalToast.mixin({
    customClass: {
      confirmButton: "btn btn-success",
      cancelButton: "btn btn-danger",
    },
    buttonsStyling: true,
  });
  return swalWithBootstrapButtons.fire({
    icon: icon,
    title: title,
    text: text,
    showCancelButton: true,
    showCloseButton: false,
    confirmButtonText: confirmButtonText,
    cancelButtonText: cancelButtonText,
    reverseButtons: true,
  });
};
