import ui from './lib/ui.js'
import request from './lib/request.js'
import {Lines} from './lines.js'
import {Stops} from './stops.js'
import {Settings} from './settings.js'

// Language object
const l = {}

const main = async () => {
    l.str = await request.http(`lang/${request.cookie('lang') || 'fi'}.json`)
    const settings = new Settings(l)
    const stops = new Stops(l, settings.listen)
    ui.bind(
        [new Lines(l, settings.listen, stops.listen), stops, settings],
        document.querySelector('main'),
        document.querySelector('nav'),
        ' | Nysse-qtc')
}
main()
