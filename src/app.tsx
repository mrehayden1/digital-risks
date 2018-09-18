// TODO Password confirmation validation.

import {DOMSource, VNode} from '@cycle/dom';
import {HTTPSource, RequestInput} from '@cycle/http';
import * as Snabbdom from 'snabbdom-pragma';
import {Stream} from 'xstream';
import xs from 'xstream';
import delay from 'xstream/extra/delay';

type Sources = {
  DOM: DOMSource,
  HTTP: HTTPSource
}

type Sinks = {
  DOM: Stream<VNode>,
  HTTP: Stream<RequestInput>
}

const styles = require('app.scss');
const logo = require('assets/digital_risks_white.png');

export function App(sources: Sources): Sinks {

  const {
    DOM,
    HTTP
  } = sources;

  const ernOptOutChecked$ = DOM
    .select('[name="ern_exempt"]')
    .events('change')
    .fold((acc, _) => !acc, false);

  const submit$ = DOM
    .select('form')
    .events('submit', { preventDefault: true });

  const request$: Stream<RequestInput> = submit$
    .map(event => {
      const form = event.target as HTMLFormElement;
      // Serialize the form
      const data: any = [].reduce.call(form.elements, (data: any, element: HTMLFormElement) => {
        if (element.name) {
          if (element.type === 'checkbox') {
            data[element.name] = element.checked ? 1 : 0;
          }
          else {
            data[element.name] = element.value;
          }
        }
        return data;
      }, {});

      return {
        field: data,
        headers: {
          Accept: "application/json"
        },
        method: 'POST',
        url: 'https://dr-frontend-test-api.herokuapp.com/api/accounts'
      } as RequestInput;
    });

  // @ts-ignore
  const response$ = HTTP.select()
    .flatten()
    .debug()
    .compose(delay(1000))
    .startWith(null);

  const loading$ = xs.merge(
      request$.mapTo(true),
      response$.mapTo(false)
    )
    .startWith(false);

  function combine(
    ernOptOutChecked: boolean,
    loading: boolean,
    response: any
  ) {
    return {
      ernOptOutChecked,
      loading,
      response
    };
  }

  const state$ = xs.combine(
      ernOptOutChecked$,
      loading$,
      response$
    ).map(s => combine.apply(null, s));

  const vtree$ = state$.map(state => {
    const {
      ernOptOutChecked,
      loading,
      response
    } = state;

    return (
      <div>
        {response && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h1>Thank you</h1>
              <p>Your reference: {response.body.ref}</p>
            </div>
          </div>
        )}
        <div className={styles.header}>
          <div className="wrapper">
            <img src={logo} />
            Call us on 0333 772 0759
          </div>
        </div>
        <div className={styles.intro}>
          <div className="wrapper">
            <h1 className={styles.heading}>
              One last step
            </h1>
            <p>
              To save your quote and process your policy, we'll need you to confirm your details
            </p>
          </div>
        </div>
        <form>
          <div className={styles.formBody}>
            <div className="wrapper">
              <fieldset>
                <legend>Your details</legend>
                <div className={styles.fieldgroup}>
                  <label for="title">Title</label>
                  <select name="title">
                    <option>Mr</option>
                    <option>Mrs</option>
                    <option>Ms</option>
                  </select>
                </div>
                <div className={styles.fieldgroup}>
                  <label for="first_name">First name</label>
                  <input name="first_name" type="text" required />
                </div>
                <div className={styles.fieldgroup}>
                  <label for="last_name">Last name</label>
                  <input name="last_name" type="text" required />
                </div>
              </fieldset>
              <fieldset>
                <legend>Your business</legend>
                <div className={styles.fieldgroup}>
                  <label for="ern">Employee ERN</label>
                  <input name="ern" pattern="\d{3}/Az?\d{5}" type="text" required disabled={ernOptOutChecked}/>
                </div>
                <div className={styles.fieldgroup}>
                  <label className={styles.checkbox}>
                    <input name="ern_exempt" type="checkbox" />
                    We're either exempt from having an ERN or we can provide it within 30 days.
                  </label>
                </div>
                <div className={styles.fieldgroup}>
                  <label for="address">Address</label>
                  <textarea name="address" rows="5" required></textarea>
                </div>
              </fieldset>
              <fieldset>
                <legend>Your policy</legend>
                <div className={styles.fieldgroup}>
                  <label for="policy_start_date">Policy start date</label>
                  <input name="policy_start_date" type="date" required />
                </div>
              </fieldset>
              <fieldset>
                <legend>Your account</legend>
                <div className={styles.fieldgroup}>
                  <label for="password">Account password</label>
                  <input name="password" type="password" required />
                </div>
                <div className={styles.fieldgroup}>
                  <label for="password_confirmation">Confirm account password</label>
                  <input name="password_confirmation" type="password" required />
                </div>
              </fieldset>
            </div>
          </div>
          <div className={styles.footer}>
            <div className="wrapper">
              <div></div>
              <button type="submit" disabled={loading}>
                Confirm
                {loading && (
                  <span className="spin">&nbsp;◌</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  });

  return {
    DOM: vtree$,
    HTTP: request$
  };
}
