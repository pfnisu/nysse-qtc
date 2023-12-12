import ui from './lib/ui.js'
import {Lines} from './lines.js'
import {Stops} from './stops.js'
import {Info} from './info.js'

const api = {
    uri: 'https://api.digitransit.fi/routing/v1/routers/waltti/index/graphql',
    key: {'digitransit-subscription-key': 'aa5775af460f49fe834c01e8206e0431'}
}

ui.bind(
    [new Lines(api), new Stops(api), new Info()],
    document.querySelector('main'),
    document.querySelector('nav'),
    ' | Nysse-aikataulut')
