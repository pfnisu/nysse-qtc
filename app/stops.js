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

    // Format a day offset as YYYYMMDD
    // 0...6 = Sunday - Saturday, null = Closest weekday
    const day = (offset = null) => {
        let dt = new Date()
        const today = dt.getUTCDay() || 7
        offset ??= today < 6 ? today : 8
        dt.setUTCDate(dt.getUTCDate() + offset - today)
        return dt.toJSON().split('T')[0].replaceAll('-', '')
    }
    const dates = { mon: day(), sat: day(6), sun: day(7) }

    // Generate sorted timetable from route timestamps
    const timetable = (data, root) => {
        let table = new Array(24)
        for (const route of data) {
            for (const time of route.stoptimes) {
                const dt = new Date(time.scheduledArrival * 1000).toUTCString()
                const hour = parseInt(dt.substring(17, 19))
                table[hour] ??= []
                table[hour].push({
                    minute: dt.substring(20, 22),
                    route: route.pattern.route.shortName
                })
            }
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

    // Toggle highlight for matching route shortNames
    const highlight = (ev) => {
        const rid = ev ? ev.detail : request.cookie('highlight')
        for (const s of $('span', this, true))
            if (s.textContent === rid || s.classList.contains('hl'))
                s.classList.toggle('hl')
    }

    // Handle focus for Search input
    this.start = () => {
        if (title) document.title = title
        else {
            const input = $('input', this)
            input.value = ''
            input.focus()
        }
    }

    this.load = async () => {
        const sid = request.hash('stop')
        title = null
        if (sid) {
            // Using aliases to get everything in one query
            const json = await request.http(env.uri, 'POST', {
                'query': `{stop(id:"${env.feed}:${sid}"){` +
                    `mon:stoptimesForServiceDate(date:"${dates.mon}"){` +
                        'pattern{route{shortName}}stoptimes{scheduledArrival}}' +
                    `sat:stoptimesForServiceDate(date:"${dates.sat}"){` +
                        'pattern{route{shortName}}stoptimes{scheduledArrival}}' +
                    `sun:stoptimesForServiceDate(date:"${dates.sun}"){` +
                        'pattern{route{shortName}}stoptimes{scheduledArrival}}' +
                    'name zoneId}}'
            }, env.key)
            if (json?.data.stop) {
                title =
                    `${json.data.stop.zoneId} ${sid} ${json.data.stop.name}` +
                    ` | ${document.title}`
                this.tree.innerHTML =
                    `<h2>${json.data.stop.zoneId} ${sid} ${json.data.stop.name}</h2>` +
                    '<table></table>' +
                    `<h2>${l.str.monFri}</h2><table id="mon"><tbody></tbody></table>` +
                    `<h2>${l.str.sat}</h2><table id="sat"><tbody></tbody></table>` +
                    `<h2>${l.str.sun}</h2><table id="sun"><tbody></tbody></table>`
                const fav = document.createElement('ul')
                // Generate favorite list based on cookie matches
                const list = () => {
                    const hid = request.cookie('home')
                    const did = request.cookie('dest')
                    if (sid === hid)
                        return `<li><button id="home">${l.str.home}</button></li>`
                    else if (sid === did)
                        return `<li><button id="dest">${l.str.dest}</button></li>`
                    return `<li><button id="home">${l.str.setHome}</button></li>` +
                        `<li><button id="dest">${l.str.setDest}</button></li>`
                }
                fav.innerHTML = list()
                fav.addEventListener('click', (ev) => {
                    request.cookie(
                        ev.target.id,
                        sid === request.cookie(ev.target.id) ? '' : sid)
                    fav.innerHTML = list()
                    // Notify listeners when favorite stop is set
                    ui.notify('fav')
                })
                $('h2', this).after(fav)

                // Arrivals is a live view, updating separately
                ui.bind([arrivals], $('table', this))

                timetable(json.data.stop.mon, $('#mon>tbody', this))
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
