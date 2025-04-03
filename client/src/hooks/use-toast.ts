// Inspired by react-hot-toast library
import { useState, useEffect, useCallback } from "react";

export type ToastProps = {
  id?: string; // Make id optional since it's auto-generated if not provided
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
};

export type Toast = ToastProps & {
  id: string;
  open: boolean;
};

const TOAST_LIMIT = 5;
const TOAST_AUTOCLOSE_TIME = 5000;

export type ToasterToast = ToastProps & {
  dismiss: () => void;
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

function generateId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToastProps;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToastProps> & { id: string };
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId: string;
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId: string;
    };

interface State {
  toasts: Toast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [
          { ...action.toast, id: action.toast.id || generateId(), open: true },
          ...state.toasts,
        ].slice(0, TOAST_LIMIT),
      };

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case actionTypes.DISMISS_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toastId ? { ...t, open: false } : t
        ),
      };

    case actionTypes.REMOVE_TOAST:
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };

    default:
      return state;
  }
}

export function useToast() {
  const [state, setState] = useState<State>({ toasts: [] });

  const dismiss = useCallback((toastId?: string) => {
    if (toastId) {
      setState((prevState) => reducer(prevState, { type: actionTypes.DISMISS_TOAST, toastId }));
    } else {
      state.toasts.forEach((toast) => {
        setState((prevState) => reducer(prevState, { type: actionTypes.DISMISS_TOAST, toastId: toast.id }));
      });
    }
  }, [state.toasts]);

  const toast = useCallback(
    ({ ...props }: ToastProps) => {
      const id = props.id || generateId();
      const update = (props: ToastProps) =>
        setState((prevState) =>
          reducer(prevState, {
            type: actionTypes.UPDATE_TOAST,
            toast: { ...props, id },
          })
        );
      const dismiss = () =>
        setState((prevState) =>
          reducer(prevState, { type: actionTypes.DISMISS_TOAST, toastId: id })
        );

      setState((prevState) =>
        reducer(prevState, {
          type: actionTypes.ADD_TOAST,
          toast: { ...props, id },
        })
      );

      return {
        id,
        update,
        dismiss,
      };
    },
    []
  );

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    state.toasts.forEach((t) => {
      if (t.open) {
        const timeout = setTimeout(() => {
          dismiss(t.id);
        }, TOAST_AUTOCLOSE_TIME);
        timeouts.push(timeout);
        toastTimeouts.set(t.id, timeout);
      }
    });

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
      toastTimeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [state.toasts, dismiss]);

  useEffect(() => {
    state.toasts.forEach((toast) => {
      if (!toast.open) {
        const timeout = setTimeout(() => {
          setState((prevState) =>
            reducer(prevState, {
              type: actionTypes.REMOVE_TOAST,
              toastId: toast.id,
            })
          );
        }, 300);

        return () => clearTimeout(timeout);
      }
    });
  }, [state.toasts]);

  return {
    toast,
    dismiss,
    toasts: state.toasts,
  };
}