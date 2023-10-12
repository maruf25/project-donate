import Swal from "sweetalert2";

export const showAlert = (title, text, icon = "info") => {
  Swal.fire({
    title,
    text,
    icon,
    theme: "dark",
  });
};
