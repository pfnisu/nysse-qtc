import ui from './lib/ui.js'
import {Lines} from './lines.js'
import {Stops} from './stops.js'
import {Info} from './info.js'

const title = ' | Nysse-aikataulut'
const stops = new Stops(title)
ui.bind(
    [new Lines(stops.listen), stops, new Info()],
    document.querySelector('main'),
    document.querySelector('nav'),
    title)
