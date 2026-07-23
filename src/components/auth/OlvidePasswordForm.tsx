"use client";

import { useActionState } from "react";
import { requestPasswordResetAction, type OlvidePasswordState } from "@/app/actions/auth";

const initialState: OlvidePasswordState = {};

export function OlvidePasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, initialState);

  if (state.ok) {
    return (
      <p className="text-sm text-green-700">
        ✅ Si ese correo tiene una cuenta registrada, te enviamos un link para crear una contraseña nueva.
        Revisa tu bandeja de entrada (y la carpeta de spam).
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        {pending ? "Enviando…" : "Enviar link de recuperación"}
      </button>
    </form>
  );
}
