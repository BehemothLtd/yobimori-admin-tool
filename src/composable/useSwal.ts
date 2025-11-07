import Swal from "sweetalert2";
import type { SweetAlertResult, SweetAlertIcon } from "sweetalert2";

export interface SwalOptions {
  title?: string;
  text?: string;
  html?: string;
  icon?: SweetAlertIcon;
  showCancelButton?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: string;
}

export default function useSwal() {
  async function confirming(options: SwalOptions): Promise<boolean> {
    const defaultOptions: SwalOptions = {
      title: "確認",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "OK",
      cancelButtonText: "キャンセル",
      confirmButtonColor: "#3B82F6",
      ...options,
    };

    const confirmation: SweetAlertResult<any> = await Swal.fire(defaultOptions);

    return confirmation.isConfirmed;
  }

  async function success(options: SwalOptions): Promise<void> {
    await Swal.fire({
      title: options.title || "成功",
      text: options.text,
      icon: "success",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  }

  async function error(options: SwalOptions): Promise<void> {
    await Swal.fire({
      title: options.title || "エラー",
      text: options.text,
      icon: "error",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  }

  return {
    confirming,
    success,
    error,
  };
}
