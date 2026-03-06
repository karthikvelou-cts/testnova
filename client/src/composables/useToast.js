import { reactive } from "vue";

const toastState = reactive({
  items: [],
});

let seed = 1;

export const useToast = () => {
  const show = (message, type = "info") => {
    const id = seed++;
    toastState.items.push({ id, message, type });

    setTimeout(() => {
      const index = toastState.items.findIndex((item) => item.id === id);
      if (index !== -1) toastState.items.splice(index, 1);
    }, 3000);
  };

  return {
    toastState,
    show,
  };
};
