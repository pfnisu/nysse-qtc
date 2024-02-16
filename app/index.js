import ui from './lib/ui.js'
import request from './lib/request.js'
import {Lines} from './lines.js'
import {Stops} from './stops.js'
import {Settings} from './settings.js'

const main = async () => {
    // Language object
    const l = {
        str: await request.http(`lang/${request.cookie('lang') || 'fi'}.json`)
    }

    const size = request.cookie('size')
    if (size) document.documentElement.style.setProperty('--size', size)

    // Set highlighted route label from/to cookie
    const highlight = (route = null) => {
        const prev = request.cookie('highlight')
        if (route || prev) {
            if (route === prev) request.cookie('highlight', '')
            else if (route) request.cookie('highlight', route)
            for (const s of document.querySelectorAll('span'))
                if (s.textContent === route || s.textContent === prev)
                    s.classList.toggle('hl')
        }
    }

    const settings = new Settings(l)
    const stops = new Stops(l, settings.listen, highlight)
    ui.bind(
        [new Lines(l, settings.listen, stops.listen), stops, settings],
        document.querySelector('main'),
        document.querySelector('nav'),
        ' | ' + document.title)

    // Toggle highlight for matching shortNames (in Arrivals, List and Stops)
    document.addEventListener('click', (ev) => {
        if (ev.target.classList.contains('route')) highlight(ev.target.textContent)
    }, true)
}
main()
