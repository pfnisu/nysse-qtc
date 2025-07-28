import ui, {$} from './lib/ui.js'
import request from './lib/request.js'
import {Lines} from './lines.js'
import {Route} from './route.js'
import {Stops} from './stops.js'
import {Settings} from './settings.js'

(async () => {
    // Language object
    const l = {
        str: await request.http(`lang/${request.cookie('lang') || 'fi'}.json`)
    }

    const theme = request.cookie('theme')
    if (theme) document.documentElement.className = theme

    const size = request.cookie('size')
    if (size) document.documentElement.style.setProperty('--size', size)

    // Route is initialized here so that pid and sid listeners work
    // with every app entry point
    ui.bind(
        [new Lines(l, new Route(l)), new Stops(l), new Settings(l)],
        $('main'),
        $('nav'),
        ' | ' + document.title)

    // Notify route highlight events (in Arrivals, List and Stops)
    // and set cookie
    document.addEventListener('click', (ev) => {
        if (ev.target.classList.contains('route')) {
            const route = ev.target.textContent
            ui.notify('hl', route)
            request.cookie(
                'highlight',
                route === request.cookie('highlight') ? '' : route)
        }
    }, true)
})()
