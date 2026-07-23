"use client";

import { useActionState } from "react";
import { resetPasswordAction, type RestablecerPasswordState } from "@/app/actions/auth";

const initialState: RestablecerPasswordState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <label htmlFor="passwordNueva" className="block text-sm font-medium text-neutral-700">
          Contraseña nueva
        </label>
        <input
          id="passwordNueva"
          name="passwordNueva"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-neutral-500">Mínimo 8 caracteres.</p>
      </div>
      <div>
        <label htmlFor="passwordConfirmacion" className="block text-sm font-medium text-neutral-700">
          Confirmar contraseña nueva
        </label>
        <input
          id="passwordConfirmacion"
          name="passwordConfirmacion"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        {pending ? "Guardando…" : "Crear contraseña nueva"}
      </button>
    </form>
  );
}
