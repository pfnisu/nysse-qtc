import ui from './lib/ui.js'
import request from './lib/request.js'
import {Lines} from './lines.js'
import {Stops} from './stops.js'
import {Info} from './info.js'

// Language object
const l = {}
const main = async () => {
    l.str = await request.http(`lang/${request.cookie('lang') ?? 'fi'}.json`)
    const stops = new Stops(l)
    ui.bind(
        [new Lines(l, stops.listen), stops, new Info(l)],
        document.querySelector('main'),
        document.querySelector('nav'),
        l.str.title)
}
main()
