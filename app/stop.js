import ui from './lib/ui.js'
import {Search} from './search.js'
import {Timetable} from './timetable.js'

// Parent view of Search and Timetable
export function Stops(l) {
    ui.init(this, l.str.stops)

    this.load = async () => {
        ui.bind([new Search(l), new Timetable(l)], this.tree)
    }

    ui.listen('lang', () => this.name = l.str.stops)
}
