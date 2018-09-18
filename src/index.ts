import {run} from '@cycle/run'
import {makeDOMDriver} from '@cycle/dom'
import {makeHTTPDriver} from '@cycle/http'

import {App} from './app'

const drivers = {
  DOM: makeDOMDriver('body'),
  HTTP: makeHTTPDriver()
}

// @ts-ignore
run(App, drivers)
