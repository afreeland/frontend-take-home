import { useReducer, useRef } from "react";

enum FETCH_ACTION {
  LOADING = "loading",
  FETCHED = "fetched",
  ERROR = "error",
}

interface State<T> {
  loading: boolean;
  data?: T;
  error?: Error;
}

type Action<T> =
  | { type: FETCH_ACTION.LOADING }
  | { type: FETCH_ACTION.FETCHED; payload: T }
  | { type: FETCH_ACTION.ERROR; payload: Error };

function useLazyFetch<T = unknown>() {
  // Set our initial state for our reducer below
  const initialState = {
    data: undefined,
    loading: false,
    error: undefined,
  };

  // Lets keep track of our request so we can cancel if necessary
  const cancelRequest = useRef<boolean>(false);

  const reducer = (state: State<T>, action: Action<T>): State<T> => {
    switch (action.type) {
      case FETCH_ACTION.LOADING:
        return {
          ...initialState,
          loading: true,
          data: undefined,
          error: undefined,
        };
      case FETCH_ACTION.ERROR:
        console.debug("Error action", action.payload);
        return {
          ...initialState,
          loading: false,
          data: undefined,
          error: action.payload,
        };
      case FETCH_ACTION.FETCHED:
        return {
          ...initialState,
          loading: false,
          data: action.payload,
          error: undefined,
        };
      default:
        return { ...initialState };
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchUrl = async (url: string, options: any) => {
    // If a request was made then we are not trying to cancel it =)
    cancelRequest.current = false;

    // Let us know that we are actively fetching url resource
    dispatch({ type: FETCH_ACTION.LOADING });

    try {
      // Use the parameters provided to actually perform request
      const res = await fetch(url, options);

      // If there was an issue with the request lets inform the requestor
      if (!res.ok) {
        console.debug("Failed to fetch url", url, options, res);
        const errorBody = await res.json();
        dispatch({
          type: FETCH_ACTION.ERROR,
          payload: new Error(
            res.statusText ||
              `Received a ${res.status.toString()} http code => ${JSON.stringify(
                errorBody
              )}`
          ),
        });

        return;
      }

      // Since we know the type we can go ahead cast to the correct type
      const data = (await res.json()) as T;

      // If component was unmounted we no longer need to handle the request
      if (cancelRequest.current) {
        return;
      }
      // Update our state with the latest fetched data
      dispatch({ type: FETCH_ACTION.FETCHED, payload: data });
    } catch (err) {
      console.debug("An error occurred", url, options, err);
      // If component was unmounted we no longer need to handle the request
      if (cancelRequest.current) {
        return;
      }
      // A simple default message for any unknown errors
      let errMessage = "An error has occurred";

      // If we are dealing with an Error type than lets be a little more helpful with our error message
      if (err instanceof Error) {
        errMessage = err.message;
      }

      // Let the user know that an error had occurred
      dispatch({ type: FETCH_ACTION.ERROR, payload: new Error(errMessage) });
    }
  };

  return {
    state,
    fetchUrl,
    cancelFetch: () => {
      cancelRequest.current = true;
    },
  };
}

export default useLazyFetch;
