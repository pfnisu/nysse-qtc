import ui from './lib/ui.js'
import {Lines} from './lines.js'
import {Stops} from './stops.js'
import {Info} from './info.js'

const stops = new Stops()
ui.bind(
    [new Lines(stops.listen), stops, new Info()],
    document.querySelector('main'),
    document.querySelector('nav'),
    ' | Nysse-aikataulut')
