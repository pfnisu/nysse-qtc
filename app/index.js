import ui, {$} from './lib/ui.js'
import request from './lib/request.js'
import {Lines} from './lines.js'
import {Route} from './route.js'
import {Stops} from './stops.js'
import {Settings} from './settings.js'

const main = async () => {
    // Language object
    const l = {
        str: await request.http(`lang/${request.cookie('lang') || 'fi'}.json`)
    }

    const size = request.cookie('size')
    if (size) document.documentElement.style.setProperty('--size', size)

    ui.bind(
        [new Lines(l, new Route(l)), new Stops(l), new Settings(l)],
        $('main'),
        $('nav'),
        ' | ' + document.title)

    // Notify route highlight events (in Arrivals, List and Stops)
    document.addEventListener('click', (ev) => {
        if (ev.target.classList.contains('route'))
            ui.notify('hl', ev.target.textContent)
    }, true)
}
main()
