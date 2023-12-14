import ui from './lib/ui.js'
import {Lines} from './lines.js'
import {Stops} from './stops.js'
import {Info} from './info.js'

ui.bind(
    [new Lines(), new Stops(), new Info()],
    document.querySelector('main'),
    document.querySelector('nav'),
    ' | Nysse-aikataulut')
