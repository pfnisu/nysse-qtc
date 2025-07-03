import ui, {$} from './lib/ui.js'
import request from './lib/request.js'
import env from '../.env.js'
import {Arrivals} from './arrivals.js'
import {Search} from './search.js'

// Timetables for a stop. Parent view of Arrivals and Search
export function Stops(l) {
    ui.init(this, l.str.stops, 0)
    const arrivals = new Arrivals(l)
    const search = new Search(l)
    let title

    // Set YYYYMMDD dates for current or next weekday, sat and sun
    const week = (() => {
        const dt = new Date()
        const today = dt.getDay()
        // Calculate offsets for stepping days of the Date object
        const [wkd, sat, sun] = today ?
            today < 6 ? [0, 6 - today, 1] : [8 - today, -2, 1] :
            [1, 5, -6]
        const format = (offset) => {
            dt.setDate(dt.getDate() + offset)
            return dt.getFullYear() +
                (dt.getMonth() + 1).toString().padStart(2, '0') +
                dt.getDate().toString().padStart(2, '0')
        }
        return { wkd: format(wkd), sat: format(sat), sun: format(sun) }
    })()

    // Generate sorted timetable from route timestamps
    const timetable = (data, root) => {
        let table = new Array(24)
        for (const route of data)
            for (const time of route.stoptimes) {
                const dt = new Date(time.scheduledArrival * 1000).toUTCString()
                const hour = parseInt(dt.substring(17, 19))
                table[hour] ??= []
                table[hour].push({
                    minute: dt.substring(20, 22),
                    route: route.pattern.route.shortName
                })
            }
        let html = ''
        // Sparse array, iterating as object
        for (const hour in table) {
            table[hour].sort((a, b) => a.minute - b.minute)
            html += `<tr><th>${hour.toString().padStart(2, '0')}</th><td>`
            for (const trip of table[hour])
                html += ` <p>${trip.minute}<span class="route">${trip.route}</span></p>`
            html += '</td></tr>'
        }
        root.innerHTML = html || `<tr><th>${l.str.noTrips}</th></tr>`
    }

    // Toggle highlight for matching route shortNames and set cookie
    // using detail data from Event object
    const highlight = (ev) => {
        const next = ev && ev.detail
        const prev = request.cookie('highlight')
        if (next) request.cookie('highlight', next === prev ? '' : next)
        if (next || prev)
            for (const s of $('span', this, true))
                if (s.textContent === next || s.textContent === prev)
                    s.classList.toggle('hl')
    }

    this.start = () => {
        if (title) document.title = `${title} | ${document.title}`
        else {
            // Handle focus for Search input
            const input = $('input', this)
            input.value = ''
            input.focus()
            search.start(true)
        }
    }

    this.load = async () => {
        const sid = request.hash('stop')
        // Notify latest stop id to Route
        ui.notify('sid', sid)
        title = null
        if (sid) {
            this.tree.innerHTML =
                '<h2></h2><table></table>' +
                `<h2>${l.str.monFri}</h2><table id="wkd"><tbody></tbody></table>` +
                `<h2>${l.str.sat}</h2><table id="sat"><tbody></tbody></table>` +
                `<h2>${l.str.sun}</h2><table id="sun"><tbody></tbody></table>`
            // Arrivals is a live view, updating separately
            ui.bind([arrivals], $('table', this))

            // Using aliases to get everything in one query
            const json = await request.http(env.uri, 'POST', {
                'query': `{stop(id:"${env.feed}:${sid}"){` +
                    `wkd:stoptimesForServiceDate(date:"${week.wkd}",omitNonPickups:true){` +
                        'pattern{route{shortName}}stoptimes{scheduledArrival}}' +
                    `sat:stoptimesForServiceDate(date:"${week.sat}",omitNonPickups:true){` +
                        'pattern{route{shortName}}stoptimes{scheduledArrival}}' +
                    `sun:stoptimesForServiceDate(date:"${week.sun}",omitNonPickups:true){` +
                        'pattern{route{shortName}}stoptimes{scheduledArrival}}' +
                    'name zoneId}}'
            }, env.key)
            if (json?.data.stop) {
                title = `${json.data.stop.zoneId} ${sid} ${json.data.stop.name}`
                $('h2', this).textContent = title
                const fav = document.createElement('ul')
                // Generate favorite controls based on cookie matches
                const controls = () => {
                    if (sid === request.cookie('home'))
                        return `<li><button id="home">${l.str.home}</button></li>`
                    else if (sid === request.cookie('dest'))
                        return `<li><button id="dest">${l.str.dest}</button></li>`
                    return `<li><button id="home">${l.str.setHome}</button></li>` +
                        `<li><button id="dest">${l.str.setDest}</button></li>`
                }
                fav.innerHTML = controls()
                fav.addEventListener('click', (ev) => {
                    request.cookie(
                        ev.target.id,
                        sid === request.cookie(ev.target.id) ? '' : sid)
                    fav.innerHTML = controls()
                    // Notify listeners when favorite stop is set
                    ui.notify('fav')
                })
                $('h2', this).after(fav)

                timetable(json.data.stop.wkd, $('#wkd>tbody', this))
                timetable(json.data.stop.sat, $('#sat>tbody', this))
                timetable(json.data.stop.sun, $('#sun>tbody', this))
                highlight()
            } else this.tree.innerHTML = `<h2>${json ? l.str.badStop : l.str.error}</h2>`
        } else ui.bind([search], this.tree)
    }

    // Update nav title and clear tree when lang changes
    ui.listen('lang', () => {
        this.name = l.str.stops
        this.tree.innerHTML = ''
    })

    ui.listen('hl', highlight)
}
