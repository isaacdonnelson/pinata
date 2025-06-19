<template>
  <div class="loader">
    <span class="loader-pieces-container">
      <img
        src="@/assets/icon/loader/loader-placeholder.svg"
        alt="Loader Placeholder"
        class="loader-piece-placeholder"
      />
      <img
        src="@/assets/icon/loader/loader-piece-0.svg"
        alt="Loader Piece 0"
        class="loader-piece-0"
      />
      <img
        src="@/assets/icon/loader/loader-piece-1.svg"
        alt="Loader Piece 1"
        class="loader-piece-1"
      />
      <img
        src="@/assets/icon/loader/loader-piece-2.svg"
        alt="Loader Piece 2"
        class="loader-piece-2"
      />
    </span>
    <div v-if="showLoadingText" class="message-container">
      <span
        ><slot>{{ $t("loading") }}</slot></span
      >
      <span class="dot-0">.</span>
      <span class="dot-1">.</span>
      <span class="dot-2">.</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "LoaderComponent",
  props: {
    showLoadingText: {
      type: Boolean,
      default: true,
    },
  },
};
</script>

<style lang="scss" scoped>
$duration: 2000ms;

.loader {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  min-height: 100%;
  justify-content: center;
  width: 100%;
  padding-top: 100px;

  .loader-pieces-container {
    position: relative;
    display: inline-flex;
    width: max-content;
    height: max-content;

    .loader-piece-placeholder {
      opacity: 0;
    }

    .loader-piece-0 {
      position: absolute;
      right: 25px;
      bottom: 0;
      opacity: 0;
      animation: piece0 $duration linear forwards;
      animation-iteration-count: infinite;
    }

    .loader-piece-1 {
      position: absolute;
      right: 0;
      bottom: 0;
      opacity: 0;
      animation: piece1 $duration linear forwards;
      animation-iteration-count: infinite;
    }

    .loader-piece-2 {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      opacity: 0;
      animation: piece2 $duration linear forwards;
      animation-iteration-count: infinite;
    }
  }
}

@keyframes piece0 {
  0% {
    opacity: 0;
  }

  20% {
    opacity: 1;
  }

  90% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}

@keyframes piece1 {
  0% {
    opacity: 0;
  }

  20% {
    opacity: 0;
  }

  40% {
    opacity: 1;
  }

  90% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}

@keyframes piece2 {
  0% {
    opacity: 0;
  }

  40% {
    opacity: 0;
  }

  60% {
    opacity: 1;
  }

  90% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}

.message-container {
  margin-top: 24px;
  font-family: Inter;
  font-weight: 500;
  font-size: 20px;
  line-height: 20px;

  .dot-0 {
    animation: piece0 $duration linear forwards;
    animation-iteration-count: infinite;
  }

  .dot-1 {
    animation: piece1 $duration linear forwards;
    animation-iteration-count: infinite;
  }

  .dot-2 {
    animation: piece2 $duration linear forwards;
    animation-iteration-count: infinite;
  }
}
</style>
