import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mergeMap';

// Actions
const FETCH = 'students/START_FETCH';
const FETCH_SUCCESS = 'students/FETCH_SUCCESS';
const FETCH_ERROR = 'students/FETCH_ERROR';

// Helpers
const onFetch = state => (
  {
    ...state,
    fetching: true,
  }
);

const onFetchSuccess = (state, action) => (
  {
    ...state,
    data: action.data,
    fetching: false,
  }
);

const onFetchError = (state, action) => (
  {
    ...state,
    fetching: false,
    error: action.error,
  }
);

// Reducer

export default function reducer(state = { fetching: true }, action) {
  switch (action.type) {
    case FETCH:
      return onFetch(state, action);
    case FETCH_SUCCESS:
      return onFetchSuccess(state, action);
    case FETCH_ERROR:
      return onFetchError(state, action);
    default:
      return state;
  }
}

// Action creators

export const fetchStudents = () => (
  {
    type: FETCH,
  }
);

export const fetchStudentsSuccess = data => (
  {
    type: FETCH_SUCCESS,
    data,
  }
);

export const fetchStudentsError = error => (
  {
    type: FETCH_ERROR,
    error,
  }
);

// Epics

const rootUrl = process.env.REACT_APP_API_BASE_URL;

// Un epic es una función que recibe un stream de acciones y devuelve un stream de acciones. Un stream es conocido como Observable en este caso.
// `action$` es una convención de `redux-observable`, que se debe leer como "actions":
export const epic = (action$) => {
  // `action$` es un Observable, que permite filtrar por nombre de acción utilizando el método `ofType`.
  return action$.ofType(FETCH)
    .delay(1000)
    .mergeMap(() => { // mergeMap es una función que toma un callback como parámetro. Este callback debe devolver un observable de RxJS. En este caso, se retorna `Observable.fromPromise()`.
      const promise = fetch(`${rootUrl}/students`, {
        mode: 'cors',
        headers: new Headers({
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }),
      }).then(response => response.json());

      return Observable.fromPromise(promise)
        .map(data => fetchStudentsSuccess(data))
        .catch((error) => {
          console.error(error);
          return Observable.of(fetchStudentsError(error));
        });
    });
};

// Selectors
export const selectStudents = state => state.students;
